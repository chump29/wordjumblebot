declare module "bun" {
  interface Env {
    AUTOSTART: string
    CHANNEL_ID: string
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    IS_DEBUG: string
    MAX_LENGTH: string
    MIN_LENGTH: string
    NAME: string
    npm_package_version: string
    POINTS_MODIFIER: string
    QUEST_MAX: string
    QUEST_POINTS: string
    RATE: string
    SQL_DEBUG: boolean
    TIMEOUT: string
    TOKEN: string
  }
}
