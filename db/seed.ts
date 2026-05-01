import { closeDatabase, openDatabase, resetDB, seedDB } from "../utils/db.ts"
import { info } from "../utils/logger.ts"

await openDatabase()
  .then(async (): Promise<void> => await resetDB())
  .then(async (): Promise<void> => await seedDB())
  .then(async (): Promise<void> => await closeDatabase())

info("Database seeded")
