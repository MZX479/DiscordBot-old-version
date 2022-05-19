import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

const daily_amount: number = 1000;

const command: Command = {
  slash: {
    name: 'daily',
    description: `gives a member a ${daily_amount} of money's`,
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Daily extends Response {
        time: Date;
        cooldown: number;
        constructor() {
          super(interaction);
          this.time = new Date();
          this.cooldown = 860000000;

          this.main();
        }

        async main() {
          let member_data = await this._get_member_data(
            interaction.user.id,
            'users'
          );

          const new_cooldown = this.time.getTime() + this.cooldown;

          let cooldown_to_write =
            <number>(member_data[1]?.daily_cooldown || 0) + new_cooldown;

          let new_member_ballance =
            <number>(member_data[1]?.coins || 0) + daily_amount;

          if (member_data[1]?.daily_cooldown! > this.time.getTime()) {
            return this.reply_false(
              'Your cooldown was not expired!',
              {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                },
              },
              true
            );
          } else {
            await this._overwrite_member_data(
              interaction.user.id,
              new_member_ballance,
              cooldown_to_write
            );

            this.reply_true(
              `Success! You received \`${daily_amount}💸\`\n Come Tommorow`,
              {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/966737934457905202.webp?size=64&quality=lossless',
                },
              }
            );
          }
        }

        private async _get_member_data(
          member_id: string,
          collection: string
        ): Promise<[DB.Document?, UserType?]> {
          if (!member_id || !collection)
            throw new Error('member id or collection were not provided!');

          const users_db: DB.Document = db.collection(collection);

          const _get_member_data = <UserType>(
            await users_db.findOne({ login: member_id })
          );

          const data_array: [DB.Document?, UserType?] = [
            users_db,
            _get_member_data,
          ];

          return data_array;
        }

        private async _overwrite_member_data(
          member_id: string,
          new_ballance: number,
          daily_cooldown: number
        ): Promise<void> {
          if (!new_ballance || !daily_cooldown || !member_id)
            throw new Error(
              'new_ballance, member_id or cooldown were not provided!'
            );

          let member_data = await this._get_member_data(
            interaction.user.id,
            'users'
          );

          if (!member_data[1]?.login) {
            member_data[0]?.insertOne({
              login: member_id,
              coins: new_ballance,
              daily_cooldown,
            });
          } else {
            member_data[0]?.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  coins: new_ballance,
                  daily_cooldown,
                },
              }
            );
          }
        }
      }

      new Daily();
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
