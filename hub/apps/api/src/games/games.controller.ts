import { Controller, Get } from "@nestjs/common";
import type { PublicGame } from "@gamer/shared";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
  constructor(private readonly games: GamesService) {}

  /** Public: the fixed catalog of supported games. */
  @Get()
  async list(): Promise<{ games: PublicGame[] }> {
    const games = await this.games.list();
    return { games: games.map(GamesService.toPublic) };
  }
}
