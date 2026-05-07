import { describe, expect, jest, mock, test } from "bun:test"

import {
  type ChannelManager,
  type Client,
  type GuildMember,
  type Message,
  type TextChannel,
  type User
} from "discord.js"

import { range } from "@nano-faker/number"
import { fake } from "@nano-faker/patterns"
import { fullName } from "@nano-faker/person"

import { type IPoints } from "./db.ts"
import { COUNT, checkWord, loadSettings, newWord, RUNNING, startWord, stopWord, WORD } from "./loadWord.ts"

const ID_LEN: number = 19

const MIN_POINTS: number = 100
const MAX_POINTS: number = 200

describe("loadWords", (): void => {
  mock.module("./loadWords.ts", () => {
    return {
      CHANNEL: {} as TextChannel
    }
  })

  const message: Message = {
    id: fake("#".repeat(ID_LEN)),
    member: {
      user: {
        bot: false,
        displayName: fullName()
      } as User
    } as GuildMember
  } as Message

  const channel: TextChannel = {
    bulkDelete: jest.fn().mockResolvedValue(new Set([])),
    id: fake("#".repeat(ID_LEN)),
    send: jest.fn().mockResolvedValue(message)
  } as unknown as TextChannel
  const channelManager: ChannelManager = {
    cache: new Map([
      [
        channel.id,
        channel
      ]
    ]),
    fetch: jest.fn().mockResolvedValue(channel)
  } as unknown as ChannelManager
  const client: Client = {
    channels: channelManager
  } as Client

  test("loadSettings", async (): Promise<void> => {
    await loadSettings(client)

    expect(COUNT).toBeGreaterThan(0)
  })

  test("loadSettings - no client", async (): Promise<void> => {
    // biome-ignore lint/suspicious/noExplicitAny: for testing
    expect(async (): Promise<void> => await loadSettings(null as any)).toThrowError("Invalid client")
  })

  test("loadSettings - no words", async (): Promise<void> => {
    mock.module("@wordlist/english-eff/all", (): unknown => {
      return {
        all: []
      }
    })

    expect(async (): Promise<void> => await loadSettings(client)).toThrowError("No words")
  })

  test("newWord", async (): Promise<void> => {
    await newWord()

    expect(WORD).not.toBeNull()
    expect(WORD!.length).toBeGreaterThan(0)
  })

  test("checkWord", async (): Promise<void> => {
    message.content = WORD as string

    mock.module("./db.ts", (): unknown => {
      return {
        updatePoints: jest.fn().mockResolvedValue({
          points: range(MIN_POINTS, MAX_POINTS),
          questPoints: 0
        } as IPoints)
      }
    })

    await checkWord(message)

    expect(WORD).toBeNull()
  })

  test("startWord", async (): Promise<void> => {
    mock.module("./loadWord.ts", (): unknown => {
      return {
        newWord: jest.fn()
      }
    })

    await startWord()

    expect(RUNNING).toBeTrue()
  })

  test("stopWord", async (): Promise<void> => {
    await stopWord()

    expect(RUNNING).toBeFalse()
    expect(WORD).toBeNull()
  })
})
