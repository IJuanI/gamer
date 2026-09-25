import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { FirestoreModule } from "./firestore/firestore.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GamesModule } from "./games/games.module";
import { GameProfilesModule } from "./game-profiles/game-profiles.module";
import { TeamsModule } from "./teams/teams.module";
import { RecruitmentPostsModule } from "./recruitment-posts/recruitment-posts.module";
import { PlatformLinksModule } from "./platform-links/platform-links.module";
import { HealthController } from "./health.controller";
import { DevModule } from "./dev/dev.module";

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
    TeamsModule,
    RecruitmentPostsModule,
    PlatformLinksModule,
    ...(process.env.NODE_ENV !== 'production' ? [DevModule] : []),
  ],
  controllers: [HealthController],
})
export class AppModule {}
