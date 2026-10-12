import { describe, expect, test } from "bun:test"

import { expectTypeOf } from "expect-type"

import { env } from "../../utils/env.ts"

describe("env", (): void => {
  test("ACTIVITY", (): void => {
    expectTypeOf(env.ACTIVITY).toEqualTypeOf<string>()

    expect(env.ACTIVITY.length).toBeGreaterThan(0)
  })

  test("CHANNEL_ID", (): void => {
    expectTypeOf(env.CHANNEL_ID).toEqualTypeOf<string>()

    expect(env.CHANNEL_ID.length).toBeGreaterThan(0)
  })

  test("COLOR", (): void => {
    expectTypeOf(env.COLOR).toEqualTypeOf<string>()

    const LEN: number = 7

    expect(env.COLOR).toHaveLength(LEN)
  })

  test("DB_NAME", (): void => {
    expectTypeOf(env.DB_NAME).toEqualTypeOf<string>()

    expect(env.DB_NAME.length).toBeGreaterThan(0)
  })

  test("DB_PATH", (): void => {
    expectTypeOf(env.DB_PATH).toEqualTypeOf<string>()

    expect(env.DB_PATH.length).toBeGreaterThan(0)
  })

  test("DEBUG", (): void => {
    expectTypeOf(env.DEBUG).toEqualTypeOf<boolean>()

    expect(env.DEBUG).toBeTrue()
  })

  test("LOGO_NAME", (): void => {
    expectTypeOf(env.LOGO_NAME).toEqualTypeOf<string>()

    expect(env.LOGO_NAME.length).toBeGreaterThan(0)
  })

  test("LOGO_PATH", (): void => {
    expectTypeOf(env.LOGO_PATH).toEqualTypeOf<string>()

    expect(env.LOGO_PATH.length).toBeGreaterThan(0)
  })

  test("LOGO_PORT", (): void => {
    expectTypeOf(env.LOGO_PORT).toEqualTypeOf<number | "random">()

    expect(env.LOGO_PORT).toBe("random")
  })

  test("LOGO_URL", (): void => {
    expectTypeOf(env.LOGO_URL).toEqualTypeOf<string>()

    expect(env.LOGO_URL.length).toBeGreaterThan(0)
  })

  test("MAX_LENGTH", (): void => {
    expectTypeOf(env.MAX_LENGTH).toEqualTypeOf<number>()

    expect(env.MAX_LENGTH).toBeGreaterThanOrEqual(0)
  })

  test("MIN_LENGTH", (): void => {
    expectTypeOf(env.MIN_LENGTH).toEqualTypeOf<number>()

    expect(env.MIN_LENGTH).toBeGreaterThanOrEqual(0)
  })

  test("NAME", (): void => {
    expectTypeOf(env.NAME).toEqualTypeOf<string>()

    expect(env.NAME.length).toBeGreaterThan(0)
  })

  test("POINTS_MODIFIER", (): void => {
    expectTypeOf(env.POINTS_MODIFIER).toEqualTypeOf<number>()

    expect(env.POINTS_MODIFIER).toBeGreaterThan(0)
  })

  test("QUEST_POINTS", (): void => {
    expectTypeOf(env.QUEST_POINTS).toEqualTypeOf<number>()

    expect(env.QUEST_POINTS).toBeGreaterThan(0)
  })

  test("QUEST_WORDS", (): void => {
    expectTypeOf(env.QUEST_WORDS).toEqualTypeOf<number>()

    expect(env.QUEST_WORDS).toBeGreaterThan(0)
  })

  test("TOKEN", (): void => {
    expectTypeOf(env.TOKEN).toEqualTypeOf<string>()

    expect(env.TOKEN.length).toBeGreaterThan(0)
  })
})
