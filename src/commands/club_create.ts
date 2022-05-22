import * as Discord from 'discord.js';
import { ObjectId } from 'mongodb';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';
import { ClubInterface } from '../exports';

interface OwnerClubType {
  _id?: ObjectId;
  owner?: string;
  clubname?: string;
}

const command: Command = {
  slash: {
    name: 'clubcreate',
    description: 'command to create club for user!',
    options: [
      {
        name: 'name',
        description: 'provide a name for your club',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class ClubCreate extends Response {
        time: Date;
        constructor() {
          super(interaction);
          this.time = new Date();

          this.start();
        }

        async start() {
          const clubs_collection = db.collection('clubs');

          const is_club_exist = await clubs_collection.findOne({
            owner: interaction.user.id,
          });

          if (is_club_exist) {
            //err

            return this.reply_false('You already have a club', {
              thumbnail: {
                url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              },
              timestamp: this.time,
              epheremal: false,
            });
          }

          const club_info = await this.club_info();

          if (typeof club_info[0] !== 'string' || club_info[0].length > 32)
            return this.reply_false(
              'Please make it shorter or provide a string',
              {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                },
                timestamp: this.time,
                epheremal: true,
              }
            );

          const coins_check = await new DB_Work()._get_member_data(
            interaction.user.id,
            'users',
            'clubs'
          );

          const create_club = new DB_Work();

          const coins = coins_check[1]?.coins;

          if (coins && coins < club_info[1])
            return this.reply_false(
              'You do not have enough money!',
              {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                },
                timestamp: this.time,
              },
              true
            );

          const check_buttons = await this.check_buttons();

          switch (check_buttons.customId) {
            case 'yes':
              await create_club.create_club(interaction.user.id, club_info[2]);
              await create_club.remove_payment(
                interaction.user.id,
                club_info[1]
              );
              this.reply_true('You succesfully bought an club!', {
                thumbnail: {
                  url: 'https://cdn.discordapp.com/emojis/966737934457905202.webp?size=64&quality=lossless',
                },
                timestamp: this.time,
              });
              break;
            case 'no':
              this.reply_false(
                'Rejected by a user',
                {
                  thumbnail: {
                    url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
                  },
                  timestamp: this.time,
                },
                false
              );
              break;
            default:
              break;
          }
        }

        async club_info(): Promise<[string, number, ClubInterface]> {
          const club_name = <string>(
            args.filter((arg) => arg.name === 'name')[0].value
          );

          const cost: number = 1000;

          let new_club: ClubInterface = {
            club_name: club_name,
            owner: interaction.user.tag,
          };

          let returned_info: [string, number, ClubInterface] = [
            club_name,
            cost,
            new_club,
          ];

          return returned_info;
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

      class DB_Work {
        constructor() {}

        async _get_member_data(
          member_id: string,
          coins_collection: string,
          clubs_collection: string
        ) {
          if (!member_id || !coins_collection || !clubs_collection)
            throw new Error('member id or collection were not provided!');

          const coins_db = db.collection(coins_collection);

          const required_coins = <UserType>(
            await coins_db.findOne({ login: member_id })
          );

          const users_db: DB.Collection<DB.Document> =
            db.collection(clubs_collection);

          const _get_member_data = <OwnerClubType>await users_db.findOne({
            owner: member_id,
          });

          const data_array: [
            DB.Document,
            UserType,
            DB.Document,
            OwnerClubType
          ] = [coins_db, required_coins, users_db, _get_member_data];

          return data_array;
        }

        async create_club(member_id: string, new_club: {}): Promise<void> {
          if (!member_id || !new_club)
            throw new Error('member id or club name were not provided');

          const _requested_data = await this._get_member_data(
            interaction.user.id,
            'users',
            'clubs'
          );

          _requested_data[2]?.insertOne({
            owner: member_id,
            new_club,
          });
        }

        async remove_payment(member_id: string, cost: number): Promise<void> {
          if (!member_id || !cost)
            throw new Error('member id or cost were not provided');

          const _requested_data: DB.Document = await this._get_member_data(
            interaction.user.id,
            'users',
            'clubs'
          );

          let new_ballance = <number>_requested_data[1].coins - cost;

          const remove_money: any = _requested_data[0].updateOne(
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

      new ClubCreate();
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
