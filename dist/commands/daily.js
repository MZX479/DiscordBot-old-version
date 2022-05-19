Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
var _exports = require("../exports");
const daily_amount = 1000;
const command = {
    slash: {
        name: 'daily',
        description: `gives a member a ${daily_amount} of money's`
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Daily extends _exports.Response {
                async main() {
                    var ref, ref1, ref2;
                    let member_data = await this._get_member_data(interaction.user.id, 'users');
                    const new_cooldown = this.time.getTime() + this.cooldown;
                    let cooldown_to_write = (((ref = member_data[1]) === null || ref === void 0 ? void 0 : ref.daily_cooldown) || 0) + new_cooldown;
                    let new_member_ballance = (((ref1 = member_data[1]) === null || ref1 === void 0 ? void 0 : ref1.coins) || 0) + daily_amount;
                    if (((ref2 = member_data[1]) === null || ref2 === void 0 ? void 0 : ref2.daily_cooldown) > this.time.getTime()) {
                        return this.reply_false('Your cooldown was not expired!', {
                            thumbnail: {
                                url: 'https://cdn.discordapp.com/emojis/923899365385449472.webp?size=64&quality=lossless'
                            }
                        }, true);
                    } else {
                        await this._overwrite_member_data(interaction.user.id, new_member_ballance, cooldown_to_write);
                        this.reply_true(`Success! You received \`${daily_amount}💸\`\n Come Tommorow`, {
                            thumbnail: {
                                url: 'https://cdn.discordapp.com/emojis/966737934457905202.webp?size=64&quality=lossless'
                            }
                        });
                    }
                }
                async _get_member_data(member_id, collection) {
                    if (!member_id || !collection) throw new Error('member id or collection were not provided!');
                    const users_db = db.collection(collection);
                    const _get_member_data = await users_db.findOne({
                        login: member_id
                    });
                    const data_array = [
                        users_db,
                        _get_member_data, 
                    ];
                    return data_array;
                }
                async _overwrite_member_data(member_id, new_ballance, daily_cooldown) {
                    var ref;
                    if (!new_ballance || !daily_cooldown || !member_id) throw new Error('new_ballance, member_id or cooldown were not provided!');
                    let member_data = await this._get_member_data(interaction.user.id, 'users');
                    if (!((ref = member_data[1]) === null || ref === void 0 ? void 0 : ref.login)) {
                        var ref4;
                        (ref4 = member_data[0]) === null || ref4 === void 0 ? void 0 : ref4.insertOne({
                            login: member_id,
                            coins: new_ballance,
                            daily_cooldown
                        });
                    } else {
                        var ref5;
                        (ref5 = member_data[0]) === null || ref5 === void 0 ? void 0 : ref5.updateOne({
                            login: member_id
                        }, {
                            $set: {
                                coins: new_ballance,
                                daily_cooldown
                            }
                        });
                    }
                }
                constructor(){
                    super(interaction);
                    this.time = new Date();
                    this.cooldown = 860000000;
                    this.main();
                }
            }
            new Daily();
        } catch (e) {
            var ref3;
            (ref3 = bot.users.cache.get(f.config.owner)) === null || ref3 === void 0 ? void 0 : ref3.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
