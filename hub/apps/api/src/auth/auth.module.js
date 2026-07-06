"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const users_module_1 = require("../users/users.module");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const discord_strategy_1 = require("./discord.strategy");
const google_strategy_1 = require("./google.strategy");
// OAuth strategies blow up on construction without credentials, so only
// register them when the corresponding env vars are present.
const oauthProviders = [];
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    oauthProviders.push(discord_strategy_1.DiscordStrategy);
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    oauthProviders.push(google_strategy_1.GoogleStrategy);
}
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? "dev-only-change-me-please-32chars-min",
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        // RolesGuard is NOT registered globally: global guards run before
        // controller-scoped JwtAuthGuard, so request.user wouldn't be set yet.
        // Instead protected routes use @UseGuards(JwtAuthGuard, RolesGuard).
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, ...oauthProviders],
    })
], AuthModule);
