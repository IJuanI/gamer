import { Module, type Provider } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshStrategy } from "./refresh.strategy";
import { DiscordStrategy } from "./discord.strategy";
import { GoogleStrategy } from "./google.strategy";

// OAuth strategies blow up on construction without credentials, so only
// register them when the corresponding env vars are present.
const oauthProviders: Provider[] = [];
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  oauthProviders.push(DiscordStrategy);
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(GoogleStrategy);
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "dev-only-change-me-please-32chars-min",
    }),
  ],
  controllers: [AuthController],
  // RolesGuard is NOT registered globally: global guards run before
  // controller-scoped JwtAuthGuard, so request.user wouldn't be set yet.
  // Instead protected routes use @UseGuards(JwtAuthGuard, RolesGuard).
  providers: [AuthService, JwtStrategy, RefreshStrategy, ...oauthProviders],
})
export class AuthModule {}
