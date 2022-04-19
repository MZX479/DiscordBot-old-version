import {
  Client,
  CommandInteraction,
  CommandInteractionOption,
} from 'discord.js';
import { MongoClient } from 'mongodb';

export type configType = {
  prefix: string;
  owner: string;
};

export type modulesType = {
  config: configType;
  commands: Command[];
};

export type argsType = Readonly<CommandInteractionOption[]>;

export type UserType = {
  login: string;
  coins: number;
};

export type slashType = {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    required: boolean;
    type: number;
  }>;
};

export type Command = {
  slash: slashType;
  ephemeral?: boolean;
  execute: (
    bot: Client,
    f: modulesType,
    mongo: MongoClient,
    args: argsType,
    interaction: CommandInteraction
  ) => Promise<any | void>;
};
