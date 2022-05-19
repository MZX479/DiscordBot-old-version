import { Command_type } from '../types';

const event: Command_type = async (bot, f, mongo) => {
  console.log(bot.user!.tag + ' Запущен!');
};

export default event;
