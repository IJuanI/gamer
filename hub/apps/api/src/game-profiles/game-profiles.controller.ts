import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { PublicGameProfile } from "@gamer/shared";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { GamesService } from "../games/games.service";
import { GameProfilesService } from "./game-profiles.service";
import { CreateGameProfileDto, UpdateGameProfileDto } from "./dto";

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

@ApiTags("Game Profiles")
@Controller()
export class GameProfilesController {
  constructor(
    private readonly gameProfiles: GameProfilesService,
    private readonly games: GamesService,
  ) {}

  @Get("users/:userId/game-profiles")
  @ApiOperation({ summary: "Get game profiles for a user (public)" })
  @ApiResponse({ status: 200, description: "List of game profiles" })
  async listForUser(@Param("userId") userId: string): Promise<{ gameProfiles: PublicGameProfile[] }> {
    const profiles = await this.gameProfiles.listForUser(userId);
    return { gameProfiles: profiles.map(GameProfilesService.toPublic) };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/game-profiles")
  @ApiOperation({ summary: "Get current user's game profiles" })
  @ApiResponse({ status: 200, description: "List of user's game profiles" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async listMine(@CurrentUser() user: User): Promise<{ gameProfiles: PublicGameProfile[] }> {
    const profiles = await this.gameProfiles.listForUser(user.id);
    return { gameProfiles: profiles.map(GameProfilesService.toPublic) };
  }

  @UseGuards(JwtAuthGuard)
  @Post("me/game-profiles")
  @ApiOperation({ summary: "Create a new game profile" })
  @ApiResponse({ status: 201, description: "Game profile created" })
  @ApiResponse({ status: 400, description: "Invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateGameProfileDto,
  ): Promise<{ gameProfile: PublicGameProfile }> {
    const game = await this.games.findById(dto.gameId);
    if (!game) throw new NotFoundException("Juego no encontrado");
    const profile = await this.gameProfiles.create(user.id, dto.gameId, dto.inGameHandle);
    return { gameProfile: GameProfilesService.toPublic(profile) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/game-profiles/:id")
  @ApiOperation({ summary: "Update a game profile" })
  @ApiResponse({ status: 200, description: "Game profile updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Game profile not found" })
  async update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateGameProfileDto,
  ): Promise<{ gameProfile: PublicGameProfile }> {
    await this.gameProfiles.findOwned(id, user.id);
    const profile = await this.gameProfiles.update(id, dto.inGameHandle);
    return { gameProfile: GameProfilesService.toPublic(profile) };
  }

  @UseGuards(JwtAuthGuard)
  @Delete("me/game-profiles/:id")
  @ApiOperation({ summary: "Delete a game profile" })
  @ApiResponse({ status: 200, description: "Game profile deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Game profile not found" })
  async remove(@CurrentUser() user: User, @Param("id") id: string): Promise<{ ok: true }> {
    await this.gameProfiles.findOwned(id, user.id);
    await this.gameProfiles.delete(id);
    return { ok: true };
  }
}
