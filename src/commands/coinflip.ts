import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { type UserType } from '../types';

const command: Command = {
  slash: {
    name: 'coinflip',
    description: 'game with bets, user can win or loose money',
    options: [
      {
        name: 'side',
        description: 'choose the side of coin',
        type: 3,
        required: true,
      },
      {
        name: 'bet',
        description: 'user bet',
        type: 4,
        required: true,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Coinflip {
        private interaction: Discord.CommandInteraction;
        private db: DB.Db;

        constructor(interaction: Discord.CommandInteraction) {
          this.interaction = interaction;
          this.db = db;

          this.main();
        }

        async main(): Promise<void> {
          let _get_member_data: UserType = await this._get_member_data(
            this.interaction.user.id
          );
          let result_game = await this.game();

          let heads: {} | any = {
            name: 'heads',
            picture:
              'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/598/datas/original.png',
          };

          let tails: {} | any = {
            name: 'tails',
            picture:
              'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/599/datas/original.png',
          };

          let user_choice: string = <string>(
            args.filter((arg) => arg.name === 'side')[0].value
          );

          if (user_choice !== heads.name && user_choice !== tails.name)
            return this.response(
              'Error',
              '#ff0000',
              'You chose the wrong side!',
              'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              true
            );

          let user_bet: number = <number>(
            args.filter((arg) => arg.name === 'bet')[0].value
          );
          if (isNaN(user_bet) || user_bet <= 0)
            return this.response(
              'Error',
              '#ff0000',
              'Please provide a correct number!',
              'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              true
            );

          let _user_ballance = _get_member_data.coins;

          if (!_get_member_data || user_bet > _get_member_data.coins)
            return this.response(
              'Error',
              '#ff0000',
              'You do not have enough money!',
              'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              true
            );

          let win_bet = <number>_user_ballance - user_bet + user_bet * 2;
          let lose_bet = <number>_user_ballance - user_bet;
          let winner: {} | any;
          let lose: {} | any;

          switch (result_game) {
            case 0:
              winner = heads;
              lose = tails;
              break;
            case 1:
              winner = tails;
              lose = heads;
              break;
            default:
              break;
          }

          if (user_choice === winner.name) {
            await this._overwrite_member_data(
              this.interaction.user.id,
              win_bet
            );
            this.response(
              'Congratz',
              '#00ff00',
              `You win! Your ballance now is \`${win_bet}\``,
              winner.picture
            );
          } else {
            await this._overwrite_member_data(
              this.interaction.user.id,
              lose_bet
            );
            this.response(
              'You lose!',
              '#ff0000',
              `You lose. Your ballance now is \`${lose_bet}\``,
              lose.picture
            );
          }
        }

        async game(): Promise<number> {
          return Math.floor(Math.random() * 2);
        }

        async response(
          title: string,
          color: Discord.ColorResolvable,
          description: string,
          thumbnail: string,
          epheremal?: boolean
        ): Promise<void> {
          if (!title || !color || !description || !thumbnail)
            throw new Error('One of components was not given!');

          interaction.followUp({
            embeds: [
              {
                author: {
                  name: this.interaction.user.tag,
                  iconURL: this.interaction.user.avatarURL({ dynamic: true })!,
                },
                title,
                color,
                description,
                thumbnail: {
                  url: thumbnail,
                },
                timestamp: new Date(),
              },
            ],
            ephemeral: epheremal,
          });
        }

        async _overwrite_member_data(
          member_id: string,
          money_result: number
        ): Promise<void> {
          if (!member_id || !money_result)
            throw new Error('One of arguments was not given!');

          let _users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          _users_db.updateOne(
            {
              login: member_id,
            },
            {
              $set: {
                coins: money_result,
              },
            }
          );
        }

        async _get_member_data(member_id: string): Promise<UserType> {
          if (!member_id) throw new Error('Member id was not provided!');

          let _users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let _current_user = <UserType>await _users_db.findOne({
            login: member_id,
          });

          return _current_user;
        }
      }

      new Coinflip(interaction);
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
