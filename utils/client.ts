import { default as process } from "node:process"

import { error, info } from "@postfmly/logger"
import { type ILogoServerConfig, LogoServer } from "@postfmly/logoserver"

import { ActivityType, Client as DiscordClient, Events, GatewayIntentBits, type Message } from "discord.js"

import { loadCommands } from "../events/loadCommands.ts"
import { DB } from "./db.ts"
import { env } from "./env.ts"
import { WordJumble } from "./wordJumble.ts"

interface IWordJumbleClient {
  init: (testClient?: DiscordClient) => Promise<DiscordClient>
  shutdown: (event?: string) => Promise<void>
}

class WordJumbleClient implements IWordJumbleClient {
  private CLIENT!: DiscordClient

  private LOGO_SERVER!: LogoServer

  private isShutdown: boolean = true

  async shutdown(event?: string): Promise<void> {
    if (this.isShutdown) {
      return
    }

    if (event && env.DEBUG) {
      info(`❌ ${event} detected`)
    }

    info("🔴 Shutting down...")

    await this.CLIENT.destroy()

    await this.LOGO_SERVER.stop()

    DB.close()

    this.isShutdown = true

    process.exit(0)
  }

  private async login(): Promise<void> {
    await this.CLIENT.login(env.TOKEN)

    if (this.CLIENT.user && env.DEBUG) {
      info(`⚡ Connected as ${this.CLIENT.user.displayName} (${this.CLIENT.user.tag})`)
    }
  }

  async init(testClient?: DiscordClient): Promise<DiscordClient> {
    this.LOGO_SERVER = new LogoServer({
      DEBUG: env.DEBUG,
      LOGO_NAME: env.LOGO_NAME,
      LOGO_PATH: env.LOGO_PATH,
      LOGO_PORT: env.LOGO_PORT
    } as ILogoServerConfig)

    await this.LOGO_SERVER.start()

    this.CLIENT =
      testClient ??
      new DiscordClient({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ],
        presence: {
          activities: [
            {
              name: `${env.ACTIVITY}...`,
              type: ActivityType.Custom
            }
          ]
        }
      })

    for (const event of ["SIGINT", "SIGTERM"]) {
      process.on(event, (e: string): void => {
        this.shutdown(e).catch((err: unknown) => {
          error("❌ Error during shutdown", err)

          process.exit(1)
        })
      })
    }

    this.CLIENT.on(Events.MessageCreate, async (message: Message): Promise<void> => {
      await WordJumble.checkForWord(message)
    })

    await loadCommands(this.CLIENT)

    await this.login()

    this.isShutdown = false

    return this.CLIENT
  }
}

const Client: IWordJumbleClient = new WordJumbleClient()

export { Client }
