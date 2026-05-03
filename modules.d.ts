declare module "bun" {
  interface Env {
    AUTOSTART: string
    CHANNEL_ID: string
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    IS_DEBUG: string
    LOGO_PORT: string
    LOGO_SERVER: string
    LOGO_URL: string
    MAX_LENGTH: string
    MIN_LENGTH: string
    NAME: string
    npm_package_version: string
    POINTS_MODIFIER: string
    QUEST_MAX: string
    QUEST_POINTS: string
    RATE: string
    TIMEOUT: string
    TOKEN: string
  }
}
