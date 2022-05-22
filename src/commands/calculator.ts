import * as Discord from 'discord.js';
import * as DB from 'mongodb';
import { type Command } from '../types';

const command: Command = {
  slash: {
    name: 'calculator',
    description: 'calculator',
  },
  async execute(bot, f, mongo, args, interaction) {
    const db: DB.Db = mongo.db(interaction.guild!.id);
    try {
      const buttons = [];

      class Calculator {
        symbols_arr: {
          label: string;
          style: Discord.MessageButtonStyleResolvable;
          inline?: boolean;
        }[] = [
          { label: 'clear', style: 'DANGER' },
          { label: '(_outline', style: 'PRIMARY' },
          { label: ')_outline', style: 'PRIMARY' },
          { label: '/_outline', style: 'PRIMARY' },
          //
          { label: '7', style: 'SECONDARY' },
          { label: '8', style: 'SECONDARY' },
          { label: '9', style: 'SECONDARY' },
          { label: '*_outline', style: 'PRIMARY' },
          //
          { label: '4', style: 'SECONDARY' },
          { label: '5', style: 'SECONDARY' },
          { label: '6', style: 'SECONDARY' },
          { label: '-_outline', style: 'PRIMARY' },
          //
          { label: '1', style: 'SECONDARY' },
          { label: '2', style: 'SECONDARY' },
          { label: '3', style: 'SECONDARY' },
          { label: '+_outline', style: 'PRIMARY' },
          //
          { label: '.', style: 'SECONDARY' },
          { label: '0', style: 'SECONDARY' },
          { label: '00', style: 'SECONDARY' },
          { label: '=', style: 'SUCCESS' },
        ];
        result_field = 'Choose something';
        result_embed = this.get_result_embed();
        collector!: Discord.InteractionCollector<Discord.MessageComponentInteraction>;
        calc_message!: Discord.Message;
        isResult = true;

        main() {
          this.build_message();
        }

        async build_message() {
          const rows_arr: Discord.MessageActionRow[] = [];
          let buttons: Discord.MessageButton[] = [];
          let pos = 1;

          for (let button of this.symbols_arr) {
            const { style, label } = button;

            buttons.push(
              new Discord.MessageButton()
                .setStyle(style)
                .setLabel(label.replace('_outline', ''))
                .setCustomId(label)
            );

            pos++;

            if (pos >= 5) {
              rows_arr.push(
                new Discord.MessageActionRow().addComponents(...buttons)
              );

              pos = 1;
              buttons = [];
            }
          }

          let calc_message = <Discord.Message>await interaction.followUp({
            embeds: [this.get_result_embed()],
            components: rows_arr,
          });

          this.calc_message = calc_message;
          const collector = calc_message.createMessageComponentCollector({
            time: 180000,
            filter: (button) => button.user.id === interaction.user.id,
          });

          this.collector = collector;
          this.bind_events();
        }

        bind_events() {
          this.collector.on('collect', (inter) => {
            if (!inter.isButton()) return;
            const button = inter;

            switch (button.customId) {
              case 'clear':
                this.result_field = 'Choose something';
                this.rerender_embed(button);
                this.isResult = true;
                break;
              case '=':
                try {
                  const result = eval(this.result_field);
                  this.result_field = `Result: ${result}`;
                  this.rerender_embed(button);
                  this.isResult = true;
                } catch (err) {
                  this.result_field = `Something went wrong`;
                  this.rerender_embed(button);
                  this.isResult = true;
                }
                break;
              default:
                if (this.isResult) {
                  this.result_field = '';
                  this.isResult = false;
                }

                let char = button.customId.replace('_outline', '');
                this.result_field += `${
                  button.customId.includes('_outline') ? ` ` + char + ` ` : char
                }`;

                this.rerender_embed(button);
                break;
            }
          });

          this.collector.on('end', () => {
            this.calc_message.delete();
          });
        }

        rerender_embed(button: Discord.ButtonInteraction) {
          button.update({ embeds: [this.get_result_embed()] });
        }

        get_result_embed() {
          return new Discord.MessageEmbed()
            .setColor('BLUE')
            .setDescription(`\`\`\`js\n ${this.result_field}\n\`\`\``)
            .setAuthor(
              interaction.user.tag,
              interaction.user.displayAvatarURL()
            );
        }
      }
      new Calculator().main();
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
