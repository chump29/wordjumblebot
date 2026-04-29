import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { RUNNING, stopWord } from "../../utils/loadWord.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Stop listening for word")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setContexts(InteractionContextType.Guild)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!RUNNING) {
    await interaction
      .reply({
        content: `-# > ❌ ${Bun.env.NAME} is already stopped`,
        flags: MessageFlags.Ephemeral
      })
      .catch((e: unknown): void => {
        error(e)
        throw e
      })
    return
  }

  await stopWord()

  await interaction
    .reply({
      content: `-# > ⏹️ ${Bun.env.NAME} stopped`,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })
}

export { create, invoke }
