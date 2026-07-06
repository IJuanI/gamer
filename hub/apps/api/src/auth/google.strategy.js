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
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const users_service_1 = require("../users/users.service");
/** Registered only when GOOGLE_CLIENT_ID/SECRET are set (see auth.module). */
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, "google") {
    users;
    constructor(users) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000"}/api/auth/google/callback`,
            scope: ["email", "profile"],
        });
        this.users = users;
    }
    async validate(_accessToken, _refreshToken, profile, done) {
        const email = profile.emails?.[0]?.value ?? `${profile.id}@google.local`;
        const user = await this.users.findOrCreateByOAuth({
            provider: "google",
            providerAccountId: profile.id,
            email,
            displayName: profile.displayName ?? "GamER",
            avatarUrl: profile.photos?.[0]?.value ?? null,
        });
        done(null, user);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], GoogleStrategy);
