import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  type InteractionResponse,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { RUNNING, stopWord } from "../../utils/loadWord.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Stop jumbling words")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (!Bun.env.NAME) {
    throw new Error("Invalid NAME")
  }

  if (!RUNNING) {
    await interaction.reply({
      content: `-# > ❌ ${Bun.env.NAME} is already stopped`,
      flags: MessageFlags.Ephemeral
    })
    return
  }

  await stopWord().then(
    async (): Promise<InteractionResponse> =>
      await interaction.reply({
        content: `-# > ⏹️ ${Bun.env.NAME} stopped`,
        flags: MessageFlags.Ephemeral
      })
  )
}

export { create, invoke }
