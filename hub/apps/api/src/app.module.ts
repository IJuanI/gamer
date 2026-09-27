import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { FirestoreModule } from "./firestore/firestore.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
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
    // TODO: Migrate these modules from Prisma to Firestore
    // GamesModule,
    // GameProfilesModule,
    // TeamsModule,
    // RecruitmentPostsModule,
    // PlatformLinksModule,
    // DevModule,  // Temporarily disabled for Cloud Run deployment
  ],
  controllers: [HealthController],
})
export class AppModule {}
