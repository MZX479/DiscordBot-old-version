import * as Discord from 'discord.js';
import { ObjectId } from 'mongodb';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { Response } from '../exports';
import { UserType } from '../types';

interface OwnerClubType {
  _id?: ObjectId;
  owner?: string;
  clubname?: string;
}

interface ClubOptions {
  club_name: string;
  owner: string;
  users?: [];
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

        async start() {}

        async club_info(): Promise<[string, number, ClubOptions]> {
          const club_name = <string>(
            args.filter((arg) => arg.name === 'name')[0].value
          );

          const cost: number = 1000;

          let new_club: ClubOptions = {
            club_name: club_name,
            owner: interaction.user.tag,
          };

          let returned_info: [string, number, ClubOptions] = [
            club_name,
            cost,
            new_club,
          ];

          return returned_info;
        }
      }

      class DB_Work {
        users_db: DB.Document;
        constructor() {
          this.users_db;
        }

        async _get_member_data(
          member_id: string,
          collection: string
        ): Promise<DB.Document> {
          if (!member_id || !collection)
            throw new Error('member id or collection were not provided!');

          const coins_db = db.collection('users');

          const required_coins = <UserType>(
            await coins_db.findOne({ login: member_id })
          );

          const users_db: DB.Collection<DB.Document> = db.collection('clubs');

          const _get_member_data = <OwnerClubType>await users_db.findOne({
            owner: member_id,
          });

          const data_array: [
            DB.Document?,
            UserType?,
            DB.Document?,
            OwnerClubType?
          ] = [coins_db, required_coins, users_db, _get_member_data];

          return data_array;
        }

        async create_club(member_id: string, new_club: {}): Promise<void> {
          if (!member_id || !new_club)
            throw new Error('member id or club name were not provided');

          const _requested_data: DB.Document = await this._get_member_data(
            interaction.user.id,
            'clubs'
          );

          const ovewrite: any = _requested_data[2].updateOne(
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

        async remove_payment(member_id: string, cost: number): Promise<void> {
          if (!member_id || !cost)
            throw new Error('member id or cost were not provided');

          const _requested_data: DB.Document = await this._get_member_data(
            interaction.user.id,
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
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
