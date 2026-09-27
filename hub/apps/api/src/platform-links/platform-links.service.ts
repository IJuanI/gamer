import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { FirestoreService } from "../firestore/firestore.service";
import { GamesService } from "../games/games.service";
import { GameProfilesService } from "../game-profiles/game-profiles.service";

interface PlatformLink {
  id: string;
  gameProfileId: string;
  provider: "FACEIT" | "RIOT" | "EPIC";
  externalId: string;
  externalHandle: string;
  hasRankData: boolean;
  accessToken?: string;
  refreshToken?: string;
  cachedStats?: object | null;
  statsFetchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class PlatformLinksService {
  constructor(
    private readonly firestore: FirestoreService,
    private readonly gamesService: GamesService,
    private readonly gameProfiles: GameProfilesService,
  ) {}

  async findOrCreateProfileForLink(userId: string, gameSlug: string, defaultHandle: string) {
    const game = await this.gamesService.findBySlug(gameSlug);
    if (!game) throw new NotFoundException(`Juego "${gameSlug}" no configurado`);

    const existing = await this.firestore.query<any>("gameProfiles", [
      ["userId", "==", userId],
      ["gameId", "==", game.id],
    ]);
    if (existing.length > 0) return existing[0];

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
    const existing = await this.firestore.query<PlatformLink>("platformLinks", [
      ["gameProfileId", "==", params.gameProfileId],
    ]);

    const linkData = {
      provider: params.provider,
      externalId: params.externalId,
      externalHandle: params.externalHandle,
      hasRankData: params.hasRankData,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      cachedStats: params.cachedStats,
      statsFetchedAt: params.cachedStats ? new Date().toISOString() : undefined,
    };

    if (existing.length > 0) {
      return this.firestore.set<PlatformLink>("platformLinks", existing[0].id, linkData);
    }

    return this.firestore.create<PlatformLink>("platformLinks", { gameProfileId: params.gameProfileId, ...linkData });
  }

  async assertOwned(linkId: string, userId: string): Promise<PlatformLink> {
    const link = await this.firestore.findUnique<PlatformLink>("platformLinks", linkId);
    if (!link) throw new NotFoundException("Vínculo no encontrado");

    const gameProfile = await this.firestore.findUnique<any>("gameProfiles", link.gameProfileId);
    if (!gameProfile || gameProfile.userId !== userId) throw new ForbiddenException("No es tu vínculo");

    return link;
  }

  async delete(id: string): Promise<void> {
    await this.firestore.delete("platformLinks", id);
  }
}
