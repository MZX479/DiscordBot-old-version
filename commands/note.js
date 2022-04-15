module.exports = {
  aliases: 'note',
  description: '',
  async execute(bot, f, mongo, args, message) {
    const Discord = require(`discord.js`);
    const db = mongo.db(message.guild.id);
    try {
      class Note {
        constructor() {
          this.message = message;
          this.args = args;
          this.db = db;
          this.cooldown = 10000;

          this.main();
        }

        async main() {
          let user_label = this.args.join(' ');
          if (!user_label)
            this.response('Error', `ff0000`, "note to write wasn't given!");

          if (user_label.length > 100)
            this.response(
              `Error`,
              'ff0000',
              "Your note can't have more than 100 symbols. Get it to 100 or less please!"
            );

          let label_id = Math.random().toString(36).slice(2);

          let user_note = {
            label: user_label,
            id: label_id,
            time: new Date(),
          };

          this.overwrite_member_data(
            this.message.member.id,
            user_note,
            this.cooldown
          );

          this.response(`Success!`, '00ff00', 'Note was successfully added!');
        }

        async response(title, color, text) {
          if (!title || !color || !text)
            throw new Error("One of components wasn't given!");

          let response_embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor(color)
            .setAuthor(
              this.message.author.tag,
              this.message.author.avatarURL({ dynamic: true })
            )
            .setDescription(`**${text}**`)
            .setTimestamp();

          this.message.channel.send({ embeds: [response_embed] });
        }

        async overwrite_member_data(member_id, label, cooldown) {
          if (!member_id || !label || !cooldown)
            throw new Error(`One of arguments weren't given!`);

          let users_db = this.db.collection('notes');
          let current_user =
            (await users_db.findOne({ login: member_id })) || {};

          let user_labels = current_user.labels || [];

          user_labels.push(label);

          if (!current_user[0]) {
            users_db.insertOne({
              login: member_id,
              labels: label,
              cooldown: cooldown,
            });
          } else {
            users_db.updateOne(
              {
                login: member_id,
              },
              {
                $set: {
                  labels: label,
                  cooldown: cooldown,
                },
              }
            );
          }
        }
      }
      new Note();
    } catch (e) {
      bot.users.cache
        .get(f.config.owner)
        .send(`**ERROR** \`${e.name}\`\n\`${e.message}\``);
      console.error(e);
    }
  },
};
