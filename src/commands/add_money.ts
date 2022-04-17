import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  ephemeral: true,
  slash: {
    name: 'add-money',
    description: 'Добавить бабки',
    options: [
      {
        name: 'деньги',
        description: 'деньги',
        type: 4,
        required: true,
      },

      {
        name: 'упоминание',
        description: 'ЛИБО Упоминание участника',
        type: 6,
        required: false,
      },
      {
        name: 'айди',
        description: 'ЛИБО Айди участника',
        type: 3,
        required: false,
      },
    ],
  },

  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);

    function err(content: string) {
      interaction.followUp({
        ephemeral: true,
        embeds: [
          {
            description: content,
          },
        ],
      });
    }

    function success(content: string) {
      interaction.followUp({
        ephemeral: false,
        content,
      });
    }

    try {
      let member = <Discord.GuildMember>(
        args.filter((arg) => arg.name === 'упоминание')[0]?.member
      );
      let member_id = <string>(
        args.filter((arg) => arg.name === 'айди')[0]?.value
      );
      let amount = Number(args.filter((arg) => arg.name === 'деньги')[0].value);

      if (!member && member_id) {
        member = await interaction.guild!.members.fetch(member_id);
        member_id = member.id;
      }

      if (!member) return err('Вы не указали пользователя!');

      if (isNaN(amount)) return err('Деньги должны быть числом!');
      if (amount <= 0 || amount > 10e5) return err('Деньга плоха');

      const buttons = [
        new Discord.MessageButton()
          .setLabel('Да')
          .setStyle('SUCCESS')
          .setDisabled(false)
          .setCustomId('yes'),
        new Discord.MessageButton()
          .setLabel('Нет')
          .setStyle('DANGER')
          .setDisabled(false)
          .setCustomId('no'),
      ];

      const ask_asnwer = <Discord.Message>await interaction.followUp({
        content: 'ВЫ точно хотите перевести Деньга?',
        components: [new Discord.MessageActionRow().addComponents(...buttons)],
        fetchReply: true,
      });

      const answer = await ask_asnwer.awaitMessageComponent({
        filter: (button) => interaction.user.id === button.user.id,
        time: 180000,
      });

      type userType = {
        login: string;
        coins: number;
      };

      ask_asnwer.delete();

      switch (answer.customId) {
        case 'yes':
          const users_db = db.collection('users');
          const user_data = <userType>((await users_db.findOne({
            login: member.user.id,
          })) || {});

          const new_balance = (user_data.coins || 0) + amount;
          console.log(user_data);

          if (!user_data.login) {
            users_db.insertOne({
              login: member.id,
              coins: amount,
            });
          } else {
            users_db.updateOne(
              {
                login: member.id,
              },
              {
                $set: {
                  coins: new_balance,
                },
              }
            );
          }

          answer.reply(
            `Вы успешно добавили ${amount} Деньгы на счеть пользователя ${member}`
          );
          break;

        case 'no':
          answer.reply(`ок`);
          break;
      }
    } catch (e) {
      let err = <{ name: string; message: String }>e;

      bot.users.cache
        .get(f.config.owner)
        ?.send(`**ERROR** \`${err.name}\`\n\`${err.message}\``);
      console.error(e);
    }
  },
};

export { command };
