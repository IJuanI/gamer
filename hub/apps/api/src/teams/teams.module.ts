import { Module } from "@nestjs/common";
import { GamesModule } from "../games/games.module";
import { TeamsService } from "./teams.service";
import { TeamsController } from "./teams.controller";

@Module({
  imports: [GamesModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
