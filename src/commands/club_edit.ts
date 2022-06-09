import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

type user_choices = 'description' | 'name';

const command: Command = {
  slash: {
    name: 'clubedit',
    description: 'gives a permission to change some club options',
    options: [
      {
        name: 'description',
        description: 'change a club description',
        type: 3,
        required: false,
      },
      {
        name: 'name',
        description: 'change a club_name',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Club_edit extends Response {
        prices: {
          description: number;
          name: number;
        } = {
          name: 200,
          description: 100,
        };
        time: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          const _requested_db_data = new DB_work();

          const required_info = await this.main_info();

          const _get_member_data = await _requested_db_data._get_member_data(
            interaction.user.id
          );

          if (!required_info)
            return this.reply_false('You did not provide an argument', {
              timestamp: this.time,
            });
          const user_choice = <user_choices>required_info.name;
          const user_value = <string>required_info.value; // value приводим к типу user_choices т.к. он может быть "description" || "name"
          const current_cost = this.prices[user_choice]; // по ключу, который указал юзер вытаскиваем стоимость

          console.log(current_cost);
          console.log(user_choice);

          if (current_cost > _get_member_data[1]!.coins)
            return this.reply_false('You do not have enough money!', {
              timestamp: this.time,
            });

          const check_buttons = await this.check_buttons();

          switch (check_buttons.customId) {
            case 'yes':
              await _requested_db_data._remove_payment(
                interaction.user.id,
                current_cost
              );

              _requested_db_data.club_edit(
                interaction.user.id,
                user_choice,
                user_value
              );
              this.reply_true('Success! See you!', { timestamp: this.time });

              break;
            case 'no':
              this.reply_true('See you again!', { timestamp: this.time });
              break;
            default:
              this.reply_false('Time ended, try again!');
              break;
          }
        }

        async main_info() {
          let user_choice = <Discord.CommandInteractionOption | undefined>(
            args[0]
          );
          return user_choice;
        }

        async check_buttons() {
          const buttons = [
            new Discord.MessageButton()
              .setLabel('Yes')
              .setStyle('SUCCESS')
              .setDisabled(false)
              .setCustomId('yes'),
            new Discord.MessageButton()
              .setLabel('No')
              .setStyle('DANGER')
              .setDisabled(false)
              .setCustomId('no'),
          ];

          const ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#ff0000',
                description: '***Are you sure about this?***',
                timestamp: this.time,
              },
            ],
            components: [
              new Discord.MessageActionRow().addComponents(...buttons),
            ],
            fetchReply: true,
          });

          const answer = await ask_answer.awaitMessageComponent({
            filter: (user_button) =>
              interaction.user.id === user_button.user.id,
            time: 180000,
          });

          ask_answer.delete();

          return answer;
        }
      }

      class DB_work {
        constructor() {}

        async _get_member_data(member_id: string) {
          if (!member_id) throw new Error('member_id was not provided!');

          const coins_db = db.collection('users');

          const _coins_request = <UserType>(
            await coins_db.findOne({ login: member_id })
          );

          const users_db = db.collection('clubs');

          const _get_member_data = await users_db.findOne({ owner: member_id });

          let returned_array = [
            coins_db,
            _coins_request,
            users_db,
            _get_member_data,
          ];

          return returned_array;
        }

        async _remove_payment(member_id: string, user_choice_payment: any) {
          const _get_member_data = await this._get_member_data(
            interaction.user.id
          );

          let new_user_ballance =
            _get_member_data[1]!.coins - user_choice_payment;

          _get_member_data[0]!.updateOne(
            {
              login: member_id,
            },
            {
              $set: {
                coins: new_user_ballance,
              },
            }
          );
        }

        async club_edit(
          member_id: string,
          choice: user_choices,
          value: string
        ) {
          let _get_member_data = await this._get_member_data(
            interaction.user.id
          );

          let new_club = _get_member_data[3]!.new_club;

          new_club[choice] = value;

          _get_member_data[2]!.updateOne(
            {
              owner: member_id,
            },
            {
              $set: {
                new_club,
              },
            }
          );
        }
      }
      new Club_edit();
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
