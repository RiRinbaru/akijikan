import 'dotenv/config'
import { Pool, types } from 'pg'

types.setTypeParser(1082, (value) => value)

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
})