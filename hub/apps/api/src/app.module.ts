import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { GamesModule } from "./games/games.module";
import { GameProfilesModule } from "./game-profiles/game-profiles.module";
import { TeamsModule } from "./teams/teams.module";
import { RecruitmentPostsModule } from "./recruitment-posts/recruitment-posts.module";
import { PlatformLinksModule } from "./platform-links/platform-links.module";
import { TelemetryModule } from "./telemetry/telemetry.module";
import { MetricsModule } from "./metrics/metrics.module";
import { HealthController } from "./health.controller";
import { RequestLoggingMiddleware } from "./common/request-logging.middleware";
import { MetricsMiddleware } from "./metrics/metrics.middleware";
import { DatabaseInitializer } from "./common/database-init";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load the monorepo-root .env so DB/JWT/OAuth vars are shared.
      envFilePath: [join(__dirname, "../../../.env"), join(__dirname, "../.env")],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    GameProfilesModule,
    TeamsModule,
    RecruitmentPostsModule,
    PlatformLinksModule,
    TelemetryModule,
    MetricsModule,
    // TODO: Migrate to Firestore
    // DevModule,
  ],
  controllers: [HealthController],
  providers: [DatabaseInitializer],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware, MetricsMiddleware)
      .forRoutes("*");
  }
}
