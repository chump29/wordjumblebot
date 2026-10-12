import { printVars } from "@postfmly/logger"
import { type Optional } from "@postfmly/types"

import { bool, cleanEnv, type ExactValidator, makeExactValidator, str, url } from "envalid"
import { anyOf, caseInsensitive, charIn, createRegExp, exactly, wordChar } from "magic-regexp"
import {
  check,
  digits,
  integer,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nonEmpty,
  parse,
  pipe,
  regex,
  string,
  toNumber,
  trim,
  union
} from "valibot"

const MIN_ID_LEN: number = 17
const MAX_ID_LEN: number = 19

const COLOR_LEN: number = 6

// * NOTE: Comes from min/max word length in @wordlist/english-eff/all
const MIN_WORD_LEN: number = 3
const MAX_WORD_LEN: number = 10

const MIN_PORT: number = 1024
const MAX_PORT: number = 65_535

const UID_MIN_LEN: number = 23
const UID_MAX_LEN: number = 28
const TS_MIN_LEN: number = 6
const TS_MAX_LEN: number = 7
const HMAC_MIN_LEN: number = 27
const HMAC_MAX_LEN: number = 38

const StringSchema = pipe(string(), trim(), nonEmpty())
const IdSchema = pipe(StringSchema, digits(), minLength(MIN_ID_LEN), maxLength(MAX_ID_LEN))
const ColorSchema = pipe(
  StringSchema,
  regex(
    // ! Desired: /^(?:#[\da-f]{6})$/i
    createRegExp(exactly("#").at.lineStart(), charIn("0123456789abcdef").times(COLOR_LEN).at.lineEnd(), [
      caseInsensitive
    ])
  )
)
const LengthSchema = pipe(
  StringSchema,
  toNumber(),
  integer(),
  minValue(0),
  maxValue(MAX_WORD_LEN),
  check((n: number): boolean => n === 0 || n >= MIN_WORD_LEN)
)
const PointsSchema = pipe(StringSchema, toNumber(), integer(), minValue(1))
const PortSchema = union([
  literal("random"),
  pipe(StringSchema, toNumber(), integer(), minValue(MIN_PORT), maxValue(MAX_PORT))
])
const TokenSchema = pipe(
  StringSchema,
  regex(
    createRegExp(
      anyOf(wordChar, "-").times.between(UID_MIN_LEN, UID_MAX_LEN).at.lineStart(),
      exactly("."),
      anyOf(wordChar, "-").times.between(TS_MIN_LEN, TS_MAX_LEN),
      exactly("."),
      anyOf(wordChar, "-").times.between(HMAC_MIN_LEN, HMAC_MAX_LEN).at.lineEnd(),
      [caseInsensitive]
    )
  )
)

const idValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(IdSchema, s))
const colorValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(ColorSchema, s))
const portValidator: ExactValidator<"random" | number> = makeExactValidator<"random" | number>(
  (s: string): "random" | number => parse(PortSchema, s)
)
const LengthValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(LengthSchema, s)
)
const pointsValidator: ExactValidator<number> = makeExactValidator<number>((s: string): number =>
  parse(PointsSchema, s)
)
const tokenValidator: ExactValidator<string> = makeExactValidator<string>((s: string): string => parse(TokenSchema, s))

let fakeId: Optional<string>
let fakeURL: Optional<string>
let fakeToken: Optional<string>

if (Bun.env.NODE_ENV === "test") {
  const { fakerEN_US: fake } = await import("@faker-js/faker")

  let chars: string = "[0-9]"
  fakeId = fake.helpers.fromRegExp(`${chars}{${MIN_ID_LEN},${MAX_ID_LEN}}`)

  fakeURL = fake.image.url({ height: 64, width: 64 })

  chars = "[a-zA-Z0-9]"
  fakeToken = fake.helpers.fromRegExp(
    `${chars}{${UID_MIN_LEN},${UID_MAX_LEN}}[.]${chars}{${TS_MIN_LEN},${TS_MAX_LEN}}[.]${chars}{${HMAC_MIN_LEN},${HMAC_MAX_LEN}}`
  )
}

const env = cleanEnv(Bun.env, {
  ACTIVITY: str({ default: "Jumbling" }),
  CHANNEL_ID: idValidator({ testDefault: fakeId }),
  COLOR: colorValidator({ default: "#78866b" }),
  DB_NAME: str({ default: "wordjumblebot.db", testDefault: "wordjumblebot.test.db" }),
  DB_PATH: str({ default: "./db" }),
  DEBUG: bool({ default: false, testDefault: true }),
  LOGO_NAME: str({ default: "wordjumblebot.webp" }),
  LOGO_PATH: str({ default: "./utils/images" }),
  LOGO_PORT: portValidator({ default: "random" }),
  LOGO_URL: url({ testDefault: fakeURL }),
  MAX_LENGTH: LengthValidator({ default: 0 }),
  MIN_LENGTH: LengthValidator({ default: 5 }),
  NAME: str({ default: "WordJumbleBot" }),
  POINTS_MODIFIER: pointsValidator({ default: 3 }),
  QUEST_POINTS: pointsValidator({ default: 100 }),
  QUEST_WORDS: pointsValidator({ default: 10 }),
  TOKEN: tokenValidator({ testDefault: fakeToken })
})

if (import.meta.main) {
  printVars(env, ["CHANNEL_ID", "TOKEN"])
}

export { env, MAX_WORD_LEN, MIN_WORD_LEN }
