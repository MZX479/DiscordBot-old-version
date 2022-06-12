import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

const shop = [
  {
    name: 'JS',
    cost: 100,
    description: 'Js Role',
    rare: 1,
    id: 1,
    role: '828596380960030760',
  },
  {
    name: 'C#',
    cost: 200,
    description: 'С# Role',
    rare: 1,
    id: 2,
    role: '828596410244136962',
  },
  {
    name: 'C++',
    cost: 300,
    description: 'C++ Role',
    rare: 1,
    id: 3,
    role: '828596310927212568',
  },
];

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
          let embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(
              interaction.user.tag,
              interaction.user.avatarURL({ dynamic: true })!
            )
            .setTimestamp(new Date());
          for (let item of shop) {
            embed.addField(item.name, `${item.cost.toString()}`);
          }

          interaction.channel?.send({ embeds: [embed] });
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
