import { parse } from "node:path"

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  type SlashCommandUserOption,
  type User
} from "discord.js"

import { resetPoints } from "../../utils/db.ts"
import { error, info } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reset points")
    .addUserOption(
      (option: SlashCommandUserOption): SlashCommandUserOption => option.setName("user").setDescription("User to reset")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  let content: string = "Reset all points"

  const user: User | null = interaction.options.getUser("user")
  if (user) {
    await resetPoints(user.displayName)
    content += ` for \`${user.displayName}\``
  } else {
    await resetPoints()
  }

  await interaction
    .reply({
      content: `-# > ↩️ ${content}`,
      flags: MessageFlags.Ephemeral
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })

  if (Bun.env.DEBUG) {
    info(content)
  }
}

export { create, invoke }
