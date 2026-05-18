import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import * as schema from './schema.ts'

const databasePath = process.env.DATABASE_URL ?? './sqlite.db'

const sqlite = new Database(databasePath)

export const db = drizzle(sqlite, { schema })
