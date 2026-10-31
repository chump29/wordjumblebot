import { join } from "node:path"

import { Database } from "bun:sqlite"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { desc, eq, gt, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { type IPoints, points } from "../db/schema.ts"
import { env } from "./env.ts"

type DBType = ReturnType<typeof drizzle>

interface IWordJumbleBotDatabase {
  close: () => void
  getLeaderboard: () => Promise<IPoints[]>
  getWordPoints: (word: string) => number
  /** For direct DB operations */
  readonly instance: Nullable<DBType>
  open: () => void
  resetPoints: (name?: string) => Promise<void>
  updatePoints: (name: string, word: string) => Promise<void>
}

class WordJumbleBotDatabase implements IWordJumbleBotDatabase {
  private client: Nullable<Database> = null
  instance: Nullable<DBType> = null

  open(): void {
    if (this.instance) {
      if (env.DEBUG) {
        info("⚠️  Database already open")
      }

      return
    }

    const dbPathName = join(env.DB_PATH, env.DB_NAME)

    this.client = new Database(dbPathName, {
      create: true,
      strict: true
    })

    this.client.run(`
      PRAGMA busy_timeout = 3000;
      PRAGMA foreign_keys = 0;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA wal_checkpoint(TRUNCATE);
    `)

    this.instance = drizzle({
      client: this.client,
      jit: true
    })

    migrate(this.instance, {
      migrationsFolder: env.DB_PATH
    })

    if (env.DEBUG) {
      info(`▶️  Using database: ${dbPathName}`)
    }
  }

  close(): void {
    if (!this.instance) {
      if (env.DEBUG) {
        info("⚠️  Database already closed")
      }

      return
    }

    this.client?.close()
    this.client = null

    this.instance = null

    if (env.DEBUG) {
      info("⏹️  Database closed")
    }
  }

  private dbCheck(): DBType {
    if (!this.instance) {
      throw new Error("Database not open")
    }

    return this.instance
  }

  // biome-ignore lint/style/useThisInClassMethods: not making static
  getWordPoints(word: string): number {
    return Math.floor(
      word
        .trim()
        .toUpperCase()
        .split("")
        .reduce((sum: number, char: string): number => sum + char.charCodeAt(0), 0) / env.POINTS_MODIFIER
    )
  }

  async updatePoints(name: string, word: string): Promise<void> {
    const pts = this.getWordPoints(word)

    await this.dbCheck()
      .insert(points)
      .values({ name, points: pts, words: 1 })
      .onConflictDoUpdate({
        target: points.name,
        set: {
          points: sql`CASE
            WHEN ${points.words} + 1 == ${env.QUEST_WORDS} THEN ${points.points} + ${pts} + ${env.QUEST_POINTS}
            ELSE ${points.points} + ${pts}
          END`,
          words: sql`CASE
            WHEN ${points.words} + 1 < ${env.QUEST_WORDS} THEN ${points.words} + 1
            ELSE 1
          END`
        }
      })
  }

  // * /reset <@name|all>
  async resetPoints(name?: string): Promise<void> {
    const query = this.dbCheck().update(points).set({ points: 0 })

    if (name) {
      query.where(eq(points.name, name))
    }

    await query
  }

  // * /leaderboard
  async getLeaderboard(): Promise<IPoints[]> {
    return await this.dbCheck().select().from(points).where(gt(points.points, 0)).orderBy(desc(points.points)).limit(10)
  }
}

export const DB = new WordJumbleBotDatabase()
