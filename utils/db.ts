import { mkdir } from "node:fs/promises"

import { Database, SQLiteError } from "bun:sqlite"

import { info } from "@postfmly/logger"

import { desc, eq, sql } from "drizzle-orm"
import { drizzle, type SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"

import { type IQuest, type IUser, quests, users } from "../db/schema.ts"

interface IJustPoints {
  points: number
}

interface IUserPoints extends IJustPoints {
  user: IUser
}

interface IQuestPoints extends IUserPoints {
  quest: IQuest
}

interface IPoints extends IJustPoints {
  questPoints: number
}

let SQLITE: Database | null = null
let DB: SQLiteBunDatabase | null = null
let TEST_DB: SQLiteBunDatabase | null = null

const DEFAULT_MODIFIER: number = 3
const POINTS_MODIFIER: number = isNaN(Number(Bun.env.POINTS_MODIFIER))
  ? DEFAULT_MODIFIER
  : Number(Bun.env.POINTS_MODIFIER)

const QUEST_MAX_DEFAULT: number = 10
const QUEST_MAX: number = isNaN(Number(Bun.env.QUEST_MAX)) ? QUEST_MAX_DEFAULT : Number(Bun.env.QUEST_MAX)
const QUEST_POINTS_DEFAULT: number = 100
const QUEST_POINTS: number = isNaN(Number(Bun.env.QUEST_POINTS)) ? QUEST_POINTS_DEFAULT : Number(Bun.env.QUEST_POINTS)

Bun.env.DB_NAME = Bun.env.DB_NAME || "wordjumblebot.db"
Bun.env.DB_PATH = Bun.env.DB_PATH || "./db/"

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
    client: SQLITE,
    jit: true
  })

  if (Bun.env.NODE_ENV === "test") {
    TEST_DB = DB
  }

  DB.run(
    sql.raw(`
      PRAGMA journal_mode = WAL;
      PRAGMA wal_checkpoint(TRUNCATE);
      PRAGMA foreign_keys = ON;`)
  )

  try {
    await DB.select().from(users)
  } catch (e: unknown) {
    if (e instanceof SQLiteError && e.message.includes("no such table")) {
      if (Bun.env.DEBUG) {
        info("Creating tables")
      }

      DB.run(
        sql.raw(`
          CREATE TABLE users(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            points INTEGER NOT NULL);`)
      )

      DB.run(
        sql.raw(`
          CREATE TABLE quests(
            id INTEGER PRIMARY KEY,
            userId INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            points INTEGER NOT NULL);`)
      )
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

  const [user]: IUser[] | undefined = await DB.select().from(users).where(eq(users.name, name))
  if (!user) {
    return 0
  }

  return user.points
}

const getQuestPoints = async (userId: number): Promise<number> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  const [quest]: IQuest[] | undefined = await DB.select().from(quests).where(eq(quests.userId, userId))
  if (!quest) {
    return 0
  }

  return quest.points
}

const getWordPoints = async (word: string): Promise<number> => {
  return Math.floor(
    word
      .trim()
      .toUpperCase()
      .split("")
      .reduce((sum: number, char: string): number => sum + char.charCodeAt(0), 0) / POINTS_MODIFIER
  )
}

const updateUserPoints = async (id: number, points: number): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.update(users)
    .set({
      points: points
    })
    .where(eq(users.id, id))
}

const resetQuestPoints = async (id: number, name: string): Promise<void> => {
  if (!DB) {
    throw new Error("Database not open")
  }

  await DB.update(quests)
    .set({
      points: 0
    })
    .where(eq(quests.id, id))

  if (Bun.env.DEBUG) {
    info(`Reset quest points for ${name}`)
  }
}

const updatePoints = async (name: string, word: string): Promise<IPoints> => {
  if (!name.length) {
    throw new Error("Invalid name")
  }

  if (!word.length) {
    throw new Error("Invalid word")
  }

  if (!DB) {
    throw new Error("Database not open")
  }

  return await getWordPoints(word)
    .then(async (points: number): Promise<IUserPoints> => {
      const userPoints: number = (await getUserPoints(name)) + points

      const [user]: IUser[] | undefined = await DB!
        .insert(users)
        .values({
          name: name,
          points: userPoints
        })
        .onConflictDoUpdate({
          target: users.name,
          set: {
            points: userPoints
          }
        })
        .returning()

      if (!user) {
        throw new Error("Invalid user")
      }

      return {
        points: points,
        user: user
      } as IUserPoints
    })
    .then(async (userPoints: IUserPoints): Promise<IQuestPoints> => {
      const questPoints: number = (await getQuestPoints(userPoints.user.id)) + 1

      const [quest]: IQuest[] | undefined = await DB!
        .insert(quests)
        .values({
          points: questPoints,
          userId: userPoints.user.id
        })
        .onConflictDoUpdate({
          target: quests.userId,
          set: {
            points: questPoints
          }
        })
        .returning()

      if (!quest) {
        throw new Error("Invalid quest")
      }

      return {
        points: userPoints.points,
        quest: quest,
        user: userPoints.user
      } as IQuestPoints
    })
    .then(async (questPoints: IQuestPoints): Promise<IPoints> => {
      const points: IPoints = {
        points: questPoints.points,
        questPoints: questPoints.quest.points
      } as IPoints

      if (questPoints.quest.points === QUEST_MAX) {
        await updateUserPoints(questPoints.user.id, questPoints.user.points + QUEST_POINTS)

        points.questPoints = 0
        await resetQuestPoints(questPoints.quest.id, questPoints.user.name)
      }

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

export {
  closeDatabase,
  getAll,
  getWordPoints,
  type IPoints,
  openDatabase,
  QUEST_MAX,
  QUEST_POINTS,
  resetPoints,
  TEST_DB,
  updatePoints
}
