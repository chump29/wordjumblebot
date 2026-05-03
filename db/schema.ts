import { type InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const users = sqliteTable("users", {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  points: integer().notNull()
})

type IUser = InferSelectModel<typeof users>

const quests = sqliteTable("quests", {
  id: integer().primaryKey(),
  points: integer().notNull(),
  userId: integer()
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
})

type IQuest = InferSelectModel<typeof quests>

export { type IQuest, type IUser, quests, users }
