import { Injectable, UnauthorizedException } from "@nestjs/common";

const AUTHORIZE_URL = "https://auth.riotgames.com/authorize";
const TOKEN_URL = "https://auth.riotgames.com/token";
const USERINFO_URL = "https://auth.riotgames.com/userinfo";

/**
 * Riot Sign-On (RSO) covers both League of Legends and Valorant identity.
 * League of Legends also has an official ranked endpoint (League-V4), so it
 * gets real verified rank; Valorant has no public ranked API and Riot's
 * policy bans third-party rank/MMR alternatives, so Valorant only ever gets
 * identity verification — see docs/team-pairing-plan.md §2.
 *
 * NOTE: RSO clients and production-level API keys require Riot's
 * application/approval process; this can be exercised against a
 * development key while that approval is pending, but must not be
 * presented as "live" to real users until a production key is granted.
 */
@Injectable()
export class RiotService {
  get callbackUrl() {
    const base = process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000";
    return `${base}/api/platform-links/riot/callback`;
  }

  isConfigured() {
    return Boolean(process.env.RIOT_CLIENT_ID && process.env.RIOT_CLIENT_SECRET && process.env.RIOT_API_KEY);
  }

  buildAuthorizeUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.RIOT_CLIENT_ID!,
      redirect_uri: this.callbackUrl,
      response_type: "code",
      scope: "openid",
      state,
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const basicAuth = Buffer.from(`${process.env.RIOT_CLIENT_ID}:${process.env.RIOT_CLIENT_SECRET}`).toString(
      "base64",
    );
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: this.callbackUrl }),
    });
    if (!res.ok) throw new UnauthorizedException("No se pudo validar la cuenta de Riot");
    return res.json() as Promise<{ access_token: string; refresh_token?: string }>;
  }

  async fetchIdentity(userAccessToken: string): Promise<{ puuid: string; gameName: string; tagLine: string }> {
    const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${userAccessToken}` } });
    if (!res.ok) throw new UnauthorizedException("No se pudo leer el perfil de Riot");
    const info = await res.json();
    return { puuid: info.sub, gameName: info.game_name ?? info.username, tagLine: info.tag_line ?? "" };
  }

  /** Official League-V4 ranked endpoint — the one title here with a real verified rank source. */
  async fetchLeagueOfLegendsRank(puuid: string) {
    const platform = process.env.RIOT_LOL_PLATFORM ?? "la2"; // LAS by default; adjust per community region
    const res = await fetch(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY! } },
    );
    if (!res.ok) return null;
    const entries = (await res.json()) as Array<{ queueType: string; tier: string; rank: string; leaguePoints: number }>;
    const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? entries[0];
    if (!solo) return null;
    return { tier: solo.tier, division: solo.rank, leaguePoints: solo.leaguePoints };
  }
}
