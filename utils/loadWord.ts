import {
  type Channel,
  type Client,
  type Collection,
  type Message,
  MessageFlags,
  type PartialMessage,
  type Snowflake,
  type TextChannel
} from "discord.js"

import { all as words } from "@wordlist/english-eff/all"
import { RandomWords } from "@wordlist/random"
import ms, { type StringValue } from "ms"
import pluralize from "pluralize"
import prettyMilliseconds from "pretty-ms"

import { updatePoints } from "./db.ts"
import { error, info } from "./logger.ts"

let CLIENT: Client | null = null
let CHANNEL: TextChannel | null = null
let allWords: string[] = []

let COUNT: string = ""

let WORD: string | null = null

const MIN_LENGTH: number = 3
const MAX_LENGTH: number = 0
let MIN: number = MIN_LENGTH
let MAX: number = MAX_LENGTH

let RUNNING: boolean = false

let TIMEOUT: number = 0
let ID: NodeJS.Timeout | null = null

let MESSAGES: Snowflake[] = []

let randomWord: RandomWords | null = null

const loadSettings = async (client: Client): Promise<void> => {
  if (!client) {
    throw new Error("Invalid client")
  }

  CLIENT = client

  if (Bun.env.MIN_LENGTH.length && !isNaN(Number(Bun.env.MIN_LENGTH)) && Number(Bun.env.MIN_LENGTH) < MIN_LENGTH) {
    throw new Error("Invalid MIN_LENGTH")
  }

  MIN = isNaN(Number(Bun.env.MIN_LENGTH)) ? MIN_LENGTH : Number(Bun.env.MIN_LENGTH)
  MAX = isNaN(Number(Bun.env.MAX_LENGTH)) ? MAX_LENGTH : Number(Bun.env.MAX_LENGTH)
  MAX = MAX === 0 ? Math.max(...words.map((word: string): number => word.length)) : MAX

  if (MAX < MIN) {
    MAX = MAX_LENGTH
  }

  allWords = words.filter((word: string): boolean => {
    let success: boolean = false
    if (word.length >= MIN && word.length <= MAX) {
      success = true
    }
    return success
  })
  if (!allWords.length) {
    throw new Error("No words")
  }

  randomWord = new RandomWords(allWords)

  COUNT = allWords.length.toLocaleString()

  TIMEOUT = ms((Bun.env.TIMEOUT || "2m") as StringValue)

  if (Bun.env.DEBUG) {
    info(`Loaded ${COUNT} words`, `Minimum length: ${MIN}`, `Maximum length: ${MAX}`)
  }
}

const getWord = async (): Promise<string | null> => {
  if (!randomWord) {
    throw new Error("Invalid randomWord")
  }

  const word: string[] = await randomWord.generate()
  return word.length ? (word[0] as string) : null
}

const getChannel = async (): Promise<TextChannel> => {
  if (!CLIENT) {
    throw new Error("Invalid client")
  }

  return await CLIENT.channels.fetch(Bun.env.CHANNEL_ID).then((channel: Channel | null) => {
    if (!channel) {
      throw new Error("Invalid channel")
    }

    return channel as TextChannel
  })
}

const jumbleWord = async (word: string): Promise<string> => {
  let newWord: string = ""
  do {
    const arr: string[] = word.split("").splice(1)
    for (let i: number = arr.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1))
      // @ts-expect-error: simplified Fisher-Yates algorithm
      ;[arr[i], arr[j]] = [
        arr[j],
        arr[i]
      ]
    }
    newWord = `${word[0]}${arr.join("")}`
  } while (newWord === word)
  return newWord
}

const clearMessages = async (): Promise<void> => {
  if (!CHANNEL) {
    throw new Error("Invalid channel")
  }

  await CHANNEL.bulkDelete(MESSAGES)
    .then((messages: Collection<Snowflake, Message | PartialMessage | undefined>): void => {
      MESSAGES = []

      if (Bun.env.DEBUG && messages) {
        info(`Cleared ${pluralize("message", messages.size, true)}`)
      }
    })
    .catch((e: Error): void => error(e.message))
}

const newWord = async (): Promise<void> => {
  if (ID) {
    clearTimeout(ID)
  }

  WORD = await getWord()

  if (!WORD) {
    throw new Error("Error getting word")
  }

  const word: string = await jumbleWord(WORD)
  if (!word.length) {
    throw new Error("Invalid word")
  }

  if (Bun.env.DEBUG) {
    info(`Jumbled ${WORD} as ${word}`)
  }

  if (MESSAGES.length) {
    await clearMessages()
  }

  if (!CHANNEL) {
    CHANNEL = await getChannel()
  }

  await CHANNEL.send({
    content: `-# > Guess the word: \`${word}\``,
    flags: MessageFlags.SuppressNotifications
  }).then((message: Message): void => {
    MESSAGES.push(message.id)
  })
}

const checkWord = async (message: Message): Promise<void> => {
  if (!WORD || !message.content.trim().toLowerCase().includes(WORD) || !message.member || message.member.user.bot) {
    return
  }

  await clearMessages()

  if (!CHANNEL) {
    throw new Error("Invalid channel")
  }

  const name: string = message.member.user.displayName

  const points: number = await updatePoints(name, WORD as string)

  if (Bun.env.DEBUG) {
    info(`${name} guessed the word ${WORD} for ${points} points`)
  }

  await CHANNEL.send({
    content: `-# > \`${name}\` guessed the word \`${WORD}\` for \`${points}\` points`,
    flags: MessageFlags.SuppressNotifications
  })
    .then((message: Message): void => {
      MESSAGES.push(message.id)

      WORD = null
    })
    .then(async (): Promise<Message> => {
      if (!TIMEOUT) {
        throw new Error("Invalid timeout")
      }

      const timeout: string = prettyMilliseconds(TIMEOUT, {
        verbose: true
      })

      if (Bun.env.DEBUG) {
        info(`Next word in ${timeout}`)
      }

      return await CHANNEL!.send({
        content: `-# > Next word in \`${timeout}\``,
        flags: MessageFlags.SuppressNotifications
      })
    })
    .then((message: Message): void => {
      MESSAGES.push(message.id)

      ID = setTimeout(newWord, TIMEOUT)
    })
}

const startWord = async (): Promise<void> => {
  await newWord()
  RUNNING = true

  if (Bun.env.DEBUG) {
    info("Started")
  }
}

const stopWord = async (): Promise<void> => {
  if (ID) {
    clearTimeout(ID)
  }

  RUNNING = false
  WORD = null

  await clearMessages()

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { COUNT, checkWord, loadSettings, MAX, MIN, newWord, RUNNING, startWord, stopWord, WORD }
