import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { FirestoreModule } from "./firestore/firestore.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { GamesModule } from "./games/games.module";
import { GameProfilesModule } from "./game-profiles/game-profiles.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load the monorepo-root .env so DB/JWT/OAuth vars are shared.
      envFilePath: [join(__dirname, "../../../.env"), join(__dirname, "../.env")],
    }),
    FirestoreModule,
    AuthModule,
    UsersModule,
    GamesModule,
    GameProfilesModule,
    // TODO: Migrate to Firestore
    // TeamsModule,
    // RecruitmentPostsModule,
    // PlatformLinksModule,
    // DevModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
