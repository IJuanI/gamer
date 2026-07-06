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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const dto_1 = require("./dto");
const decorators_1 = require("./decorators");
const guards_1 = require("./guards");
const COOKIE_NAME = "access_token";
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    setSessionCookie(res, user) {
        const token = this.auth.signToken(user);
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
    }
    async register(dto, res) {
        const user = await this.auth.register(dto);
        this.setSessionCookie(res, user);
        return { user: users_service_1.UsersService.toPublic(user) };
    }
    async login(dto, res) {
        const user = await this.auth.validateCredentials(dto.email, dto.password);
        this.setSessionCookie(res, user);
        return { user: users_service_1.UsersService.toPublic(user) };
    }
    logout(res) {
        res.clearCookie(COOKIE_NAME, { path: "/" });
        return { ok: true };
    }
    me(user) {
        if (!user)
            throw new common_1.UnauthorizedException();
        return { user: users_service_1.UsersService.toPublic(user) };
    }
    // ── OAuth: Discord ──────────────────────────────────────
    discordLogin() {
        // Passport redirects to Discord.
    }
    discordCallback(req, res) {
        this.setSessionCookie(res, req.user);
        res.redirect(`${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/dashboard`);
    }
    // ── OAuth: Google ───────────────────────────────────────
    googleLogin() {
        // Passport redirects to Google.
    }
    googleCallback(req, res) {
        this.setSessionCookie(res, req.user);
        res.redirect(`${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/dashboard`);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("logout"),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Get)("me"),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)("discord"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("discord")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "discordLogin", null);
__decorate([
    (0, common_1.Get)("discord/callback"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("discord")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "discordCallback", null);
__decorate([
    (0, common_1.Get)("google"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)("google/callback"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
