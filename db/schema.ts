import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

const points = sqliteTable("points", {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  points: integer().notNull(),
  words: integer().notNull()
})

type IPoints = Omit<typeof points.$inferInsert, "id">

export { type IPoints, points }
