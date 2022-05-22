Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
var swcHelpers = require("@swc/helpers");
var _parseDuration = swcHelpers.interopRequireDefault(require("parse-duration"));
const command = {
    slash: {
        name: 'mute',
        description: 'Mute member',
        options: [
            {
                name: 'reason',
                description: 'Mute reason',
                type: 3,
                required: true
            },
            {
                name: 'time',
                description: 'Mute time',
                type: 3,
                required: true
            },
            {
                name: 'ping',
                description: 'Member ping',
                type: 6,
                required: false
            },
            {
                name: 'id',
                description: 'Member id',
                type: 3,
                required: false
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        try {
            class Mute {
                async main() {
                    var ref, ref1, ref2, ref3, ref4, ref5;
                    let member = (ref = args.filter((arg)=>arg.name === 'ping'
                    )[0]) === null || ref === void 0 ? void 0 : ref.member;
                    let member_id = (ref1 = args.filter((arg)=>arg.name === 'id'
                    )[0]) === null || ref1 === void 0 ? void 0 : ref1.value;
                    let string_time = (ref2 = args.filter((arg)=>arg.name === 'time'
                    )[0]) === null || ref2 === void 0 ? void 0 : ref2.value;
                    let reason = (ref3 = args.filter((arg)=>arg.name === 'reason'
                    )[0]) === null || ref3 === void 0 ? void 0 : ref3.value;
                    if (!member && member_id) {
                        console.log(member_id);
                        member = await interaction.guild.members.fetch(member_id);
                        member_id = member.id;
                    }
                    if (!member) return this.false_embed('Вы не указали пользователя!');
                    this.member = member;
                    this.member_id = member_id;
                    const time = (0, _parseDuration).default(string_time); // 7d -> в мс
                    if (isNaN(time) || time <= 0) return this.false_embed('Bad time provided');
                    if (!reason) return this.false_embed('No reason provided');
                    const till = new Date().getTime() + time;
                    const user_data = await this.get_data();
                    const new_mute = {
                        moderator: interaction.user.id,
                        till,
                        time,
                        reason
                    };
                    const mutes_list = user_data.mutes || [];
                    mutes_list.push(new_mute);
                    user_data.mutes = mutes_list;
                    user_data.isMuted = new_mute;
                    const me = (ref4 = interaction.guild) === null || ref4 === void 0 ? void 0 : ref4.me; // Профиль бота на текущем сервере
                    if (member.roles.highest.position >= (me === null || me === void 0 ? void 0 : me.roles.highest.position)) return this.false_embed("I can't mute this member");
                    if (member.user.bot) return this.false_embed("I can't mute bots.");
                    const mute_role = (ref5 = interaction.guild) === null || ref5 === void 0 ? void 0 : ref5.roles.cache.get(this.mute_role_id);
                    if (!mute_role) return this.false_embed("I can't find mute role");
                    await member.roles.add(mute_role).catch((err)=>{
                        this.false_embed('Something went wrong.');
                        console.error(err);
                    });
                    await this.update_data(user_data);
                    this.true_embed(`You successfully muted \`${member.user.tag}\` for \`${string_time}\``);
                }
                async get_data() {
                    const users_db = db.collection('users');
                    const user_data = await users_db.findOne({
                        login: this.member_id
                    }) || {};
                    return user_data;
                }
                async update_data(data) {
                    const users_db = db.collection('users');
                    if (data.login) {
                        return users_db.updateOne({
                            login: data.login
                        }, {
                            $set: {
                                mutes: data.mutes,
                                isMuted: data.isMuted
                            }
                        });
                    } else {
                        return users_db.insertOne({
                            login: this.member_id,
                            ...data
                        });
                    }
                }
                false_embed(content) {
                    return interaction.followUp({
                        embeds: [
                            {
                                color: 'RED',
                                description: content,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.displayAvatarURL({
                                        dynamic: true
                                    })
                                }
                            }, 
                        ]
                    });
                }
                true_embed(content) {
                    return interaction.followUp({
                        embeds: [
                            {
                                color: 'GREEN',
                                description: content,
                                author: {
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.displayAvatarURL({
                                        dynamic: true
                                    })
                                }
                            }, 
                        ]
                    });
                }
                constructor(){
                    this.mute_role_id = '870604224386433044';
                    this.main();
                }
            }
            new Mute();
        } catch (err) {
            var ref6;
            let e = err;
            (ref6 = bot.users.cache.get(f.config.owner)) === null || ref6 === void 0 ? void 0 : ref6.send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
