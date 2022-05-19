import { Command_type } from '../types';

export default async function (bot, f, mongo, message) {
  if (message.author.bot || message.channel.type != 'GUILD_TEXT') return;
  if (!message.content.startsWith(f.config.prefix)) return;

  let args = message.content.split(' ');
  let command_name = args[0].replace(f.config.prefix, '');
  args.splice(0, 1);
  console.log(f.commands);
  let command = f.commands.filter((command) =>
    command.slash.name.split(' ').includes(command_name)
  );

  let command_func = command.first();

  if (!command_func) return;

  await message.delete();

  message.__proto__.reply = function (text) {
    return this.channel.send(`${this.author}, ` + text);
  };

  command_func.execute(bot, f, mongo, args, message);
}
