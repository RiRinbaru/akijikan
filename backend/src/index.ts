import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './db.js'

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

serve({
  fetch: app.fetch,
  port: 8787
}, (info) => {
  console.log(`Server is running on http://localhost:8787`)
})
