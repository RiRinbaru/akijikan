import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json(
    {
      message: 'hello',
    }
  )
})

serve({
  fetch: app.fetch,
  port: 8787
}, (info) => {
  console.log(`Server is running on http://localhost:8787`)
})
