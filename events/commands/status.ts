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

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show word")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!Bun.env.NAME) {
    throw new Error("Invalid NAME")
  }

  let content: string = `-# > ❌ ${Bun.env.NAME} is not running`
  if (WORD) {
    content = `-# > 💬 Listening for \`${WORD}\` worth \`${await getWordPoints(WORD)}\` points`
  }

  await interaction.reply({
    content: content,
    flags: MessageFlags.Ephemeral
  })
}

export { create, invoke }
