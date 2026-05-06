import { describe, expect, jest, mock, spyOn, test } from "bun:test"

import {
  type ActivitiesOptions,
  ActivityType,
  type Client,
  type ClientUser,
  Events,
  GatewayIntentBits,
  type IntentsBitField,
  type Message,
  type OmitPartialGroupDMChannel
} from "discord.js"

import { fake } from "@nano-faker/patterns"
import { mocked } from "jest-mock"

import { client, login, shutdown } from "./client.ts"
import { checkWord, startWord } from "./loadWord.ts"

const ID_LEN: number = 26
const TS_LEN: number = 6
const HMAC_LEN: number = 38

describe("client", (): void => {
  spyOn(process, "exit").mockImplementation((code: number): never => {
    throw new Error(code.toString())
  })

  test("shutdown", async (): Promise<void> => {
    mock.module("./loadWord.ts", (): unknown => {
      return {
        newWord: jest.fn(),
        stopWord: jest.fn()
      }
    })

    await startWord()

    mock.module("./db.ts", (): unknown => {
      return {
        closeDatabase: jest.fn().mockResolvedValue(null)
      }
    })

    expect(async (): Promise<void> => await shutdown("TEST")).toThrowError("0")
  })

  test("login fail - client", (): void => {
    expect(login()).rejects.toThrowError("Invalid CLIENT")
  })

  test("client", async (): Promise<void> => {
    const clientObj: Client = await client()
    expect(clientObj).not.toBeUndefined()

    mock.module("./loadWord.ts", (): unknown => {
      return {
        checkWord: jest.fn()
      }
    })
    const checkWordMock: jest.Mock = mocked(checkWord)
    clientObj.emit(Events.MessageCreate, {} as OmitPartialGroupDMChannel<Message>)
    expect(checkWordMock).toHaveBeenCalled()

    const intents: IntentsBitField = clientObj.options.intents
    expect(intents.toArray().length).toBeGreaterThan(0)
    const allIntents: GatewayIntentBits[] = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
    expect(allIntents.every((intent: GatewayIntentBits): boolean => intents.has(intent))).toBeTrue()

    const activities: ActivitiesOptions | undefined = clientObj.options.presence?.activities?.at(0)
    expect(activities).not.toBeUndefined()
    expect(activities!.name === "Jumbling...").toBeTrue()
    expect(activities!.type === ActivityType.Custom).toBeTrue()
  })

  test("login fail - token", (): void => {
    expect(login()).rejects.toThrowError("Invalid TOKEN")
  })

  test("login pass", async (): Promise<void> => {
    mock.module("./client.ts", (): unknown => {
      return {
        CLIENT: {
          login: jest.fn(),
          user: {
            displayName: Bun.env.NAME,
            tag: `${Bun.env.NAME}#${fake("####")}`
          } as ClientUser
        } as unknown as Client
      }
    })

    Bun.env.TOKEN = fake(`${"*".repeat(ID_LEN)}.${"*".repeat(TS_LEN)}.${"*".repeat(HMAC_LEN)}`)

    const loginObj: Client = await login()
    expect(loginObj).not.toBeUndefined()
    expect(loginObj.user?.displayName === Bun.env.NAME).toBeTrue()
  })
})
