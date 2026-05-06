import { type Client } from "discord.js"

import { error, info } from "@postfmly/logger"

import { loadCommands } from "./events/loadCommands.ts"
import { client, login, shutdown } from "./utils/client.ts"
import { openDatabase } from "./utils/db.ts"
import { loadSettings, startWord } from "./utils/loadWord.ts"
import { logo } from "./utils/logo.ts"

Bun.env.DEBUG = Bun.env.IS_DEBUG === "true" ? true : false

await openDatabase()
  .then(async (): Promise<void> => await loadCommands(await client()))
  .then(async (): Promise<Client> => await login())
  .then(async (client: Client): Promise<void> => await loadSettings(client))
  .then(async (): Promise<void> => await logo())
  .then((): void => info("Running..."))
  .then(async (): Promise<void> => {
    if (Bun.env.AUTOSTART === "true") {
      await startWord()
    }
  })
  .catch(async (e: unknown): Promise<void> => {
    error(e)
    await shutdown("ERROR")
  })
