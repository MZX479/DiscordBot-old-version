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
    aliases: 'daily',
    description: '',
    execute: function (bot, f, mongo, args, message) {
        return __awaiter(this, void 0, void 0, function () {
            var db, Daily;
            return __generator(this, function (_a) {
                db = mongo.db(message.guild.id);
                try {
                    Daily = /** @class */ (function () {
                        function Daily(message, args) {
                            this.message = message;
                            this.args = args;
                            this.db = db;
                            this.cooldown = 86000000;
                            this.daily_amount = 1000;
                            this.main();
                        }
                        Daily.prototype.main = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _get_member_data, current_time, daily_cooldown;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._get_member_data(this.message.member.id)];
                                        case 1:
                                            _get_member_data = _a.sent();
                                            current_time = new Date().getTime();
                                            daily_cooldown = current_time + this.cooldown;
                                            if (!(_get_member_data.daily_cooldown > current_time)) return [3 /*break*/, 2];
                                            return [2 /*return*/, this.response('Error', '#ff0000', 'Your cooldown has not elapsed')];
                                        case 2: return [4 /*yield*/, this._overwrite_member_data(this.message.member.id, this.daily_amount, daily_cooldown)];
                                        case 3:
                                            _a.sent();
                                            this.response('Success', '#00fff00', "Success. Your ballance now is `".concat(_get_member_data.coins + this.daily_amount, "` \n Comeback tommorow!"));
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        Daily.prototype.response = function (title, color, text) {
                            return __awaiter(this, void 0, void 0, function () {
                                var response;
                                return __generator(this, function (_a) {
                                    if (!title || !color || !text)
                                        throw new Error('One of arguments were not given!');
                                    response = new Discord.MessageEmbed()
                                        .setColor(color)
                                        .setTitle(title)
                                        .setAuthor(this.message.author.tag, this.message.author.avatarURL({ dynamic: true }))
                                        .setDescription("**".concat(text, "**"))
                                        .setTimestamp();
                                    this.message.channel.send({ embeds: [response] });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        Daily.prototype._overwrite_member_data = function (member_id, daily_amount, cooldown) {
                            return __awaiter(this, void 0, void 0, function () {
                                var users_db, current_user, new_ballance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!member_id || !daily_amount || !cooldown)
                                                throw new Error('One of arguments were not given!');
                                            users_db = this.db.collection('users');
                                            return [4 /*yield*/, users_db.findOne({ login: member_id })];
                                        case 1:
                                            current_user = (_a.sent()) || {};
                                            new_ballance = (current_user.coins || 0) + daily_amount;
                                            if (!current_user) {
                                                users_db.insertOne({
                                                    login: member_id,
                                                    coins: new_ballance,
                                                    daily_cooldown: cooldown
                                                });
                                            }
                                            else {
                                                users_db.updateOne({
                                                    login: member_id
                                                }, {
                                                    $set: {
                                                        coins: new_ballance,
                                                        daily_cooldown: cooldown
                                                    }
                                                });
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        Daily.prototype._get_member_data = function (member_id) {
                            return __awaiter(this, void 0, void 0, function () {
                                var users_db, current_user;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!member_id)
                                                throw new Error('Member id was not provided');
                                            users_db = this.db.collection('users');
                                            return [4 /*yield*/, users_db.findOne({ login: member_id })];
                                        case 1:
                                            current_user = (_a.sent()) || {};
                                            return [2 /*return*/, current_user];
                                    }
                                });
                            });
                        };
                        return Daily;
                    }());
                    new Daily(message, args);
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
