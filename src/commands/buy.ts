import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';
import { Response } from '../exports';

const command: Command = {
  slash: {
    name: 'buy',
    description: 'buy some items in the shop',
    options: [
      {
        name: 'item',
        description: 'provide a name of item',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Buy extends Response {
        time: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          let name = <string>args.filter((arg) => arg.name === 'item')[0].value;

          let member = interaction.member;

          const _get_member_data = await new DB()._get_member_data(
            interaction.user.id
          );

          let filterred_shop = (await _get_member_data.require_items).filter(
            (arg: any) => arg.name === name
          )[0];

          if (
            !_get_member_data._require_member_data!.coins ||
            _get_member_data._require_member_data!.coins < filterred_shop.cost
          )
            return this.reply_false('Your ballance too low for this!');

          let buttons = await this.check_buttons();

          switch (buttons.customId) {
            case 'yes':
              const _request_remove_payment = await new DB()._remove_payment(
                interaction.user.id,
                filterred_shop.cost
              );

              await (member?.roles as Discord.GuildMemberRoleManager).add(
                filterred_shop.role
              );

              this.reply_true(
                `Success \n You bought a \`${filterred_shop.name}\` role. See you!`
              );
              break;
            case 'no':
              this.reply_false('See you', { timestamp: this.time });
              break;
            default:
              break;
          }
        }

        async check_buttons() {
          let buttons = [
            new Discord.MessageButton()
              .setLabel('Yes')
              .setStyle('PRIMARY')
              .setCustomId('yes')
              .setDisabled(false),
            new Discord.MessageButton()
              .setLabel('No')
              .setStyle('DANGER')
              .setCustomId('no')
              .setDisabled(false),
          ];

          const ask_answer = <Discord.Message>await interaction.followUp({
            embeds: [
              {
                author: {
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL({ dynamic: true })!,
                },
                color: '#ff0000',
                description: 'Are you sure about this?',
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

      class DB {
        async _get_member_data(member_id: string) {
          if (!member_id) throw new Error(`${member_id} was not provided!`);

          let _users_db = db.collection('users');

          let items_db = db.collection('Items');

          let require_items = items_db.find().toArray();

          let _require_member_data = await _users_db.findOne<UserType>({
            login: member_id,
          });

          let returned_object = {
            _users_db,
            _require_member_data,
            require_items,
          };

          return returned_object;
        }

        async _remove_payment(member_id: string, user_choice: number) {
          if (!member_id || !user_choice)
            throw new Error(
              `${member_id} or ${user_choice} were not provided!`
            );

          let _get_member_data = await this._get_member_data(
            interaction.user.id
          );

          if (_get_member_data._require_member_data!.coins) {
            const new_ballance =
              _get_member_data._require_member_data!.coins - user_choice;

            _get_member_data._users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  coins: new_ballance,
                },
              }
            );
          }
        }
      }

      new Buy();
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
