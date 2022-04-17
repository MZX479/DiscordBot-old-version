Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
const command = {
    slash: {
        name: 'daily',
        description: 'daily'
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {} catch (e) {
            var ref;
            (ref = bot.users.cache.get(f.config.owner)) === null || ref === void 0 ? void 0 : ref.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
