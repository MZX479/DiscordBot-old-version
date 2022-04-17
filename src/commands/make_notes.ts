import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  slash: {
    name: 'note',
    description: 'Сделать заметку',
  },
  async execute(bot, f, mongo, args, message) {
    const db: DB.Db = mongo.db(message.guild.id);
    try {
      class Note {
        private message: Discord.Message | any;
        private args: Array<string>;
        private db: DB.Db;
        cooldown: number;

        constructor(message: Discord.Message, args: Array<string>) {
          this.message = message;
          this.args = args;
          this.db = db;
          this.cooldown = 1800000;

          this.main();
        }

        async main() {
          let _get_user_data: DB.Document = await this._get_member_data(
            this.message.member.id
          );

          let user_label: Array<string> | string = this.args.join(' ');

          if (!user_label || user_label.length > 100)
            return this.response(
              'Error',
              '#ff0000',
              "Note wasn't given or too much to overwrite"
            );

          let label_id: string = Math.random().toString(36).slice(2);

          interface Note {
            label: string;
            id: string;
            time: Date;
          }

          let user_note: Note = {
            label: user_label,
            id: label_id,
            time: new Date(),
          };

          let noteCooldown: number = new Date().getTime() + this.cooldown;

          if (_get_user_data.note_cooldown > new Date().getTime()) {
            return this.response(
              'Error',
              '#ff0000',
              'Your cooldown has not elapsed'
            );
          } else {
            this._overwrite_member_data(
              this.message.member.id,
              user_note,
              noteCooldown
            );
            this.response(
              'Success',
              '#00ff00',
              'Note was successfullly added!'
            );
          }
        }

        async response(
          title: string,
          color: Discord.ColorResolvable,
          description: string
        ): Promise<void> {
          if (!title || !color || !description)
            throw new Error("One of components wasn't given!");

          let response_embed: Discord.MessageEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setAuthor(
              this.message.author.tag,
              this.message.author.avatarURL({ dynamic: true })
            )
            .setDescription(description)
            .setTimestamp();

          this.message.channel.send({ embeds: [response_embed] });
        }

        async _overwrite_member_data(
          member_id: string,
          label: any,
          cooldown: number
        ): Promise<void> {
          if (!member_id || !label || !cooldown)
            throw new Error("One of arguments weren't given");

          let users_db: DB.Collection<DB.Document> =
            this.db.collection('notes');

          let current_user: DB.Document =
            (await users_db.findOne({ login: member_id })) || {};

          let user_labels: DB.Document | [] = current_user.labels || [];

          user_labels.push(label);

          if (!current_user) {
            users_db.insertOne({
              login: member_id,
              labels: user_labels,
              note_cooldown: cooldown,
            });
          } else {
            users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  labels: user_labels,
                  note_cooldown: cooldown,
                },
              }
            );
          }
        }

        async _get_member_data(member_id: string) {
          if (!member_id) throw new Error("Didn't get a member id!");

          let users_db: DB.Collection<DB.Document> =
            this.db.collection('notes');

          let current_user =
            (await users_db.findOne({ login: member_id })) || {};

          return current_user;
        }
      }

      new Note(message, args);
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        .send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
