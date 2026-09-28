import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";

@Module({
  imports: [PrismaModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
