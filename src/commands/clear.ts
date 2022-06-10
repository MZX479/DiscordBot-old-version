import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'clear',
    description: 'clear amount of messages',
    options: [
      {
        name: 'amount',
        description: 'amount of messages to remove',
        type: 4,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Clear extends Response {
        time!: Date;

        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          const amount = <number>(
            args.filter((arg) => arg.name === 'amount')[0].value
          );

          if (amount >= 100 || amount <= 0)
            this.reply_false('You provided too much or to low amount!', {
              timestamp: this.time,
            });

          let fetched_messages = await interaction.channel!.messages.fetch({
            limit: amount,
          });

          let deleted_messages =
            interaction.channel!.bulkDelete(fetched_messages);

          this.reply_true(`You successfully deleted \`${amount}\` messages!`);
        }
      }
      new Clear();
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
