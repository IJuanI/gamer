import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { FirestoreModule } from "./firestore/firestore.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { StubsModule } from "./stubs/stubs.module";
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
    StubsModule,
    // TODO: Migrate from Prisma to Firestore
    // GamesModule,
    // GameProfilesModule,
    // TeamsModule,
    // RecruitmentPostsModule,
    // PlatformLinksModule,
    // DevModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
