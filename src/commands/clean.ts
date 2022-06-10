import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'clean',
    description: 'delete a 30 messages',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Clean {
        time: Date;
        constructor() {
          this.time = new Date();

          this.start();
        }

        async start() {
          let fetched_messages = await interaction.channel!.messages.fetch({
            limit: 30,
          });

          await interaction.channel!.bulkDelete(fetched_messages);
        }
      }

      new Clean();
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
