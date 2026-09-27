import { Injectable } from "@nestjs/common";
import type { PublicGame } from "@gamer/shared";
import { FirestoreService } from "../firestore/firestore.service";

interface Game {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string;
  rankVerifiable: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class GamesService {
  constructor(private readonly firestore: FirestoreService) {}

  async list(): Promise<Game[]> {
    const games = await this.firestore.findAll<Game>("games");
    return games.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Game | null> {
    return this.firestore.findUnique<Game>("games", id);
  }

  async findBySlug(slug: string): Promise<Game | null> {
    return this.firestore.findByField<Game>("games", "slug", slug);
  }

  static toPublic(game: Game): PublicGame {
    return {
      id: game.id,
      slug: game.slug,
      name: game.name,
      iconUrl: game.iconUrl || null,
      rankVerifiable: game.rankVerifiable,
    };
  }
}
