import { Module } from "@nestjs/common";
import { FirestoreModule } from "../firestore/firestore.module";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";

@Module({
  imports: [FirestoreModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
