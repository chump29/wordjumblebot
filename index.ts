import { error, info } from "@postfmly/logger"

import { Client } from "./utils/client.ts"
import { DB } from "./utils/db.ts"
import { env } from "./utils/env.ts"
import { WordJumble } from "./utils/wordJumble.ts"

try {
  DB.open()

  await WordJumble.init(await Client.init())

  info(`🟢 ${env.ACTIVITY}....`)
} catch (e: unknown) {
  const msg: string = (e as Error).message

  error(`❌ ${msg}`)

  await Client.shutdown(msg)
}
