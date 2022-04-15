"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Discord = require("discord.js");
module.exports = {
    aliases: 'note',
    description: '',
    execute: function (bot, f, mongo, args, message) {
        return __awaiter(this, void 0, void 0, function () {
            var db, Note;
            return __generator(this, function (_a) {
                db = mongo.db(message.guild.id);
                try {
                    Note = /** @class */ (function () {
                        function Note(message, args) {
                            this.message = message;
                            this.args = args;
                            this.db = db;
                            this.cooldown = 86000000;
                            this.main();
                        }
                        Note.prototype.main = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _get_user_data, user_label, label_id, user_note, noteCooldown;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._get_member_data(this.message.member.id)];
                                        case 1:
                                            _get_user_data = _a.sent();
                                            user_label = this.args.join(' ');
                                            if (!user_label || user_label.length > 100)
                                                return [2 /*return*/, this.response('Error', '#ff0000', "Note wasn't given or too much to overwrite")];
                                            label_id = Math.random().toString(36).slice(2);
                                            user_note = {
                                                label: user_label,
                                                id: label_id,
                                                time: new Date()
                                            };
                                            noteCooldown = new Date().getTime() + this.cooldown;
                                            if (_get_user_data.note_cooldown > new Date().getTime()) {
                                                return [2 /*return*/, this.response('Error', '#ff0000', 'Your cooldown has not elapsed')];
                                            }
                                            else {
                                                this._overwrite_member_data(this.message.member.id, user_note, noteCooldown);
                                                this.response('Success', '#00ff00', 'Note was successfullly added!');
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        Note.prototype.response = function (title, color, description) {
                            return __awaiter(this, void 0, void 0, function () {
                                var response_embed;
                                return __generator(this, function (_a) {
                                    if (!title || !color || !description)
                                        throw new Error("One of components wasn't given!");
                                    response_embed = new Discord.MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setAuthor(this.message.author.tag, this.message.author.avatarURL({ dynamic: true }))
                                        .setDescription(description)
                                        .setTimestamp();
                                    this.message.channel.send({ embeds: [response_embed] });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        Note.prototype._overwrite_member_data = function (member_id, label, cooldown) {
                            return __awaiter(this, void 0, void 0, function () {
                                var users_db, current_user, user_labels;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!member_id || !label || !cooldown)
                                                throw new Error("One of arguments weren't given");
                                            users_db = this.db.collection('notes');
                                            return [4 /*yield*/, users_db.findOne({ login: member_id })];
                                        case 1:
                                            current_user = (_a.sent()) || {};
                                            user_labels = current_user.labels || [];
                                            user_labels.push(label);
                                            if (!current_user) {
                                                users_db.insertOne({
                                                    login: member_id,
                                                    labels: user_labels,
                                                    note_cooldown: cooldown
                                                });
                                            }
                                            else {
                                                users_db.updateOne({
                                                    login: member_id
                                                }, {
                                                    $set: {
                                                        labels: user_labels,
                                                        note_cooldown: cooldown
                                                    }
                                                });
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        Note.prototype._get_member_data = function (member_id) {
                            return __awaiter(this, void 0, void 0, function () {
                                var users_db, current_user;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!member_id)
                                                throw new Error("Didn't get a member id!");
                                            users_db = this.db.collection('notes');
                                            return [4 /*yield*/, users_db.findOne({ login: member_id })];
                                        case 1:
                                            current_user = (_a.sent()) || {};
                                            return [2 /*return*/, current_user];
                                    }
                                });
                            });
                        };
                        return Note;
                    }());
                    new Note(message, args);
                }
                catch (e) {
                    bot.users.cache
                        .get(f.config.owner)
                        .send("**ERROR** `".concat(e.name, "`\n`").concat(e.message, "`"));
                    console.error(e);
                }
                return [2 /*return*/];
            });
        });
    }
};
