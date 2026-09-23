import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { FaceitService } from "./faceit.service";
import { PlatformLinksService } from "./platform-links.service";

const STATE_COOKIE = "faceit_oauth_state";
const VERIFIER_COOKIE = "faceit_pkce_verifier";

/**
 * Registered only when FACEIT_CLIENT_ID/SECRET/API_KEY are set (see
 * platform-links.module). Both routes require an existing GamER session —
 * the httpOnly access_token cookie survives the FACEIT redirect since it's
 * the same browser, so the callback can identify the user without a
 * separate state-signed payload.
 */
@Controller("platform-links/faceit")
@UseGuards(JwtAuthGuard)
export class FaceitController {
  constructor(
    private readonly faceit: FaceitService,
    private readonly platformLinks: PlatformLinksService,
  ) {}

  @Get("connect")
  connect(@Res() res: Response) {
    const state = randomBytes(16).toString("hex");
    const { verifier, challenge } = this.faceit.generatePkce();
    const cookieOpts = { httpOnly: true, sameSite: "lax" as const, maxAge: 10 * 60 * 1000, path: "/" };
    res.cookie(STATE_COOKIE, state, cookieOpts);
    res.cookie(VERIFIER_COOKIE, verifier, cookieOpts);
    res.redirect(this.faceit.buildAuthorizeUrl(state, challenge));
  }

  @Get("callback")
  async callback(
    @CurrentUser() user: User,
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
    const expectedState = req.cookies?.[STATE_COOKIE];
    const verifier = req.cookies?.[VERIFIER_COOKIE];
    res.clearCookie(STATE_COOKIE, { path: "/" });
    res.clearCookie(VERIFIER_COOKIE, { path: "/" });

    if (!code || !state || state !== expectedState || !verifier) {
      return res.redirect(`${webOrigin}/profile?faceitError=1`);
    }

    const { access_token } = await this.faceit.exchangeCode(code, verifier);
    const { nickname } = await this.faceit.fetchNickname(access_token);
    const { playerId, stats } = await this.faceit.fetchCs2Stats(nickname);

    const profile = await this.platformLinks.findOrCreateProfileForLink(user.id, "cs2", nickname);
    await this.platformLinks.upsertLink({
      gameProfileId: profile.id,
      provider: "FACEIT",
      externalId: playerId ?? nickname,
      externalHandle: nickname,
      hasRankData: Boolean(stats),
      accessToken: access_token,
      cachedStats: stats,
    });

    res.redirect(`${webOrigin}/profile`);
  }
}
