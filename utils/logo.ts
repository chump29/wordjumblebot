import { info } from "@postfmly/logger"

let SERVER: Bun.Server<undefined> | null = null

const DEFAULT_PORT: number = 8004
const PORT: number = Bun.env.LOGO_PORT ? Number(Bun.env.LOGO_PORT) : DEFAULT_PORT

const logo = async (): Promise<void> => {
  if (Bun.env.LOGO_SERVER === "true") {
    SERVER = Bun.serve({
      development: Bun.env.NODE_ENV !== "production",
      port: PORT,
      fetch(request: Request): Response {
        const req: string = new URL(request.url).pathname
        const logo: string = Bun.env.LOGO_URL ? new URL(Bun.env.LOGO_URL).pathname : ""
        if (logo.length && req === logo) {
          return new Response(Bun.file(`${import.meta.dirname}/images${logo}`))
        } else if (req === "/favicon.ico") {
          return new Response(null, {
            status: 204
          })
        }
        return new Response("Not Found", {
          status: 404
        })
      }
    })

    if (Bun.env.DEBUG) {
      info(`Logo server started on port ${PORT}`)
    }
  }
}

export { logo, SERVER }
