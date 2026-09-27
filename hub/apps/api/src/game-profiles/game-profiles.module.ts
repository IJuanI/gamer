import { Module } from "@nestjs/common";
import { FirestoreModule } from "../firestore/firestore.module";
import { GamesModule } from "../games/games.module";
import { GameProfilesService } from "./game-profiles.service";
import { GameProfilesController } from "./game-profiles.controller";

@Module({
  imports: [FirestoreModule, GamesModule],
  controllers: [GameProfilesController],
  providers: [GameProfilesService],
  exports: [GameProfilesService],
})
export class GameProfilesModule {}
