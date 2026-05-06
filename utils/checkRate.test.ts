import { afterEach, describe, expect, jest, mock, test } from "bun:test"

import { type ChatInputCommandInteraction, type User } from "discord.js"

import { id } from "@nano-faker/number"

import { checkRate } from "./checkRate.ts"

const ID_LEN: number = 19

afterEach((): void => {
  retVal = false
})

let retVal: boolean = false

describe("checkRate", (): void => {
  mock.module("discord.js-rate-limiter", (): unknown => {
    return {
      take: jest.fn().mockReturnValue(retVal)
    }
  })

  const interaction: ChatInputCommandInteraction = {
    reply: jest.fn().mockResolvedValue(true),
    user: {
      bot: false,
      id: id(ID_LEN)
    } as User
  } as unknown as ChatInputCommandInteraction

  test("pass", (): void => {
    expect(checkRate(interaction)).resolves.toBeFalse()
  })

  test("fail", (): void => {
    retVal = true

    expect(checkRate(interaction)).resolves.toBeTrue()
  })

  test("bot", (): void => {
    interaction.user.bot = true

    expect(checkRate(interaction)).resolves.toBeTrue()
  })
})
