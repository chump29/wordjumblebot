import { default as assert } from "node:assert/strict"
import { readdir } from "node:fs/promises"
import { default as path } from "node:path"

import { afterAll, beforeAll, describe, expect, mock, spyOn, test } from "bun:test"

import { type Optional } from "@postfmly/types"

import { fakerEN_US as fake } from "@faker-js/faker"
import {
  type APIEmbed,
  type Channel,
  ChannelType,
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type TextChannel,
  type User
} from "discord.js"
import { match } from "ts-pattern"

import { type IPoints, points } from "../../db/schema.ts"
import { author, version } from "../../package.json" with { type: "json" }
import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"
import { WordJumble } from "../../utils/wordJumble.ts"

interface ICommandFile {
  create: () => RESTPostAPIChatInputApplicationCommandsJSONBody
  invoke: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const HEX_BASE = 16
const COLOR_LEN = 6
const decimalToHex = (c: Optional<number>): string => (c ? `#${c.toString(HEX_BASE).padStart(COLOR_LEN, "0")}` : "N/A")

const dir = "events/commands"

const commands = (await readdir(dir)).filter((file: string): boolean => file.endsWith(".ts"))

// * NOTE: suppress console output
spyOn(console, "info").mockImplementation((): void => undefined)

beforeAll(async (): Promise<void> => {
  DB.open()

  assert(DB.instance)

  await DB.instance.delete(points)

  await DB.instance.insert(points).values(
    Array.from(
      { length: fake.number.int({ max: 3, min: 1 }) },
      (): IPoints =>
        ({
          name: fake.internet.username(),
          points: fake.number.int({ max: 100, min: 1 }),
          words: fake.number.int({ max: 9, min: 1 })
        }) satisfies IPoints
    )
  )

  const mockSend = mock<TextChannel["send"]>()

  await WordJumble.init(
    createMock<Client>({
      channels: {
        fetch: createMock<Channel>({
          send: mockSend,
          type: ChannelType.GuildText
        })
      }
    })
  )
})

afterAll((): void => {
  DB.close()
})

await Promise.all(
  commands.map(async (command: string): Promise<void> => {
    const { create, invoke } = (await import(`${path.join("../..", dir)}/${command}`)) satisfies ICommandFile

    const name = path.basename(command, ".ts")

    describe(`/${name}`, (): void => {
      test("create", (): void => {
        const c: RESTPostAPIChatInputApplicationCommandsJSONBody = create()

        expect(c.name).toBe(name)
        expect(c.description).not.toBeEmpty()
        expect(c.contexts ?? []).not.toBeEmpty()
      })

      test("invoke", async (): Promise<void> => {
        const [mockDeferReply, mockEditReply] = [
          mock<ChatInputCommandInteraction["deferReply"]>(),
          mock<ChatInputCommandInteraction["editReply"]>()
        ]

        expect(
          await invoke(
            createMock<ChatInputCommandInteraction>({
              createdTimestamp: fake.date.past().getTime(),
              deferReply: mockDeferReply,
              editReply: mockEditReply,
              user: createMock<User>({
                displayName: fake.internet.displayName(),
                username: fake.internet.username()
              }),
              options: {
                getString: mock().mockReturnValue("all")
              }
            })
          )
        ).toBeUndefined()

        expect(mockDeferReply).toHaveBeenCalledOnce()
        expect(mockEditReply).toHaveBeenCalledOnce()

        const payload = mockEditReply.mock.calls[0]?.[0]
        if (!payload || typeof payload !== "object") {
          throw new Error("Payload not found")
        }

        const isEmbed = (e: unknown): e is APIEmbed => typeof e === "object" && e !== null && !Array.isArray(e)

        let data: APIEmbed
        if ("embeds" in payload && Array.isArray(payload.embeds)) {
          const [firstEmbed] = payload.embeds
          if (!isEmbed(firstEmbed)) {
            throw new Error("Embed not found")
          }

          ;({ data } = EmbedBuilder.from(firstEmbed))
        }

        let content = ""
        if ("content" in payload && typeof payload.content === "string") {
          ;({ content } = payload)
        }

        match<string, void>(name)
          .with("info", (): void => {
            expect(decimalToHex(data.color)).toBe(env.COLOR)
            expect(data.author?.icon_url).toBe(env.LOGO_URL)
            expect(data.author?.name).toBe(`${env.NAME} v${version}`)
            expect(data.thumbnail?.url).toBe(env.LOGO_URL)
            expect(data.description).not.toBeEmpty()
            expect(data.footer?.text).toEndWith(author.name)
          })
          .with("leaderboard", (): void => {
            expect(decimalToHex(data.color)).toBe(env.COLOR)
            expect(data.title).not.toBeEmpty()
            expect(data.fields).not.toBeUndefined()
            expect(data.fields).not.toBeEmpty()
          })
          .with("ping", (): void => expect(content).toInclude("Pong"))
          .with("reset", (): void => expect(content).toInclude("Reset"))
          .with("status", (): void => expect(content).toInclude("Listening"))
          .with("word", (): void => expect(content).toInclude("New"))
          .otherwise((): never => {
            throw new Error(`Payload tests not found for /${name}`)
          })
      })
    })
  })
)
