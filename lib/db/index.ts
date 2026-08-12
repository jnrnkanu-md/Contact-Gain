import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Strip the libpq-style sslmode param (pg 8.23 warns it will change meaning)
// and configure SSL explicitly instead.
const connectionString = (process.env.DATABASE_URL ?? '').replace(
  /([?&])sslmode=[^&]*/,
  '$1',
)

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})
export const db = drizzle(pool, { schema })
