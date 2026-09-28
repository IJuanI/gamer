import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GamesService } from "../games/games.service";
import { GameProfilesService } from "../game-profiles/game-profiles.service";
import { PlatformLink } from "@prisma/client";

@Injectable()
export class PlatformLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamesService: GamesService,
    private readonly gameProfiles: GameProfilesService,
  ) {}

  async findOrCreateProfileForLink(userId: string, gameSlug: string, defaultHandle: string) {
    const game = await this.gamesService.findBySlug(gameSlug);
    if (!game) throw new NotFoundException(`Juego "${gameSlug}" no configurado`);

    const existing = await this.prisma.gameProfile.findUnique({
      where: {
        userId_gameId: { userId, gameId: game.id },
      },
    });
    if (existing) return existing;

    return this.gameProfiles.create(userId, game.id, defaultHandle);
  }

  async upsertLink(params: {
    gameProfileId: string;
    provider: "FACEIT" | "RIOT" | "EPIC";
    externalId: string;
    externalHandle: string;
    hasRankData: boolean;
    accessToken?: string;
    refreshToken?: string;
    cachedStats?: object | null;
  }) {
    const existing = await this.prisma.platformLink.findUnique({
      where: {
        gameProfileId: params.gameProfileId,
      },
    });

    const linkData = {
      provider: params.provider,
      externalId: params.externalId,
      externalHandle: params.externalHandle,
      hasRankData: params.hasRankData,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      cachedStats: params.cachedStats ? JSON.stringify(params.cachedStats) : null,
      statsFetchedAt: params.cachedStats ? new Date() : null,
    };

    if (existing) {
      return this.prisma.platformLink.update({
        where: { id: existing.id },
        data: linkData,
      });
    }

    return this.prisma.platformLink.create({
      data: {
        gameProfileId: params.gameProfileId,
        ...linkData,
      },
    });
  }

  async assertOwned(linkId: string, userId: string): Promise<PlatformLink> {
    const link = await this.prisma.platformLink.findUnique({
      where: { id: linkId },
      include: { gameProfile: true },
    });
    if (!link) throw new NotFoundException("Vínculo no encontrado");
    if (link.gameProfile.userId !== userId) throw new ForbiddenException("No es tu vínculo");
    return link;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.platformLink.delete({
      where: { id },
    });
  }
}
