import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesModule } from "../games/games.module";
import { GameProfilesService } from "./game-profiles.service";
import { GameProfilesController } from "./game-profiles.controller";

@Module({
  imports: [PrismaModule, GamesModule],
  controllers: [GameProfilesController],
  providers: [GameProfilesService],
  exports: [GameProfilesService],
})
export class GameProfilesModule {}
