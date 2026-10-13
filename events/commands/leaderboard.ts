import { parse } from "node:path"

import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type HexColorString,
  InteractionContextType,
  MessageFlags,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder
} from "discord.js"

import { type IPoints } from "../../db/schema.ts"
import { bucket } from "../../utils/bucket.ts"
import { DB } from "../../utils/db.ts"
import { env } from "../../utils/env.ts"

const create = (): RESTPostAPIChatInputApplicationCommandsJSONBody =>
  new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show leaderboard")
    .setContexts(InteractionContextType.Guild)
    .toJSON()

const pr: Intl.PluralRules = new Intl.PluralRules("en-US", { type: "ordinal" })

const suffixes: Record<Intl.LDMLPluralRule, string> = {
  few: "rd",
  many: "th", // unused, required
  one: "st",
  other: "th",
  two: "nd",
  zero: "th" // unused, required
} as const

const ordinal = (n: number): string => `${n.toLocaleString()}${suffixes[pr.select(n)]}`

const getEmbed = (points: IPoints[]): APIEmbedField[] => {
  const fields: APIEmbedField[] = []

  if (points.length > 0) {
    const allNames: string = points
      .map((p: IPoints, i: number): string => `-# ${ordinal(i + 1)}: ${i === 0 ? "👑 " : ""}${p.name}`)
      .join("\n")

    const allPoints: string = points.map((p: IPoints): string => `-# ${p.points.toLocaleString()}`).join("\n")

    fields.push(
      ...([
        {
          inline: true,
          name: "Name",
          value: allNames
        },
        {
          inline: true,
          name: "Points",
          value: allPoints
        }
      ] as APIEmbedField[])
    )
  } else {
    fields.push({
      name: "🚫  Nothing to show",
      value: ""
    } as APIEmbedField)
  }
  return fields
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  if (!bucket.allow(interaction.user.username)) {
    await interaction.editReply({ content: "-# > ❌ Rate limit exceeded" })

    return
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(env.COLOR as HexColorString)
        .setTitle(`🏆  ${env.NAME} Top 10 Leaderboard  🏆`)
        .setFields(getEmbed(await DB.getLeaderboard()))
        .toJSON()
    ]
  })
}

export { create, invoke }
