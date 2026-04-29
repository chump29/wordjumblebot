import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { RUNNING, startWord, WORD } from "../../utils/loadWord.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Start listening for word")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (RUNNING) {
    await interaction
      .reply({
        content: `-# > ❌ ${Bun.env.NAME} is already started`,
        flags: MessageFlags.Ephemeral
      })
      .catch((e: unknown): void => {
        error(e)
        throw e
      })
    return
  }

  await startWord()

  await interaction
    .reply({
      content: `-# > ▶️ ${Bun.env.NAME} is listening for \`${WORD}\``,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })
}

export { create, invoke }
