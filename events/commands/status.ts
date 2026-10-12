import { parse } from "node:path"

import pluralize from "@jarrodek/pluralize"
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { DB } from "../../utils/db.ts"
import { WordJumble } from "../../utils/wordJumble.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody =>
  new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show status")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  await interaction.editReply({
    content: `-# > 💬 Listening for \`${WordJumble.WORD}\` as \`${WordJumble.JUMBLED_WORD}\` worth \`${pluralize("point", DB.getWordPoints(WordJumble.WORD as string), true)}\``
  })
}

export { create, invoke }
