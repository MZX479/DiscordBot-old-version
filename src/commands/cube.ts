import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { custom_random_number } from '../exports';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'cube',
    description: 'gives to user a random number from 1 to six',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Cube extends Response {
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start(): Promise<void> {
          const cube_roll = await custom_random_number(7);

          this.reply_true(`Your cube got ${cube_roll}`, {
            timestamp: this.time,
          });
        }
      }

      new Cube();
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
