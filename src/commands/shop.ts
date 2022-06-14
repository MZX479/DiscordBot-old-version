import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'shop',
    description: 'just a shop.. Nothing special..',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Shop {
        time!: Date;
        constructor() {
          this.time = new Date();

          this.start();
        }

        async start() {
          const items_db = db.collection('Items');

          const require_items = await items_db
            .find()
            .sort({
              cost: -1,
            })
            .toArray();

          let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(
              interaction.user.tag,
              interaction.user.avatarURL({ dynamic: true })!
            )
            .setTimestamp(new Date());

          for (let item of require_items) {
            embed.addField(`${item.name}`, `${item.cost}`);
          }

          interaction.channel!.send({ embeds: [embed] });
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
