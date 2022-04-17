import { Client, CommandInteraction } from 'discord.js';
import { type modulesType } from '../types';
import { MongoClient } from 'mongodb';

export default async function (
  bot: Client,
  f: modulesType,
  mongo: MongoClient,
  interaction: CommandInteraction
) {
  if (!interaction.isCommand()) return;

  const command = f.commands.filter(
    (command) => interaction.commandName === command.slash.name
  )[0];

  if (!command) return;

  const args = interaction.options.data;

  const { ephemeral } = command;
  //   await interaction.deferReply({
  //     ephemeral,
  //   });

  await interaction.reply({
    content: 'Загружаю вашу команду!',
  });
  command.execute(bot, f, mongo, args, interaction);
}
