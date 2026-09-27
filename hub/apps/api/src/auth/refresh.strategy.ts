import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import { UsersService } from "../users/users.service";

const INACTIVITY_TIMEOUT_DAYS = 90;

export interface RefreshJwtPayload {
  sub: string;
  type: "refresh";
}

function cookieExtractor(req: Request): string | null {
  const token = req?.cookies?.refresh_token ?? null;
  console.log("[RefreshStrategy] Cookie extraction - has token:", !!token);
  return token;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh") {
  constructor(private readonly users: UsersService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-only-change-me-please-32chars-min",
    });
  }

  async validate(payload: RefreshJwtPayload) {
    console.log("[RefreshStrategy] Validating payload, type:", payload.type, "userId:", payload.sub);

    if (payload.type !== "refresh") {
      console.error("[RefreshStrategy] Invalid token type:", payload.type);
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      console.error("[RefreshStrategy] User not found:", payload.sub);
      throw new UnauthorizedException("User not found");
    }

    const lastActivity = user.lastActivityAt ? new Date(user.lastActivityAt) : new Date(user.createdAt);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    console.log("[RefreshStrategy] User activity check - days since activity:", daysSinceActivity.toFixed(1));

    if (daysSinceActivity > INACTIVITY_TIMEOUT_DAYS) {
      console.error("[RefreshStrategy] Session expired due to inactivity:", daysSinceActivity.toFixed(1), "days");
      throw new UnauthorizedException("Session expired due to inactivity");
    }

    console.log("[RefreshStrategy] Token validation successful");
    return user;
  }
}
