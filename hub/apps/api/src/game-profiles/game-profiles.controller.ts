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

@Controller()
export class GameProfilesController {
  constructor(
    private readonly gameProfiles: GameProfilesService,
    private readonly games: GamesService,
  ) {}

  /** Public: a member's gaming profiles, for browsing their handles/verified ranks. */
  @Get("users/:userId/game-profiles")
  async listForUser(@Param("userId") userId: string): Promise<{ gameProfiles: PublicGameProfile[] }> {
    const profiles = await this.gameProfiles.listForUser(userId);
    return { gameProfiles: profiles.map(GameProfilesService.toPublic) };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/game-profiles")
  async listMine(@CurrentUser() user: User): Promise<{ gameProfiles: PublicGameProfile[] }> {
    const profiles = await this.gameProfiles.listForUser(user.id);
    return { gameProfiles: profiles.map(GameProfilesService.toPublic) };
  }

  @UseGuards(JwtAuthGuard)
  @Post("me/game-profiles")
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
  async remove(@CurrentUser() user: User, @Param("id") id: string): Promise<{ ok: true }> {
    await this.gameProfiles.findOwned(id, user.id);
    await this.gameProfiles.delete(id);
    return { ok: true };
  }
}
