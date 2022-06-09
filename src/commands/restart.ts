import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  slash: {
    name: 'reload',
    description: 'reload command',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      console.log(__dirname);
    } catch (err) {
      let e = <{ message: string; name: string }>err;
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
