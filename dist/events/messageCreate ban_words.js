Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _default;
async function _default(bot, f, mongo, message) {
    const Discord = require('discord.js');
    message.__proto__.reply = function(text) {
        return this.channel.send(`${this.author}, ` + text);
    };
    let timeout = (time)=>new Promise((resolve)=>setTimeout(()=>resolve(true)
            , time)
        )
    ;
    let banned_words = [
        `хуй`,
        `жопа`,
        `говно`,
        `срака`
    ];
    let channel_id = `906529533975478302`;
    let report_channel = message.guild.channels.cache.get(channel_id);
    let message_words = message.content.toLowerCase().split(` `);
    let filter = message_words.filter((word)=>banned_words.includes(word)
    );
    if (filter.length === 0) return;
    message.delete();
    let response = await message.reply(`Без матов пожалуйста!`);
    let report_embed = new Discord.MessageEmbed().setAuthor(bot.user.tag, bot.user.avatarURL({
        dynamic: true
    })).setTitle(`BAN WORDS`).setThumbnail(message.author.avatarURL({
        dynamic: true
    })).addField(`Нарушитель`, `\`${message.author.tag}\` его айди - \`${message.author.id}\``).addField(`Содержание`, `\`${message.content}\``).addField(`Причина`, `\`ban words\``).setTimestamp();
    report_channel.send({
        embeds: [
            report_embed
        ]
    });
    await timeout(5000);
    response.delete();
}
