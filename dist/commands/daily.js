Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
var swcHelpers = require("@swc/helpers");
var Discord = swcHelpers.interopRequireWildcard(require("discord.js"));
const command = {
    slash: {
        name: 'daily',
        description: 'Собрать дейлик'
    },
    async execute (bot, f, mongo, args1, message1) {
        const db = mongo.db(message1.guild.id);
        try {
            class Daily {
                async main() {
                    let _get_member_data = await this._get_member_data(this.message.member.id);
                    let current_time = new Date().getTime();
                    let daily_cooldown = current_time + this.cooldown;
                    if (_get_member_data.daily_cooldown > current_time) {
                        return this.response('Error', '#ff0000', 'Your cooldown has not elapsed');
                    } else {
                        await this._overwrite_member_data(this.message.member.user.id, this.daily_amount, daily_cooldown);
                        this.response('Success', '#00fff00', `Success. Your ballance now is \`${_get_member_data.coins + this.daily_amount}\` \n Comeback tommorow!`);
                    }
                }
                async response(title, color, text) {
                    if (!title || !color || !text) throw new Error('One of arguments were not given!');
                    let response = new Discord.MessageEmbed().setColor(color).setTitle(title).setAuthor(this.message.user.tag, this.message.user.avatarURL({
                        dynamic: true
                    })).setDescription(`**${text}**`).setTimestamp();
                    this.message.channel.send({
                        embeds: [
                            response
                        ]
                    });
                }
                async _overwrite_member_data(member_id, daily_amount, cooldown) {
                    if (!member_id || !daily_amount || !cooldown) throw new Error('One of arguments were not given!');
                    let users_db = this.db.collection('users');
                    let current_user = await users_db.findOne({
                        login: member_id
                    }) || {};
                    let new_ballance = (current_user.coins || 0) + daily_amount;
                    if (!current_user) {
                        users_db.insertOne({
                            login: member_id,
                            coins: new_ballance,
                            daily_cooldown: cooldown
                        });
                    } else {
                        users_db.updateOne({
                            login: member_id
                        }, {
                            $set: {
                                coins: new_ballance,
                                daily_cooldown: cooldown
                            }
                        });
                    }
                }
                async _get_member_data(member_id) {
                    if (!member_id) throw new Error('Member id was not provided');
                    let users_db = this.db.collection('users');
                    let current_user = await users_db.findOne({
                        login: member_id
                    }) || {};
                    return current_user;
                }
                constructor(message, args){
                    this.message = message;
                    this.args = args;
                    this.db = db;
                    this.cooldown = 86000000;
                    this.daily_amount = 1000;
                    this.main();
                }
            }
            new Daily();
        } catch (e) {
            bot.users.cache.get(f.config.owner).send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
