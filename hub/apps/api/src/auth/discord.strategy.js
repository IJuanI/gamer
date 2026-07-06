"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_discord_1 = require("passport-discord");
const users_service_1 = require("../users/users.service");
/**
 * Registered only when DISCORD_CLIENT_ID/SECRET are set (see auth.module).
 * Profile shape comes from passport-discord.
 */
let DiscordStrategy = class DiscordStrategy extends (0, passport_1.PassportStrategy)(passport_discord_1.Strategy, "discord") {
    users;
    constructor(users) {
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: `${process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000"}/api/auth/discord/callback`,
            scope: ["identify", "email"],
        });
        this.users = users;
    }
    async validate(_accessToken, _refreshToken, profile) {
        const avatarUrl = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null;
        return this.users.findOrCreateByOAuth({
            provider: "discord",
            providerAccountId: profile.id,
            email: profile.email ?? `${profile.id}@discord.local`,
            displayName: profile.global_name ?? profile.username ?? "GamER",
            avatarUrl,
        });
    }
};
exports.DiscordStrategy = DiscordStrategy;
exports.DiscordStrategy = DiscordStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], DiscordStrategy);
