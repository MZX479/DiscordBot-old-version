import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';
import { UserType } from '../types';

type fieldType = {
  name: string;
  value: string;
};

const command: Command = {
  slash: {
    name: 'leaderboard',
    description: 'leaderboard',
  },

  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const users_db = db.collection('users');
      const users_data = <UserType[]>await users_db
        .find({
          coins: {
            $gt: 0,
          },
        })
        .sort({
          coins: -1,
        })
        .toArray();

      const pages: fieldType[][] = [];
      const embeds: Discord.MessageEmbed[] = [];

      let current_page = 0;
      let number = 1;
      let pos = 1;
      let leader: undefined | Discord.GuildMember;
      const members = await interaction.guild!.members.fetch({
        user: users_data.map((user) => user.login),
      });

      for (let user of users_data) {
        const member = members.get(user.login);
        if (!member) continue;

        if (pos === 1) leader = member;

        const field: fieldType = {
          name: `${pos++}. ${member.user.tag}`,
          value: `${user.coins} :money_with_wings:`,
        };

        if (pages[current_page]) pages[current_page].push(field);
        else pages[current_page] = [field];

        number++;

        if (number === 10) {
          number = 1;
          current_page++;
        }
      }

      let page_counter = 1;

      for (let page of pages) {
        const embed = new Discord.MessageEmbed()
          .setTitle('Leaderboard')
          .addFields(...page)
          .setColor('YELLOW')
          .setFooter(`Page ${page_counter++} of ${pages.length}`);

        if (leader)
          embed.setThumbnail(leader.displayAvatarURL({ dynamic: true })!);

        embeds.push(embed);
      }

      const prev_button = new Discord.MessageButton()
        .setLabel('Previos')
        .setStyle('SECONDARY')
        .setCustomId('prev')
        .setDisabled(true);
      const next_button = new Discord.MessageButton()
        .setLabel('Next')
        .setStyle('SECONDARY')
        .setCustomId('next');

      const buttons_row = new Discord.MessageActionRow().addComponents(
        ...[prev_button, next_button]
      );

      const menu_message = await (<Promise<Discord.Message>>(
        interaction.followUp({
          embeds: [embeds[0]],
          components: embeds[1] ? [buttons_row] : undefined,
        })
      ));

      if (!embeds[1]) return;

      const collector = await menu_message.createMessageComponentCollector({
        time: 180000,
      });

      current_page = 0;

      let update_message = async (button: Discord.ButtonInteraction) => {
        const row = new Discord.MessageActionRow().addComponents(
          ...[prev_button, next_button]
        );

        button.update({
          embeds: [embeds[current_page]],
          components: [row],
        });
      };

      collector.on('collect', (interact) => {
        if (!interact.isButton()) return;

        const button = interact;

        switch (button.customId) {
          case 'prev':
            if (current_page - 1 < 0) return;
            --current_page;

            if (current_page <= 0) {
              prev_button.disabled = true;
            }
            if (current_page < embeds.length - 1) {
              next_button.disabled = false;
            }
            update_message(button);
            break;
          case 'next':
            if (current_page + 1 > embeds.length - 1) return;
            current_page++;

            if (current_page === embeds.length - 1) {
              next_button.disabled = true;
            }

            if (current_page > 0) {
              prev_button.disabled = false;
            }

            update_message(button);
            break;
        }
      });

      collector.on('end', () => {
        menu_message.edit({ components: [] });
      });
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};

export { command };
