import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GameProfilesService } from "../game-profiles/game-profiles.service";

@Injectable()
export class PlatformLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameProfiles: GameProfilesService,
  ) {}

  /** Find or create the user's GameProfile for a given game slug, defaulting the handle. */
  async findOrCreateProfileForLink(userId: string, gameSlug: string, defaultHandle: string) {
    const game = await this.prisma.game.findUnique({ where: { slug: gameSlug } });
    if (!game) throw new NotFoundException(`Juego "${gameSlug}" no configurado`);

    const existing = await this.prisma.gameProfile.findUnique({
      where: { userId_gameId: { userId, gameId: game.id } },
    });
    if (existing) return existing;

    return this.prisma.gameProfile.create({ data: { userId, gameId: game.id, inGameHandle: defaultHandle } });
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
    return this.prisma.platformLink.upsert({
      where: { gameProfileId: params.gameProfileId },
      update: {
        externalId: params.externalId,
        externalHandle: params.externalHandle,
        hasRankData: params.hasRankData,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        cachedStats: params.cachedStats ?? undefined,
        statsFetchedAt: params.cachedStats ? new Date() : undefined,
      },
      create: {
        gameProfileId: params.gameProfileId,
        provider: params.provider,
        externalId: params.externalId,
        externalHandle: params.externalHandle,
        hasRankData: params.hasRankData,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        cachedStats: params.cachedStats ?? undefined,
        statsFetchedAt: params.cachedStats ? new Date() : undefined,
      },
    });
  }

  async assertOwned(linkId: string, userId: string) {
    const link = await this.prisma.platformLink.findUnique({
      where: { id: linkId },
      include: { gameProfile: true },
    });
    if (!link) throw new NotFoundException("Vínculo no encontrado");
    if (link.gameProfile.userId !== userId) throw new ForbiddenException("No es tu vínculo");
    return link;
  }

  delete(id: string) {
    return this.prisma.platformLink.delete({ where: { id } });
  }
}
