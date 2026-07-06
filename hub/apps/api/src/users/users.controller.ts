import { Controller, Get, UseGuards } from "@nestjs/common";
import { Role } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles } from "../auth/decorators";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin-only: list every member of the community. Demonstrates RBAC. */
  @Get()
  @Roles(Role.ADMIN)
  async list() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return { users: users.map(UsersService.toPublic) };
  }
}
