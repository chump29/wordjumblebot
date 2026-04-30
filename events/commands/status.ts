import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { getWordPoints } from "../../utils/db.ts"
import { WORD } from "../../utils/loadWord.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show word")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  let content: string = `-# > 💬 Listening for \`${WORD ? WORD : "N/A"}\``
  if (WORD) {
    content += ` worth \`${await getWordPoints(WORD)}\` points`
  }

  await interaction
    .reply({
      content: content,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })
}

export { create, invoke }
