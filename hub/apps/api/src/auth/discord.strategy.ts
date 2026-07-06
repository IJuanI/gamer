import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";
import { UsersService } from "../users/users.service";

/**
 * Registered only when DISCORD_CLIENT_ID/SECRET are set (see auth.module).
 * Profile shape comes from passport-discord.
 */
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  constructor(private readonly users: UsersService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000"}/api/auth/discord/callback`,
      scope: ["identify", "email"],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null;
    return this.users.findOrCreateByOAuth({
      provider: "discord",
      providerAccountId: profile.id,
      email: profile.email ?? `${profile.id}@discord.local`,
      displayName: profile.global_name ?? profile.username ?? "GamER",
      avatarUrl,
    });
  }
}
