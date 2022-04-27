import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

interface UserRepType {
  login: string;
  rep_cooldown?: number;
  reputation?: number;
}

const command: Command = {
  slash: {
    name: 'rep',
    description: "Add or view member's reputation",
    options: [
      {
        name: 'member',
        description: 'Choose a member',
        type: 6,
        required: false,
      },
      {
        name: 'member_id',
        description: 'Choose a member_id',
        type: 3,
        required: false,
      },
    ],
  },

  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Reputation {
        private interaction: Discord.CommandInteraction;
        private cooldown: number;
        private db: DB.Db;
        TimeNow: Date;
        private reputation_to_add: number;
        constructor(interacton: Discord.CommandInteraction) {
          this.interaction = interaction;
          this.cooldown = 10800000;
          this.db = db;
          this.TimeNow = new Date();
          this.reputation_to_add = 1;

          this.main();
        }

        async main(): Promise<void> {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'member')[0]?.member
          );

          let member_id = <string>(
            args.filter((arg) => arg.name === 'member_id')[0]?.value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
            member_id = member.id;
          }

          const _get_member_data = await this._get_member_data(member.id);
          const _get_author_data = await this._get_author_data(
            this.interaction.user.id
          );

          let new_user_reputation: number =
            (_get_member_data.reputation || 0) + this.reputation_to_add;

          let cooldown = this.TimeNow.getTime() + this.cooldown;

          let new_cooldoown = (_get_author_data.rep_cooldown || 0) + cooldown;

          this._choose_buttons(member, new_cooldoown, new_user_reputation);
        }

        private async _choose_buttons(
          member: Discord.GuildMember,
          cooldown: number,
          new_user_reputation?: number
        ): Promise<void> {
          if (!member || !cooldown)
            throw new Error('Member or cooldown were not provided!');

          const buttons: Discord.MessageButton[] = [
            new Discord.MessageButton()
              .setLabel('Add a rep..')
              .setStyle('SECONDARY')
              .setDisabled(false)
              .setCustomId('Add a rep..'),
            new Discord.MessageButton()
              .setLabel('View a rep..')
              .setStyle('SECONDARY')
              .setDisabled(false)
              .setCustomId('View a rep..'),
          ];

          const ask_answer = <Discord.Message>await interaction.followUp({
            content: 'Please choose the right button!',
            components: [
              new Discord.MessageActionRow().addComponents(...buttons),
            ],
            fetchReply: true,
          });

          let answer = await ask_answer.awaitMessageComponent({
            filter: (button) => interaction.user.id === button.user.id,
            time: 180000,
          });

          ask_answer.delete();

          switch (answer.customId) {
            case 'Add a rep..':
              let _get_author_data = await this._get_author_data(
                this.interaction.user.id
              );
              if (_get_author_data.rep_cooldown! > this.TimeNow.getTime())
                return this.response(
                  'Error',
                  '#ff0000',
                  'Your cooldown has not expired!',
                  true
                );
              await this._overwrite_member_author_data(
                member.id,
                cooldown,
                new_user_reputation!
              );

              this.response(
                'Success',
                '#00ff00',
                `\`${this.interaction.user.tag}\` successfully added a reputation to \`${member.user.tag}\`\n Current reputation of him(er) - \`${new_user_reputation}\``,
                false,
                member
              );
              break;

            case 'View a rep..':
              this.response(
                'Success',
                '#00ff00',
                `\`${member.user.tag}\` reputation is \`${
                  new_user_reputation! - 1
                }\``,
                false,
                member
              );
              break;

            default:
              break;
          }
        }

        async response(
          title: string,
          color: Discord.ColorResolvable,
          description: string,
          epheremal?: boolean,
          member?: Discord.GuildMember
        ): Promise<void> {
          if (!title || !color || !description)
            throw new Error('One of arguments was not provided');

          interaction.followUp({
            embeds: [
              {
                color,
                title,
                author: {
                  name: this.interaction.user.tag,
                  iconURL: this.interaction.user.avatarURL({ dynamic: true })!,
                },
                description,
                thumbnail: {
                  url: member?.displayAvatarURL({ dynamic: true }) || undefined,
                },
                timestamp: this.TimeNow,
              },
            ],
            ephemeral: epheremal,
          });
        }

        private async _overwrite_member_author_data(
          member_id: string,
          cooldown: number,
          reputation_to_add: number
        ): Promise<void> {
          if (!member_id || !cooldown || !reputation_to_add)
            throw new Error('One or mmore arguments were not provided!');

          let _users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let _member_data = <UserRepType>await _users_db.findOne({
              login: member_id,
            }) || {};

          let _author_data = <UserRepType>await _users_db.findOne({
              login: this.interaction.user.id,
            }) || {};

          if (!_member_data.login) {
            _users_db.insertOne({
              login: member_id,
              reputation: reputation_to_add,
            });
          } else {
            _users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  reputation: reputation_to_add,
                },
              }
            );
          }

          if (!_author_data.login) {
            _users_db.insertOne({
              login: this.interaction.user.id,
              rep_cooldown: cooldown,
            });
          } else {
            _users_db.updateOne(
              {
                login: this.interaction.user.id,
              },
              {
                $set: {
                  rep_cooldown: cooldown,
                },
              }
            );
          }
        }

        private async _get_member_data(
          member_id: string
        ): Promise<UserRepType> {
          if (!member_id) throw new Error('Member_id was not provided');

          let _users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let _current_user =
            <UserRepType>await _users_db.findOne({ login: member_id }) || {};

          return _current_user;
        }

        private async _get_author_data(
          author_id: string
        ): Promise<UserRepType> {
          if (!author_id) throw new Error('Author id was not provided');

          let _users_db: DB.Collection<DB.Document> =
            this.db.collection('users');

          let _author_data =
            <UserRepType>await _users_db.findOne({ login: author_id }) || {};

          return _author_data;
        }
      }

      new Reputation(interaction);
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
