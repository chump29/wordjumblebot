import { afterAll, beforeAll, describe, expect, test } from "bun:test"

import { info } from "@postfmly/logger"

import { status } from "http-status"

import { logo, SERVER } from "./logo.ts"

beforeAll(async (): Promise<void> => await logo())

afterAll((): void => {
  SERVER?.stop()
  info("Logo server stopped")
})

describe("logo", (): void => {
  test("logo", async (): Promise<void> => {
    const response: Response = await fetch(
      new Request(`http://localhost:${Bun.env.LOGO_PORT}/${new URL(Bun.env.LOGO_URL).pathname}`)
    )
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toBe("image/webp")
  })

  test("favicon", async (): Promise<void> => {
    const response: Response = await fetch(new Request(`http://localhost:${Bun.env.LOGO_PORT}/favicon.ico`))
    expect(response.status).toBe(status.NO_CONTENT)
    expect(await response.text()).toBeEmpty()
  })

  test("not found", async (): Promise<void> => {
    const response: Response = await fetch(new Request(`http://localhost:${Bun.env.LOGO_PORT}/test`))
    expect(response.status).toBe(status.NOT_FOUND)
    expect(await response.text()).toBe(status[404])
  })
})
