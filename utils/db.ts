import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { desc, eq } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"

import { type IUser, users } from "../db/schema.ts"
import { info } from "./logger.ts"

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null

const DEFAULT_MODIFIER: number = 0.25
const POINTS_MODIFIER: number = isNaN(Number(Bun.env.POINTS_MODIFIER))
  ? DEFAULT_MODIFIER
  : Number(Bun.env.POINTS_MODIFIER)

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

const getUserPoints = async (name: string): Promise<number> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  const user: IUser[] = await DB.select().from(users).where(eq(users.name, name)).limit(1)
  if (!user[0]) {
    return 0
  }

  return user[0].points
}

const getWordPoints = async (word: string): Promise<number> => {
  return Math.floor(
    word.split("").reduce((sum: number, char: string): number => sum + char.charCodeAt(0), 0) * POINTS_MODIFIER
  )
}

const updatePoints = async (name: string, word: string): Promise<number> => {
  if (!name.length) {
    throw new Error("Invalid name")
  }

  if (!word.length) {
    throw new Error("Invalid word")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  return await getWordPoints(word).then(async (points: number): Promise<number> => {
    await DB!
      .insert(users)
      .values({
        name: name,
        points: points
      })
      .onConflictDoUpdate({
        target: users.name,
        set: {
          points: (await getUserPoints(name)) + points
        }
      })

    return points
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

export { closeDatabase, getAll, getWordPoints, openDatabase, resetPoints, updatePoints }
