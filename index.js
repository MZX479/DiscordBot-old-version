const { Intents, Client, Collection } = require("discord.js");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const f = require("./config/modules");
const { token } = require("./config/token");
require(`colors`);

const bot = new Client({
  intents: Object.values(Intents.FLAGS),
});
f.commands = new Collection();

MongoClient.connect("mongodb://localhost:27017", (err, mongo) => {
  fs.readdir("./events", async (err, events_dir) => {
    for (let event_file of events_dir) {
      if (!event_file.endsWith(".js")) continue;

      let event_func = require("./events/" + event_file); // ./events/ready.js
      let event_name = event_file.split(" ")[0].replace(".js", "");

      bot.on(event_name, event_func.bind(null, bot, f, mongo));
    }
  });

  fs.readdir("./commands", (err, commands_dir) => {
    for (let command_file of commands_dir) {
      if (!command_file.endsWith(".js")) continue;

      let command_func = require("./commands/" + command_file);

      f.commands.set(command_func.aliases, command_func);
    }
  });
});

bot.login(token);
