import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PublicGameProfile, PlatformLinkStats } from "@gamer/shared";
import { FirestoreService } from "../firestore/firestore.service";
import { GamesService } from "../games/games.service";

interface GameProfile {
  id: string;
  userId: string;
  gameId: string;
  inGameHandle: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class GameProfilesService {
  constructor(private readonly firestore: FirestoreService) {}

  async listForUser(userId: string): Promise<GameProfile[]> {
    return this.firestore.query<GameProfile>("gameProfiles", [["userId", "==", userId]]);
  }

  async findOwned(id: string, userId: string): Promise<GameProfile> {
    const profile = await this.firestore.findUnique<GameProfile>("gameProfiles", id);
    if (!profile) throw new NotFoundException("Perfil de juego no encontrado");
    if (profile.userId !== userId) throw new ForbiddenException("No podés editar este perfil");
    return profile;
  }

  async create(userId: string, gameId: string, inGameHandle: string): Promise<GameProfile> {
    const existing = await this.firestore.query<GameProfile>("gameProfiles", [
      ["userId", "==", userId],
      ["gameId", "==", gameId],
    ]);
    if (existing.length > 0) throw new ConflictException("Ya tenés un perfil para este juego");
    return this.firestore.create<GameProfile>("gameProfiles", {
      userId,
      gameId,
      inGameHandle,
    });
  }

  async update(id: string, inGameHandle: string): Promise<GameProfile> {
    return this.firestore.set<GameProfile>("gameProfiles", id, { inGameHandle });
  }

  async delete(id: string): Promise<void> {
    await this.firestore.delete("gameProfiles", id);
  }

  static toPublic(profile: GameProfile): PublicGameProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      game: { id: profile.gameId, slug: "", name: "", iconUrl: null, rankVerifiable: false },
      inGameHandle: profile.inGameHandle,
      createdAt: profile.createdAt,
      platformLink: null,
    };
  }
}
