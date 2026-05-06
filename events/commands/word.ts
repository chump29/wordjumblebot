import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { newWord, RUNNING, WORD } from "../../utils/loadWord.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Generate new word")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!Bun.env.NAME) {
    throw new Error("Invalid NAME")
  }

  if (!RUNNING) {
    await interaction.reply({
      content: `-# > ❌ ${Bun.env.NAME} is not started`,
      flags: MessageFlags.Ephemeral
    })
    return
  }

  await newWord().then(
    async (): Promise<InteractionResponse> =>
      await interaction.reply({
        content: `-# > 💬 New word: \`${WORD}\``,
        flags: MessageFlags.Ephemeral
      })
  )
}

export { create, invoke }
