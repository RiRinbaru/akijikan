import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './db.js'
import { randomBytes } from 'node:crypto'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json(
    {
      message: 'hello',
    }
  )
})

app.get('/api/db-check', async (c) => {
  const result = await db.query(
    'SELECT current_database(), current_user'
  )

  return c.json(result.rows[0])
})

app.post('/api/events', async (c) => {
  const body = await c.req.json()

  const slug = randomBytes(12).toString('base64url')

  const client = await db.connect()

  try {
    await client.query('BEGIN')

    const eventResult = await client.query(
      `
        INSERT INTO events (
          slug,
          title,
          start_date,
          end_date,
          required_minutes
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        slug,
        body.title,
        body.startDate,
        body.endDate,
        body.requiredMinutes ?? null,
      ]
    )

    const event = eventResult.rows[0]

    for (const window of body.windows) {
      await client.query(
        `
          INSERT INTO event_windows (
            event_id,
            start_at,
            end_at
          )
          VALUES ($1, $2, $3)
        `,
        [
          event.id,
          window.startAt,
          window.endAt,
        ]
      )
    }

    await client.query('COMMIT')

    return c.json(event, 201)

  } catch (error) {
    await client.query('ROLLBACK')
    throw error

  } finally {
    client.release()
  }
})

app.get('/api/events/:slug', async (c) => {
  const slug = c.req.param('slug')

  const eventResult = await db.query(
    `
      SELECT *
      FROM events
      WHERE slug = $1
    `,
    [slug]
  )

  if (eventResult.rows.length === 0) {
    return c.json(
      { message: 'Event not found' },
      404
    )
  }

  const event = eventResult.rows[0]

  const windowsResult = await db.query(
    `
      SELECT id, start_at, end_at
      FROM event_windows
      WHERE event_id = $1
      ORDER BY start_at
    `,
    [event.id]
  )

  return c.json({
    ...event,
    windows: windowsResult.rows,
  })
})

serve({
  fetch: app.fetch,
  port: 8787
}, (info) => {
  console.log(`Server is running on http://localhost:8787`)
})
