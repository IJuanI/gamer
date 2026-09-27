import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles } from "../auth/decorators";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiResponse({ status: 200, description: "List of all users" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - requires ADMIN role" })
  async getAll() {
    const users = await this.usersService.getAll();
    return { users: users.map(UsersService.toPublic) };
  }
}
