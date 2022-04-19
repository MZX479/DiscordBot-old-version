import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  slash: {
    name: 'daily',
    description: 'Собрать дейлик',
  },
  async execute(bot, f, mongo, args, message) {
    const db: DB.Db = mongo.db(message.guild.id);
    try {
      class Daily {
        private message: Discord.CommandInteraction;
        private args: Array<string>;
        private db: DB.Db;
        cooldown: number;
        daily_amount: number;

        constructor(message: Discord.CommandInteraction, args: Array<string>) {
          this.message = message;
          this.args = args;
          this.db = db;
          this.cooldown = 86000000;
          this.daily_amount = 1000;

          this.main();
        }

        async main(): Promise<void> {
          let _get_member_data: DB.Document = await this._get_member_data(
            this.message.member.id
          );

          let current_time: number = new Date().getTime();

          let daily_cooldown: number = current_time + this.cooldown;

          if (_get_member_data.daily_cooldown > current_time) {
            return this.response(
              'Error',
              '#ff0000',
              'Your cooldown has not elapsed'
            );
          } else {
            await this._overwrite_member_data(
              this.message.member.user.id,
              this.daily_amount,
              daily_cooldown
            );
            this.response(
              'Success',
              '#00fff00',
              `Success. Your ballance now is \`${
                _get_member_data.coins + this.daily_amount
              }\` \n Comeback tommorow!`
            );
          }
        }

        async response(
          title: string,
          color: Discord.ColorResolvable,
          text: string
        ): Promise<void> {
          if (!title || !color || !text)
            throw new Error('One of arguments were not given!');

          let response: Discord.MessageEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setAuthor(
              this.message.user.tag,
              this.message.user.avatarURL({ dynamic: true })
            )
            .setDescription(`**${text}**`)
            .setTimestamp();

          this.message.channel.send({ embeds: [response] });
        }

        async _overwrite_member_data(
          member_id: string,
          daily_amount: number,
          cooldown: number
        ): Promise<void> {
          if (!member_id || !daily_amount || !cooldown)
            throw new Error('One of arguments were not given!');

          let users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let current_user =
            (await users_db.findOne({ login: member_id })) || {};

          let new_ballance: number = (current_user.coins || 0) + daily_amount;

          if (!current_user) {
            users_db.insertOne({
              login: member_id,
              coins: new_ballance,
              daily_cooldown: cooldown,
            });
          } else {
            users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  coins: new_ballance,
                  daily_cooldown: cooldown,
                },
              }
            );
          }
        }

        async _get_member_data(member_id: string): Promise<DB.Document> {
          if (!member_id) throw new Error('Member id was not provided');

          let users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let current_user: DB.Document =
            (await users_db.findOne({ login: member_id })) || {};

          return current_user;
        }
      }

      new Daily();
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        .send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
