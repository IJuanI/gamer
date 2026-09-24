import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { PublicGameProfile, PlatformLinkStats } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { GamesService } from "../games/games.service";

const withRelations = {
  game: true,
  platformLink: true,
} satisfies Prisma.GameProfileInclude;

type GameProfileWithRelations = Prisma.GameProfileGetPayload<{ include: typeof withRelations }>;

@Injectable()
export class GameProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.gameProfile.findMany({
      where: { userId },
      include: withRelations,
      orderBy: { createdAt: "asc" },
    });
  }

  async findOwned(id: string, userId: string) {
    const profile = await this.prisma.gameProfile.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!profile) throw new NotFoundException("Perfil de juego no encontrado");
    if (profile.userId !== userId) throw new ForbiddenException("No podés editar este perfil");
    return profile;
  }

  async create(userId: string, gameId: string, inGameHandle: string) {
    const existing = await this.prisma.gameProfile.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (existing) throw new ConflictException("Ya tenés un perfil para este juego");
    return this.prisma.gameProfile.create({
      data: { userId, gameId, inGameHandle },
      include: withRelations,
    });
  }

  update(id: string, inGameHandle: string) {
    return this.prisma.gameProfile.update({
      where: { id },
      data: { inGameHandle },
      include: withRelations,
    });
  }

  delete(id: string) {
    return this.prisma.gameProfile.delete({ where: { id } });
  }

  static toPublic(profile: GameProfileWithRelations): PublicGameProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      game: GamesService.toPublic(profile.game),
      inGameHandle: profile.inGameHandle,
      createdAt: profile.createdAt.toISOString(),
      platformLink: profile.platformLink
        ? {
            id: profile.platformLink.id,
            provider: profile.platformLink.provider,
            externalHandle: profile.platformLink.externalHandle,
            hasRankData: profile.platformLink.hasRankData,
            cachedStats: (profile.platformLink.cachedStats as PlatformLinkStats | null) ?? null,
            statsFetchedAt: profile.platformLink.statsFetchedAt?.toISOString() ?? null,
          }
        : null,
    };
  }
}
