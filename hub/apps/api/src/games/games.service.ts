import { Injectable } from "@nestjs/common";
import type { Game } from "@prisma/client";
import type { PublicGame } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.game.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string) {
    return this.prisma.game.findUnique({ where: { id } });
  }

  static toPublic(game: Game): PublicGame {
    return {
      id: game.id,
      slug: game.slug,
      name: game.name,
      iconUrl: game.iconUrl,
      rankVerifiable: game.rankVerifiable,
    };
  }
}
