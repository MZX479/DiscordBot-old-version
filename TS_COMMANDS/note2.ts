import * as Discord from 'discord.js';
import * as DB from 'mongodb';

module.exports = {
  aliases: 'EXAMPLE',
  description: '',
  async execute(bot, f, mongo, args, message) {
    const db: DB.Db = mongo.db(message.guild.id);
    try {
      class Note {
        private message: Discord.Message | any;
        private args: Array<string>;
        private db: DB.Db;

        constructor(message: Discord.Message, args: Array<string>) {
          this.message = message;
          this.args = args;
          this.db = db;

          this.main();
        }

        async main() {}

        async response(
          title: string,
          color: Discord.ColorResolvable,
          text: string
        ) {
          if (!title || !color || !text)
            throw new Error("One of components wasn't given!");

          let response_embed: Discord.MessageEmbed =
            new Discord.MessageEmbed().setColor(color);
        }

        async _overwrite_member_data() {}

        async _get_member_data() {}
      }
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        .send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};
