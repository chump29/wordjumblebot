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

import { checkRate } from "@postfmly/checkrate"

import { type IUser } from "../../db/schema.ts"
import { getAll } from "../../utils/db.ts"

const create = async (): Promise<RESTPostAPIChatInputApplicationCommandsJSONBody> => {
  return new SlashCommandBuilder()
    .setName(parse(import.meta.file).name)
    .setDescription("Show leaderboard")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setContexts(InteractionContextType.Guild)
    .toJSON()
}

const getEmbed = async (users: IUser[]): Promise<APIEmbedField[]> => {
  const fields: APIEmbedField[] = [
    {
      name: "_ _",
      value: ""
    } as APIEmbedField
  ]
  if (!users.length) {
    fields.push({
      name: "🚫  Nothing to show",
      value: ""
    } as APIEmbedField)
  } else {
    users.forEach((user: IUser, i: number): void => {
      fields.push({
        inline: true,
        name: `${i === 0 ? "👑 " : ""}${user.name}`,
        value: `-# ${user.points}`
      } as APIEmbedField)
    })
  }
  return fields
}

const invoke = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  if (await checkRate(interaction)) {
    return
  }

  const users: IUser[] = await getAll().then((users: IUser[]): IUser[] =>
    users.filter((user: IUser): boolean => user.points > 0)
  )

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    embeds: [
      new EmbedBuilder()
        .setColor("#78866b")
        .setTitle(`🏆  ${Bun.env.NAME} Leaderboard  🏆`)
        .setFields(await getEmbed(users))
        .toJSON()
    ]
  })
}

export { create, invoke }
