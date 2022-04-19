import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  slash: {
    name: 'avatar',
    description: 'display user avatar',
    options: [
      {
        name: 'ping',
        description: 'Ping a person',
        type: 6,
        required: false,
      },
      {
        name: 'id',
        description: 'Member id',
        type: 3,
        required: false,
      },
    ],
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      class Avatar {
        private interaction: Discord.CommandInteraction;
        private db: DB.Db;
        constructor(interaction: Discord.CommandInteraction) {
          this.interaction = interaction;
          this.db = db;

          this.main();
        }

        private async main() {
          let member = <Discord.GuildMember>(
            args.filter((arg) => arg.name === 'ping')[0]?.member
          );
          let member_id = <string>(
            args.filter((arg) => arg.name === 'id')[0]?.value
          );

          if (!member && member_id) {
            member = await interaction.guild!.members.fetch(member_id);
            member_id = member.id;
          }

          this.success_embed('Success', `Avatar of ${member.user.tag}`, member);
        }

        private success_embed(
          title: string,
          content: string,
          member: Discord.GuildMember
        ) {
          interaction.followUp({
            embeds: [
              {
                title: title,
                author: {
                  name: this.interaction.user.tag,
                  iconURL: this.interaction.user.avatarURL({ dynamic: true })!,
                },
                color: member!.roles.highest.color,
                image: {
                  url: member!.user.avatarURL({
                    dynamic: true,
                  })!,
                },
                description: content,
                timestamp: new Date(),
              },
            ],
          });
        }
      }

      new Avatar(interaction);
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
