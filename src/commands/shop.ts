import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { shop } from '../data/shop';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'shop',
    description: 'just a shop.. Nothing special..',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Shop extends Response {
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          const embed = new Discord.MessageEmbed();
          /*for (let item of shop) {
          }*/
        }
      }

      new Shop();
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
