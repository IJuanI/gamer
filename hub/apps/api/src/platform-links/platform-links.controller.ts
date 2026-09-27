import { Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { PlatformLinksService } from "./platform-links.service";
import { FaceitService } from "./faceit.service";
import { RiotService } from "./riot.service";

interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Provider-agnostic management once a link exists: refresh cached stats, or unlink. */
@Controller("platform-links")
@UseGuards(JwtAuthGuard)
export class PlatformLinksController {
  constructor(
    private readonly platformLinks: PlatformLinksService,
    private readonly faceit: FaceitService,
    private readonly riot: RiotService,
  ) {}

  @Post(":id/refresh")
  async refresh(@CurrentUser() user: User, @Param("id") id: string) {
    const link = await this.platformLinks.assertOwned(id, user.id);
    if (!link.accessToken) return { ok: true };

    if (link.provider === "FACEIT") {
      const { stats } = await this.faceit.fetchCs2Stats(link.externalHandle);
      await this.platformLinks.upsertLink({
        gameProfileId: link.gameProfileId,
        provider: "FACEIT",
        externalId: link.externalId,
        externalHandle: link.externalHandle,
        hasRankData: Boolean(stats),
        accessToken: link.accessToken,
        cachedStats: stats,
      });
    } else if (link.provider === "RIOT" && link.hasRankData) {
      const rank = await this.riot.fetchLeagueOfLegendsRank(link.externalId);
      await this.platformLinks.upsertLink({
        gameProfileId: link.gameProfileId,
        provider: "RIOT",
        externalId: link.externalId,
        externalHandle: link.externalHandle,
        hasRankData: Boolean(rank),
        accessToken: link.accessToken,
        cachedStats: rank,
      });
    }
    return { ok: true };
  }

  @Delete(":id")
  async unlink(@CurrentUser() user: User, @Param("id") id: string) {
    await this.platformLinks.assertOwned(id, user.id);
    await this.platformLinks.delete(id);
    return { ok: true };
  }
}
