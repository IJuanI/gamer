import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { PublicTeam } from "@gamer/shared";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { GamesService } from "../games/games.service";
import { TeamsService } from "./teams.service";
import { AddTeamMemberDto, CreateTeamDto, UpdateTeamDto } from "./dto";

interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

@ApiTags("Teams")
@Controller("teams")
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly games: GamesService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List teams (optionally filtered by game)" })
  @ApiResponse({ status: 200, description: "List of teams" })
  async list(@Query("gameId") gameId?: string): Promise<{ teams: PublicTeam[] }> {
    const teams = await this.teams.list(gameId);
    return { teams: teams.map(TeamsService.toPublic) };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a team by ID" })
  @ApiResponse({ status: 200, description: "Team details" })
  @ApiResponse({ status: 404, description: "Team not found" })
  async findOne(@Param("id") id: string): Promise<{ team: PublicTeam }> {
    const team = await this.teams.findById(id);
    return { team: TeamsService.toPublic(team) };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create a new team" })
  @ApiResponse({ status: 201, description: "Team created" })
  @ApiResponse({ status: 400, description: "Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateTeamDto,
  ): Promise<{ team: PublicTeam }> {
    const game = await this.games.findById(dto.gameId);
    if (!game) throw new NotFoundException("Juego no encontrado");
    const team = await this.teams.create(user.id, dto);
    return { team: TeamsService.toPublic(team) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "Update a team (captain only)" })
  @ApiResponse({ status: 200, description: "Team updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - only captain can update" })
  @ApiResponse({ status: 404, description: "Team not found" })
  async update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<{ team: PublicTeam }> {
    await this.teams.assertCaptain(id, user.id);
    const team = await this.teams.update(id, dto);
    return { team: TeamsService.toPublic(team) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/members")
  @ApiOperation({ summary: "Add a member to a team (captain only)" })
  @ApiResponse({ status: 200, description: "Member added" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - only captain can add members" })
  @ApiResponse({ status: 404, description: "Team or user not found" })
  async addMember(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: AddTeamMemberDto,
  ): Promise<{ team: PublicTeam }> {
    await this.teams.assertCaptain(id, user.id);
    const team = await this.teams.addMember(id, dto.userId);
    return { team: TeamsService.toPublic(team) };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/members/:userId")
  @ApiOperation({ summary: "Remove a member from a team" })
  @ApiResponse({ status: 200, description: "Member removed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Team or member not found" })
  async removeMember(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Param("userId") userId: string,
  ): Promise<{ team: PublicTeam }> {
    // A captain can remove anyone; anyone else can only remove themselves (leave).
    const isSelf = userId === user.id;
    if (!isSelf) await this.teams.assertCaptain(id, user.id);
    const team = await this.teams.removeMember(id, userId);
    return { team: TeamsService.toPublic(team) };
  }
}
