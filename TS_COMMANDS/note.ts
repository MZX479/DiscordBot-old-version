import * as Discord from "discord.js";
//import * as DB from "mongodb";

module.exports = {
  aliases: "EXAMPLE",
  description: "",
  async execute(bot, f, mongo, args, message) {
    //const db: DB.Db = mongo.db(message.guild.id);
    try {
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        .send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};
