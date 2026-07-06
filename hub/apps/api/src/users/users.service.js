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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    create(data) {
        return this.prisma.user.create({
            data: { ...data, email: data.email.toLowerCase() },
        });
    }
    /** Find a user by OAuth identity, creating one (and the User) on first login. */
    async findOrCreateByOAuth(params) {
        const existing = await this.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: params.provider,
                    providerAccountId: params.providerAccountId,
                },
            },
            include: { user: true },
        });
        if (existing)
            return existing.user;
        const email = params.email.toLowerCase();
        // Reuse a local account with the same email if one exists; else create.
        const user = (await this.prisma.user.findUnique({ where: { email } })) ??
            (await this.prisma.user.create({
                data: { email, displayName: params.displayName, avatarUrl: params.avatarUrl },
            }));
        await this.prisma.account.create({
            data: {
                provider: params.provider,
                providerAccountId: params.providerAccountId,
                userId: user.id,
            },
        });
        return user;
    }
    static toPublic(user) {
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt.toISOString(),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
