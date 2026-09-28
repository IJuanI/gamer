import { Injectable } from "@nestjs/common";
import type { PublicGame } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { Game } from "@prisma/client";

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      orderBy: { name: "asc" },
    });
    return games;
  }

  async findById(id: string): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { slug },
    });
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
