import { type InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const users = sqliteTable("users", {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  points: integer().notNull()
})

type IUser = InferSelectModel<typeof users>

export { type IUser, users }
