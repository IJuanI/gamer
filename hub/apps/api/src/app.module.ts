import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HealthController } from "./health.controller";

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
  ],
  controllers: [HealthController],
})
export class AppModule {}
