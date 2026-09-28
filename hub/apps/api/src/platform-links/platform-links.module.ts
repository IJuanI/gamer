import { Module, type Type } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesModule } from "../games/games.module";
import { GameProfilesModule } from "../game-profiles/game-profiles.module";
import { PlatformLinksService } from "./platform-links.service";
import { PlatformLinksController } from "./platform-links.controller";
import { FaceitService } from "./faceit.service";
import { FaceitController } from "./faceit.controller";
import { RiotService } from "./riot.service";
import { RiotController } from "./riot.controller";

// Provider OAuth routes are registered only once their credentials are set
// in env — mirrors AuthModule's conditional Discord/Google strategies.
// FaceitService/RiotService are always provided (harmless without env vars,
// PlatformLinksController checks link.provider before calling them) but
// their connect/callback controllers only appear when configured.
const providerControllers: Type<unknown>[] = [];
if (process.env.FACEIT_CLIENT_ID && process.env.FACEIT_CLIENT_SECRET && process.env.FACEIT_API_KEY) {
  providerControllers.push(FaceitController);
}
if (process.env.RIOT_CLIENT_ID && process.env.RIOT_CLIENT_SECRET && process.env.RIOT_API_KEY) {
  providerControllers.push(RiotController);
}

@Module({
  imports: [PrismaModule, GamesModule, GameProfilesModule],
  controllers: [PlatformLinksController, ...providerControllers],
  providers: [PlatformLinksService, FaceitService, RiotService],
})
export class PlatformLinksModule {}
