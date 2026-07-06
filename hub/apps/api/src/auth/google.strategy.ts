import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import { UsersService } from "../users/users.service";

/** Registered only when GOOGLE_CLIENT_ID/SECRET are set (see auth.module). */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly users: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000"}/api/auth/google/callback`,
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value ?? `${profile.id}@google.local`;
    const user = await this.users.findOrCreateByOAuth({
      provider: "google",
      providerAccountId: profile.id,
      email,
      displayName: profile.displayName ?? "GamER",
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
    done(null, user);
  }
}
