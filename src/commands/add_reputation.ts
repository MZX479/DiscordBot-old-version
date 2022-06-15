import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

const command: Command = {
  slash: {
    name: 'rep',
    description: 'adding a reputation for a user',
    options: [
      {
        name: 'id',
        description: 'ping a user by id',
        type: 3,
        required: false,
      },
      {
        name: 'ping',
        description: 'ping a user',
        type: 6,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Reputation extends Response {
        time!: Date;
        cooldown: number;
        constructor() {
          super(interaction);
          this.time = new Date();
          this.cooldown = 3600000;

          this.start();
        }

        async start() {
          let _get_member_data = await this._get_member_data(
            interaction.user.id
          );
          let main_info = await this.main_info();

          if (
            _get_member_data._users_data.rep_cooldown &&
            _get_member_data._users_data.rep_cooldown > this.time.getTime()
          )
            return this.reply_false('your cooldown was not expired', {
              timestamp: this.time,
            });

          let new_cooldown = this.time.getTime() + this.cooldown;

          this._overwrite_member_data(
            main_info.id,
            new_cooldown,
            main_info.reputation
          );

          this.reply_true('You successfully added a reputation', {
            timestamp: this.time,
          });
        }

        async main_info() {
          let ping = args.filter((arg) => arg.name === 'ping')[0].value;
          let id = <string>args.filter((args) => args.name === 'ping')[0].value;
          let reputation = 1;

          let returned_info = {
            id,
            ping,
            reputation,
          };

          return returned_info;
        }

        private async _get_member_data(member_id: string) {
          if (!member_id) throw new Error('member-id was not provided!');

          const _users_db = db.collection('users');

          let _users_data = <UserType>(
            await _users_db.findOne({ login: member_id })
          );

          let returned_info = {
            _users_db,
            _users_data,
          };

          return returned_info;
        }

        private async _overwrite_member_data(
          member_id: string,
          cooldown: number,
          rep: number
        ) {
          if (!member_id || !cooldown || !rep)
            throw new Error(
              `${member_id} or ${cooldown}, or ${rep} were not provided!`
            );

          const _get_member_data = await this._get_member_data(
            interaction.user.id
          );

          let reputation;
          let new_cooldown;

          if (_get_member_data._users_data.reputation)
            reputation = _get_member_data._users_data.reputation + rep;

          if (_get_member_data._users_data!.rep_cooldown)
            new_cooldown =
              _get_member_data._users_data!.rep_cooldown + cooldown;

          if (!_get_member_data._users_data.login) {
            _get_member_data._users_db.insertOne({
              login: member_id,
              reputation,
            });
          } else {
            _get_member_data._users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  reputation,
                },
              }
            );
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
