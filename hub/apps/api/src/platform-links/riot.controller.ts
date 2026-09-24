import { BadRequestException, Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { RiotService } from "./riot.service";
import { PlatformLinksService } from "./platform-links.service";

const STATE_COOKIE = "riot_oauth_state";
const GAME_COOKIE = "riot_oauth_game";

/** Registered only when RIOT_CLIENT_ID/SECRET/API_KEY are set (see platform-links.module). */
@Controller("platform-links/riot")
@UseGuards(JwtAuthGuard)
export class RiotController {
  constructor(
    private readonly riot: RiotService,
    private readonly platformLinks: PlatformLinksService,
  ) {}

  /** ?game=lol or ?game=valorant — which GamER game profile this link attaches to. */
  @Get("connect")
  connect(@Query("game") game: string, @Res() res: Response) {
    if (game !== "lol" && game !== "valorant") {
      throw new BadRequestException("Especificá game=lol o game=valorant");
    }
    const state = randomBytes(16).toString("hex");
    const cookieOpts = { httpOnly: true, sameSite: "lax" as const, maxAge: 10 * 60 * 1000, path: "/" };
    res.cookie(STATE_COOKIE, state, cookieOpts);
    res.cookie(GAME_COOKIE, game, cookieOpts);
    res.redirect(this.riot.buildAuthorizeUrl(state));
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
    const game = req.cookies?.[GAME_COOKIE] as "lol" | "valorant" | undefined;
    res.clearCookie(STATE_COOKIE, { path: "/" });
    res.clearCookie(GAME_COOKIE, { path: "/" });

    if (!code || !state || state !== expectedState || !game) {
      return res.redirect(`${webOrigin}/profile?riotError=1`);
    }

    const { access_token } = await this.riot.exchangeCode(code);
    const { puuid, gameName, tagLine } = await this.riot.fetchIdentity(access_token);
    const handle = tagLine ? `${gameName}#${tagLine}` : gameName;

    const profile = await this.platformLinks.findOrCreateProfileForLink(user.id, game, handle);

    if (game === "lol") {
      const rank = await this.riot.fetchLeagueOfLegendsRank(puuid);
      await this.platformLinks.upsertLink({
        gameProfileId: profile.id,
        provider: "RIOT",
        externalId: puuid,
        externalHandle: handle,
        hasRankData: Boolean(rank),
        accessToken: access_token,
        cachedStats: rank,
      });
    } else {
      // Valorant: identity verified only — Riot has no public ranked API and
      // bans third-party rank/MMR substitutes, so no cachedStats is ever set.
      await this.platformLinks.upsertLink({
        gameProfileId: profile.id,
        provider: "RIOT",
        externalId: puuid,
        externalHandle: handle,
        hasRankData: false,
        accessToken: access_token,
        cachedStats: null,
      });
    }

    res.redirect(`${webOrigin}/profile`);
  }
}
