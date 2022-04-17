Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = void 0;
var swcHelpers = require("@swc/helpers");
var Discord = swcHelpers.interopRequireWildcard(require("discord.js"));
const command = {
    ephemeral: true,
    slash: {
        name: 'add-money',
        description: 'Добавить бабки',
        options: [
            {
                name: 'деньги',
                description: 'деньги',
                type: 4,
                required: true
            },
            {
                name: 'упоминание',
                description: 'ЛИБО Упоминание участника',
                type: 6,
                required: false
            },
            {
                name: 'айди',
                description: 'ЛИБО Айди участника',
                type: 3,
                required: false
            }, 
        ]
    },
    async execute (bot, f, mongo, args, interaction) {
        const db = mongo.db(interaction.guild.id);
        function err(content) {
            interaction.followUp({
                ephemeral: true,
                embeds: [
                    {
                        description: content
                    }, 
                ]
            });
        }
        function success(content) {
            interaction.followUp({
                ephemeral: false,
                content
            });
        }
        try {
            var ref, ref1;
            let member = (ref = args.filter((arg)=>arg.name === 'упоминание'
            )[0]) === null || ref === void 0 ? void 0 : ref.member;
            let member_id = (ref1 = args.filter((arg)=>arg.name === 'айди'
            )[0]) === null || ref1 === void 0 ? void 0 : ref1.value;
            let amount = Number(args.filter((arg)=>arg.name === 'деньги'
            )[0].value);
            if (!member && member_id) {
                member = await interaction.guild.members.fetch(member_id);
                member_id = member.id;
            }
            if (!member) return err('Вы не указали пользователя!');
            if (isNaN(amount)) return err('Деньги должны быть числом!');
            if (amount <= 0 || amount > 10e5) return err('Деньга плоха');
            const buttons = [
                new Discord.MessageButton().setLabel('Да').setStyle('SUCCESS').setDisabled(false).setCustomId('yes'),
                new Discord.MessageButton().setLabel('Нет').setStyle('DANGER').setDisabled(false).setCustomId('no'), 
            ];
            const ask_asnwer = await interaction.followUp({
                content: 'ВЫ точно хотите перевести Деньга?',
                components: [
                    new Discord.MessageActionRow().addComponents(...buttons)
                ],
                fetchReply: true
            });
            const answer = await ask_asnwer.awaitMessageComponent({
                filter: (button)=>interaction.user.id === button.user.id
                ,
                time: 180000
            });
            ask_asnwer.delete();
            switch(answer.customId){
                case 'yes':
                    const users_db = db.collection('users');
                    const user_data = await users_db.findOne({
                        login: member.user.id
                    }) || {};
                    const new_balance = (user_data.coins || 0) + amount;
                    console.log(user_data);
                    if (!user_data.login) {
                        users_db.insertOne({
                            login: member.id,
                            coins: amount
                        });
                    } else {
                        users_db.updateOne({
                            login: member.id
                        }, {
                            $set: {
                                coins: new_balance
                            }
                        });
                    }
                    answer.reply(`Вы успешно добавили ${amount} Деньгы на счеть пользователя ${member}`);
                    break;
                case 'no':
                    answer.reply(`ок`);
                    break;
            }
        } catch (e) {
            var ref2;
            let err = e;
            (ref2 = bot.users.cache.get(f.config.owner)) === null || ref2 === void 0 ? void 0 : ref2.send(`**ERROR** \`${err.name}\`\n\`${err.message}\``);
            console.error(e);
        }
    }
};
exports.command = command;
