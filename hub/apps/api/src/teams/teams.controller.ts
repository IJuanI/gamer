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

@Controller("teams")
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly games: GamesService,
  ) {}

  /** Public: browse teams, optionally filtered by game. */
  @Get()
  async list(@Query("gameId") gameId?: string): Promise<{ teams: PublicTeam[] }> {
    const teams = await this.teams.list(gameId);
    return { teams: teams.map(TeamsService.toPublic) };
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<{ team: PublicTeam }> {
    const team = await this.teams.findById(id);
    return { team: TeamsService.toPublic(team) };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
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
  async removeMember(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Param("userId") userId: string,
  ): Promise<{ team: PublicTeam }> {
    // A captain can remove anyone; anyone else can only remove themselves (leave).
    const isSelf = userId === user.id;
    if (!isSelf) await this.teams.assertCaptain(id, user.id);
    else {
      const team = await this.teams.findById(id);
      const captain = team.members.find((m) => m.role === "CAPTAIN");
      if (captain?.userId === user.id) {
        throw new ForbiddenException("El capitán no puede salir del equipo sin transferir el rol");
      }
    }
    const team = await this.teams.removeMember(id, userId);
    return { team: TeamsService.toPublic(team) };
  }
}
