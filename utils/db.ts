import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { desc, eq } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"

import { type IUser, users } from "../db/schema.ts"
import { info } from "./logger.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null

const openDatabase = async (): Promise<void> => {
  await mkdir(Bun.env.DB_PATH, {
    recursive: true
  })

  const DB_STR: string = `${Bun.env.DB_PATH}${Bun.env.DB_NAME}`
  SQLITE = new Database(DB_STR, {
    create: true,
    strict: true
  })
  DB = drizzle({
    client: SQLITE
  })
  DB.run("PRAGMA journal_mode = WAL;")
  DB.run("PRAGMA wal_checkpoint(TRUNCATE);")

  try {
    await DB.select().from(users)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables...")
      }

      const table: string = `
      CREATE TABLE users(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        points INTEGER NOT NULL
      )`
      SQLITE.run(table)
    } else {
      throw e
    }
  }

  if (Bun.env.DEBUG) {
    info(`Using database: ${DB_STR}`)
  }
}

const getPoints = async (name: string): Promise<number> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  const user: IUser[] = await DB.select().from(users).where(eq(users.name, name)).limit(1)
  if (!user[0]) {
    return 0
  }

  return user[0].points
}

const updatePoints = async (name: string): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.insert(users)
    .values({
      name: name,
      points: 1
    })
    .onConflictDoUpdate({
      target: users.name,
      set: {
        points: (await getPoints(name)) + (isNaN(Number(Bun.env.POINTS)) ? 1 : Number(Bun.env.POINTS))
      }
    })
}

const getAll = async (): Promise<IUser[]> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  return await DB.select().from(users).orderBy(desc(users.points))
}

const resetPoints = async (name: string | null = null): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  const tx = DB.update(users).set({
    points: 0
  })
  if (name) {
    tx.where(eq(users.name, name)).run()
  } else {
    tx.run()
  }
}

const closeDatabase = async (): Promise<void> => {
  SQLITE?.close()
}

export { closeDatabase, getAll, openDatabase, resetPoints, updatePoints }
