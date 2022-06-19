import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command, UserType } from '../types';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'rep',
    description: 'ad a reputation to member',
    options: [
      {
        name: 'ping',
        description: 'ping a user',
        type: 6,
        required: false,
      },
      {
        name: 'id',
        description: 'use user id',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Reputation extends Response {
        private readonly reputation_amount = 1;
        private readonly cooldown_amount = 360000;
        constructor() {
          super(interaction);
          this.main();
        }

        async main() {
          let member = args.filter((option) => option.name === 'ping')[0]
            ?.member as Discord.GuildMember | undefined;

          let member_id = interaction.options.data.filter(
            (option) => option.name === 'id'
          )[0]?.value as string | undefined;

          if (!member && member_id) {
            const fetched_member = await interaction.guild?.members.fetch(
              member_id
            );

            if (!fetched_member) {
              return this.reply_false('You provided a wrong user!');
            }

            member = fetched_member;
            member_id = fetched_member.user.id;
          }

          member_id = member?.user.id;
          if (!member || !member_id) {
            return this.reply_false('Вы не указали участника');
          }

          const author_data = await this._get_member_data(interaction.user.id);
          const member_data = await this._get_member_data(member.user.id);

          const author_cooldown = author_data.rep_cooldown || 0;
          if (author_cooldown > new Date().getTime())
            return this.reply_false('У вас не истек кулдаун');

          const member_reputation = member_data.reputation || 0;

          const new_author_cooldown =
            new Date().getTime() + this.cooldown_amount;

          member_data.reputation = member_reputation + this.reputation_amount;
          author_data.rep_cooldown = new_author_cooldown;

          await this.update_data(member_id, member_data);
          await this.update_data(interaction.user.id, author_data);

          this.reply_true('SuckSess!!!');
        }

        private async _get_member_data(member_id: string) {
          const users_collection = db.collection('users');

          const user_data =
            (await users_collection.findOne<UserType>({
              login: member_id,
            })) || ({} as UserType);

          return user_data;
        }

        private async update_data(user_id: string, user_data: UserType) {
          const users_collection = db.collection('users');

          if (user_data.login) {
            users_collection.updateOne(
              {
                login: user_data.login,
              },
              {
                $set: user_data,
              }
            );
          } else {
            users_collection.insertOne({
              login: user_id,
              ...user_data,
            });
          }
        }
      }

      new Reputation();
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
