import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

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
    name: 'buy',
    description: 'buying some roles or items',
    options: [
      {
        name: 'item',
        description: 'choose a item or role',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Buy extends Response {
        time!: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          const _get_member_data = await new DB()._get_member_data(
            interaction.user.id
          );

          const info_require = await this.main_info();

          let filtered_shop = shop.filter(
            (arg) => arg.name === info_require.item
          )[0];

          if (_get_member_data._require_member_data!.coins)
            if (
              _get_member_data._require_member_data!.coins < filtered_shop.cost
            )
              return this.reply_false('You do not have enough money for that!');

          const check_buttons = await this.check_buttons();

          switch (check_buttons.customId) {
            case 'yes':
              await new DB()._remove_payment(
                interaction.user.id,
                filtered_shop.cost
              );

              await (
                info_require.member?.roles as Discord.GuildMemberRoleManager
              ).add(filtered_shop.role);
              this.reply_true(
                `Role ${filtered_shop.name} was successfully added!`
              );
              break;

            case 'no':
              this.reply_true('See you later!', { timestamp: this.time });
              break;
            default:
              break;
          }
        }
        async main_info() {
          let item = args.filter((arg) => arg.name === 'item')[0].value;

          let member = interaction.member;

          let returned = {
            item,
            member,
          };

          return returned;
        }

        async check_buttons() {
          const buttons: Discord.MessageButton[] = [
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
        constructor() {}

        async _get_member_data(member_id?: string) {
          const _users_db = db.collection('users');

          const _require_member_data = await _users_db.findOne<UserType>({
            login: member_id,
          });

          let returned_info = { _users_db, _require_member_data };

          return returned_info;
        }

        async _remove_payment(member_id: string, user_choice: number) {
          const _get_member_data = await this._get_member_data(
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
