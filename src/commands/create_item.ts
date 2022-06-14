import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { InteractionResponseType } from 'discord-api-types/v10';

const command: Command = {
  slash: {
    name: 'createitem',
    description: 'create an item to shop',
  },
  async execute(bot, f, mongo, args, interaction, message) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Create_item extends Response {
        time: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          let filter = (interaction_user: Discord.CommandInteraction) =>
            interaction.user.id === interaction_user.id;

          interaction.channel!.send({
            embeds: [
              {
                author: {
                  name: interaction.user.id,
                  icon_url: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#00ff00',
                description: 'Please provide a name for your item!',
              },
            ],
          });

          const ask_message_collector =
            message?.createMessageComponentCollector({
              filter,
              max: 1,
              time: 15000,
            });

          let answer;

          ask_message_collector.on('collect', (answer = args[0]));

          console.log(answer);
        }

        async check_buttons() {}
      }
      new Create_item();
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
