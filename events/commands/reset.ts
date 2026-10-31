import { parse } from "node:path"

import { error } from "@postfmly/logger"

import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  type SlashCommandStringOption
} from "discord.js"
import { createRegExp, exactly, oneOrMore, wordChar } from "magic-regexp"

import { DB } from "../../utils/db.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody =>
  new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Reset points")
    .addStringOption(
      (option: SlashCommandStringOption): SlashCommandStringOption =>
        option.setName("option").setDescription("@user or ALL").setRequired(true)
    )
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  // biome-ignore lint/style/noNonNullAssertion: required
  const option = interaction.options.getString("option")!.trim()

  if (option.toLowerCase() === "all") {
    await DB.resetPoints()

    await interaction.editReply({ content: "-# > ↩️ Reset points for `ALL`" })
  } else {
    const userId = option.match(
      createRegExp(exactly("<@").at.lineStart(), oneOrMore(wordChar).groupedAs("userId"), exactly(">").at.lineEnd())
    )?.groups.userId
    if (!userId) {
      const msg = `❌ Could not find user: ${option}`

      await interaction.editReply({ content: `-# > ${msg}` })

      error(msg)

      return
    }

    const member = await interaction.guild?.members.fetch(userId)
    if (!member) {
      const msg = `❌ Could not find member: ${userId}`

      await interaction.editReply({ content: `-# > ${msg}` })

      error(msg)

      return
    }

    const name = member.user.displayName

    await DB.resetPoints(name)

    await interaction.editReply({ content: `-# > ↩️ Reset points for \`${name}\`` })
  }
}

export { create, invoke }
