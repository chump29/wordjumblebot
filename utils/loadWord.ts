import { type Channel, type Client, type Message, MessageFlags, type TextChannel } from "discord.js"

import { all as words } from "@wordlist/english-eff/all"
import { RandomWords } from "@wordlist/random"
import ms, { type StringValue } from "ms"
import prettyMilliseconds from "pretty-ms"

import { updatePoints } from "./db.ts"
import { info } from "./logger.ts"

let CLIENT: Client | null = null
let CHANNEL: TextChannel | null = null

let WORD: string | null = null

let COUNT: string = ""

const MAX_LENGTH: number = 0
const MIN_LENGTH: number = 3
let MAX: number = MAX_LENGTH
let MIN: number = MIN_LENGTH

let RUNNING: boolean = false

let TIMEOUT: number = 0

let MESSAGES: Message[] = []

const randomWord: RandomWords = new RandomWords(words)

const loadSettings = async (client: Client): Promise<void> => {
  if (!client) {
    throw new Error("Invalid client")
  }

  CLIENT = client

  if (Bun.env.MIN_LENGTH.length && !isNaN(Number(Bun.env.MIN_LENGTH)) && Number(Bun.env.MIN_LENGTH) < MIN_LENGTH) {
    throw new Error("Invalid MIN_LENGTH")
  }

  MAX = isNaN(Number(Bun.env.MAX_LENGTH)) ? MAX_LENGTH : Number(Bun.env.MAX_LENGTH)
  MIN = isNaN(Number(Bun.env.MIN_LENGTH)) ? MIN_LENGTH : Number(Bun.env.MIN_LENGTH)

  if (MAX < MIN) {
    MAX = MAX_LENGTH
  }

  TIMEOUT = ms((Bun.env.TIMEOUT || "180s") as StringValue)

  COUNT = words.length.toLocaleString()

  if (Bun.env.DEBUG) {
    info(`Loaded ${COUNT} words`)
  }
}

const getWord = async (): Promise<string> => {
  return await randomWord
    .generate()
    .then((words: string[]): string => words[0] as string)
    .then(async (word: string): Promise<string> => {
      if (word.length < MIN) {
        return await getWord()
      } else if (MAX !== 0 && word.length > MAX) {
        return await getWord()
      }
      return word
    })
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
  MESSAGES.forEach(async (message: Message): Promise<void> => {
    await message.delete()
  })
  MESSAGES = []
}

const newWord = async (): Promise<void> => {
  WORD = await getWord()

  if (!WORD) {
    throw new Error("Error getting word")
  }

  const word: string = await jumbleWord(WORD)

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
    MESSAGES.push(message)
  })

  if (Bun.env.DEBUG) {
    info(`New word: ${WORD}`)
  }
}

const checkWord = async (message: Message): Promise<void> => {
  if (!WORD || !message.content.trim().toLowerCase().includes(WORD) || !message.member || message.member.user.bot) {
    return
  }

  WORD = null

  await clearMessages()

  if (!CHANNEL) {
    throw new Error("Invalid channel")
  }

  const name: string = message.member.user.displayName
  await CHANNEL.send({
    content: `-# > \`${name}\` guessed the word \`${WORD}\`!`,
    flags: MessageFlags.SuppressNotifications
  })
    .then(async (message: Message): Promise<void> => {
      await updatePoints(name)

      MESSAGES.push(message)

      if (Bun.env.DEBUG) {
        info(`${name} guessed the word!`)
      }
    })
    .then(async (): Promise<void> => {
      if (!TIMEOUT) {
        throw new Error("Invalid timeout")
      }

      const timeout: string = prettyMilliseconds(TIMEOUT, {
        verbose: true
      })

      MESSAGES.push(
        await CHANNEL!.send({
          content: `-# > Next word in \`${timeout}\``,
          flags: MessageFlags.SuppressNotifications
        })
      )

      if (Bun.env.DEBUG) {
        info(`Next word in ${timeout}`)
      }
    })
    .then((): void => {
      setTimeout(newWord, TIMEOUT)
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
  RUNNING = false
  WORD = null

  await clearMessages()

  if (Bun.env.DEBUG) {
    info("Stopped")
  }
}

export { COUNT, checkWord, loadSettings, newWord, RUNNING, startWord, stopWord, WORD }
