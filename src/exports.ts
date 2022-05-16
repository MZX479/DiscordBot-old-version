import * as Discord from 'discord.js';
import { APIMessage } from 'discord-api-types/v10';

export function check_value(param: number): boolean {
  return param % 2 === 0;
}

export function random_id_letters(): string {
  return '_' + Math.random().toString(36).slice(2);
}

export function random_id_long_numbers(): number {
  return Math.floor(Math.random() * 1234567890);
}

export class Response {
  interaction: Discord.CommandInteraction;
  time: Date;
  constructor(interaction: Discord.CommandInteraction) {
    this.interaction = interaction;
    this.time = new Date();
  }

  get_embed(embed_options: {}): Discord.MessageEmbed {
    if (!embed_options) throw new Error('Embed was not given');

    let interaction = this.interaction;

    let result_embed = new Discord.MessageEmbed({
      author: {
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL({ dynamic: true })!,
      },
      timestamp: this.time,

      ...embed_options,
    });

    return result_embed;
  }

  reply_true(
    description: string,
    options: {} = {}
  ): Promise<Discord.Message | APIMessage | any> {
    if (!description)
      throw new Error('description was not provided (true_response)');

    let reply_true: Discord.MessageEmbed = this.get_embed({
      color: 'GREEN',
      description: description,
      ...options,
    });

    return this.send_embed(reply_true);
  }

  false_embed(
    description: string,
    options: {} = {}
  ): Promise<Discord.Message | APIMessage | any> {
    if (!description)
      throw new Error('description was not provided (false_response)');

    let reply_false: Discord.MessageEmbed = this.get_embed({
      color: 'GREEN',
      description: description,
      ...options,
    });

    return this.send_embed(reply_false);
  }

  send_embed(completted_embed: Discord.MessageEmbed) {
    if (!completted_embed) throw new Error('Embed was not given!');

    return this.interaction.followUp({
      embeds: [completted_embed],
    });
  }
}
