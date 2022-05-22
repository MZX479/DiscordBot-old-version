import * as Discord from 'discord.js';

export function check_value(param: number): boolean {
  return param % 2 === 0;
}

export function random_id_letters(): string {
  return '_' + Math.random().toString(36).slice(2);
}

export function random_id_long_numbers(): number {
  return Math.floor(Math.random() * 1234567890);
}

export class hello_world {
  interaction: Discord.CommandInteraction;
  time: Date;
  constructor(interaction: Discord.CommandInteraction) {
    this.time = new Date();
    this.hello_world();
  }

  hello_world(): void {
    this.interaction.followUp({
      embeds: [
        {
          author: {
            name: this.interaction.user.id,
            iconURL: this.interaction.user.avatarURL({ dynamic: true })!,
          },
          description: 'hello world!',
          timestamp: this.time,
        },
      ],
    });
  }
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

  reply_true(description: string, options: {} = {}): Promise<Discord.Message> {
    if (!description)
      throw new Error('description was not provided (true_response)');

    let reply_true: Discord.MessageEmbed = this.get_embed({
      color: 'GREEN',
      description: description,
      ...options,
    });

    return this.send_embed(reply_true);
  }

  reply_false(
    description: string,
    options: {} = {},
    epheremal?: boolean
  ): Promise<Discord.Message> {
    if (!description)
      throw new Error('description was not provided (false_response)');

    let reply_false: Discord.MessageEmbed = this.get_embed({
      color: 'RED',
      description: description,
      ...options,
    });

    return <Promise<Discord.Message>>this.send_embed(reply_false, epheremal);
  }

  send_embed(
    completted_embed: Discord.MessageEmbed,
    epheremal?: boolean
  ): Promise<Discord.Message> {
    if (!completted_embed) throw new Error('Embed was not given!');

    return <Promise<Discord.Message>>this.interaction.followUp({
      embeds: [completted_embed],
      ephemeral: epheremal,
    });
  }
}

export interface ClubInterface {
  club_name: string;
  owner: string;
  users?: [];
}
