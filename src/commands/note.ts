import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

type UserNoteType = {
  login: string;
  notes: Array<object>;
  cooldown: number;
};

const command: Command = {
  slash: {
    name: 'note',
    description: 'making notes to db',
    options: [
      {
        name: 'note',
        description: 'Current User note',
        type: 3,
        required: true,
      },
    ],
  },

  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Note {
        private interaction: Discord.CommandInteraction;
        private db: DB.Db;
        private cooldown: number;
        private TimeNow: Date;
        constructor(interaction: Discord.CommandInteraction) {
          this.interaction = interaction;
          this.db = db;
          this.cooldown = 60000;
          this.TimeNow = new Date();

          this.main();
        }

        async main(): Promise<void> {
          let _get_member_data = await this._get_member_data(
            this.interaction.user.id
          );

          let note = <string>args.filter((arg) => arg.name === 'note')[0].value;

          if (note.length > 200)
            return this.response(
              'Error',
              '#ff0000',
              'Your note can not be more than 200 symbols',
              'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              true
            );

          let random_id = Math.floor(Math.random() * 5540);

          interface Note {
            note: string;
            time: Date;
            id: number;
          }

          let new_note: Note = {
            note: note,
            time: this.TimeNow,
            id: random_id,
          };

          let new_cooldown = this.TimeNow.getTime() + this.cooldown;

          if (_get_member_data.cooldown! > this.TimeNow.getTime())
            return this.response(
              'Error',
              '#ff0000',
              'Your cooldown has not expired!',
              'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless',
              true
            );

          this.check_buttons(this.interaction.user.id, new_note, new_cooldown);
        }

        async response(
          title: string,
          color: Discord.ColorResolvable,
          description: string,
          thumbnail: string,
          epheremal?: boolean
        ): Promise<void> {
          interaction.followUp({
            embeds: [
              {
                title,
                author: {
                  name: this.interaction.user.tag,
                  iconURL: this.interaction.user.avatarURL({ dynamic: true })!,
                },
                thumbnail: {
                  url: thumbnail,
                },
                color,
                description,
                timestamp: this.TimeNow,
              },
            ],
            ephemeral: epheremal,
          });
        }

        private async check_buttons(
          member: string,
          note: {},
          cooldown: number
        ): Promise<void> {
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
                color: 'YELLOW',
                description: `**Are you sure about this?**`,
              },
            ],
            components: [
              new Discord.MessageActionRow().addComponents(...buttons),
            ],
            fetchReply: true,
          });

          let answer: Discord.MessageComponentInteraction =
            await ask_answer.awaitMessageComponent({
              filter: (button) => interaction.user.id === button.user.id,
              time: 180000,
            });

          ask_answer.delete();

          switch (answer.customId) {
            case 'yes':
              await this._overwrite_member_data(member, note, cooldown);
              this.response(
                `Success`,
                '#00ff00',
                'Note was successfully added!',
                'https://cdn.discordapp.com/emojis/966737934457905202.webp?size=128&quality=lossless'
              );
              break;

            case 'no':
              this.response(
                'Error',
                '#ff0000',
                'Rejected by author!',
                'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless'
              );
              break;
            default:
              break;
          }
        }

        private async _overwrite_member_data(
          member_id: string,
          note: {},
          cooldown: number
        ): Promise<void> {
          if (!member_id || !note || !cooldown)
            throw new Error('One of arguments was not provided');

          let _users_db: DB.Document = this.db.collection('notes');

          let _current_user = <UserNoteType>await _users_db.findOne({
              login: member_id,
            }) || {};

          let user_notes = _current_user.notes || [];

          user_notes.push(note);

          if (!_current_user.login) {
            _users_db.insertOne({
              login: member_id,
              notes: user_notes,
              cooldown,
            });
          } else {
            _users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  notes: user_notes,
                  cooldown,
                },
              }
            );
          }
        }

        private async _get_member_data(member_id: string): Promise<any> {
          if (!member_id) throw new Error('Member Id was not provided!');

          let _users_db: DB.Document = this.db.collection('notes');

          let _current_user = <UserNoteType>await _users_db.findOne({
              login: member_id,
            }) || {};

          return _current_user;
        }
      }
      new Note(interaction);
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
