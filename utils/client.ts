import { ActivityType, Client, Events, GatewayIntentBits, type Message } from "discord.js"

import { closeDatabase } from "./db.ts"
import { checkWord, RUNNING, stopWord } from "./loadWord.ts"
import { info } from "./logger.ts"
import { SERVER } from "./logo.ts"

let CLIENT: Client | null = null

const shutdown = async (): Promise<void> => {
  info("Shutting down...")
  await closeDatabase()
    .then(async (): Promise<void> => {
      if (RUNNING) {
        await stopWord()
      }
    })
    .then(async (): Promise<void> => CLIENT?.destroy())
    .then(async (): Promise<void> => await SERVER?.stop(true))
    .then((): void => process.exit())
}

const client = async (): Promise<Client> => {
  CLIENT = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    presence: {
      activities: [
        {
          name: "Jumbling...",
          type: ActivityType.Custom
        }
      ]
    }
  })

  CLIENT.on(Events.MessageCreate, async (message: Message): Promise<void> => {
    await checkWord(message)
  })

  process.on("SIGINT", async (): Promise<void> => {
    await shutdown()
  })

  process.on("SIGTERM", async (): Promise<void> => {
    await shutdown()
  })

  return CLIENT
}

const login = async (): Promise<Client> => {
  if (!CLIENT) {
    throw new Error("Invalid client")
  }

  await CLIENT.login(Bun.env.TOKEN)

  if (CLIENT.user && Bun.env.DEBUG) {
    info(`Connected as ${CLIENT.user.displayName} (${CLIENT.user.tag})`)
  }

  return CLIENT
}

export { client, login, shutdown }
