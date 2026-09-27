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
  return req?.cookies?.refresh_token ?? null;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh") {
  constructor(private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromBodyAsJson("refreshToken"),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-only-change-me-please-32chars-min",
    });
  }

  async validate(payload: RefreshJwtPayload) {
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    const lastActivity = user.lastActivityAt ? new Date(user.lastActivityAt) : new Date(user.createdAt);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity > INACTIVITY_TIMEOUT_DAYS) {
      throw new UnauthorizedException("Session expired due to inactivity");
    }

    return user;
  }
}
