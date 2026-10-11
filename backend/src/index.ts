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

  const result = await db.query(
    `
      INSERT INTO events (
        slug,
        title,
        slot_minutes,
        required_minutes
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      slug,
      body.title,
      body.slotMinutes,
      body.requiredMinutes,
    ]
  )

  return c.json(result.rows[0], 201)
})

serve({
  fetch: app.fetch,
  port: 8787
}, (info) => {
  console.log(`Server is running on http://localhost:8787`)
})
