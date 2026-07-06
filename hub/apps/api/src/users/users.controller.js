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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@gamer/shared");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("./users.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
let UsersController = class UsersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Admin-only: list every member of the community. Demonstrates RBAC. */
    async list() {
        const users = await this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
        return { users: users.map(users_service_1.UsersService.toPublic) };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(shared_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)("users"),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersController);
