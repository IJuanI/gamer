import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards";
import { Roles } from "../auth/decorators";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles("ADMIN")
  async getAll() {
    const users = await this.usersService.getAll();
    return { users: users.map(UsersService.toPublic) };
  }
}
