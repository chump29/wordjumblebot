import { parse } from "node:path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { checkRate } from "../../utils/checkRate.ts"
import { COUNT } from "../../utils/loadWord.ts"
import { error } from "../../utils/logger.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription(`Information about ${Bun.env.NAME}`)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setContexts(InteractionContextType.Guild)
    .toJSON()
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  await interaction
    .reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        new EmbedBuilder()
          .setColor("#78866b")
          .setAuthor({
            iconURL: Bun.env.LOGO_URL,
            name: `${Bun.env.NAME} v${Bun.env.npm_package_version}`
          })
          .setThumbnail(Bun.env.LOGO_URL)
          .setDescription("- Word jumble game")
          .setFields({
            inline: true,
            name: "Total Words:",
            value: COUNT
          } as APIEmbedField)
          .setFooter({
            text: "By Chris Post"
          })
      ]
    })
    .catch((e: unknown): void => {
      error(e)
      throw e
    })
}

export { create, invoke }
