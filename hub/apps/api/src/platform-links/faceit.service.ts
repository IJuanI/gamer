import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";

const AUTHORIZE_URL = "https://accounts.faceit.com/oauth/authorize";
const TOKEN_URL = "https://api.faceit.com/auth/v1/oauth/token";
const USERINFO_URL = "https://api.faceit.com/auth/v1/resources/userinfo";
const DATA_API_BASE = "https://open.faceit.com/data/v4";

/**
 * FACEIT is CS2's verified-rank source (Valve doesn't expose competitive
 * rank publicly). Flow: OAuth2 + PKCE proves the user owns the FACEIT
 * account, then the static Data API key fetches their CS2 skill level/ELO.
 * See docs/team-pairing-plan.md §2 for the research this is built from.
 */
@Injectable()
export class FaceitService {
  get callbackUrl() {
    const base = process.env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000";
    return `${base}/api/platform-links/faceit/callback`;
  }

  isConfigured() {
    return Boolean(process.env.FACEIT_CLIENT_ID && process.env.FACEIT_CLIENT_SECRET && process.env.FACEIT_API_KEY);
  }

  generatePkce() {
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    return { verifier, challenge };
  }

  buildAuthorizeUrl(state: string, codeChallenge: string) {
    const params = new URLSearchParams({
      client_id: process.env.FACEIT_CLIENT_ID!,
      redirect_uri: this.callbackUrl,
      response_type: "code",
      scope: "openid",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string, codeVerifier: string) {
    const basicAuth = Buffer.from(
      `${process.env.FACEIT_CLIENT_ID}:${process.env.FACEIT_CLIENT_SECRET}`,
    ).toString("base64");
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.callbackUrl,
        code_verifier: codeVerifier,
      }),
    });
    if (!res.ok) throw new UnauthorizedException("No se pudo validar la cuenta de FACEIT");
    return res.json() as Promise<{ access_token: string; refresh_token?: string }>;
  }

  async fetchNickname(userAccessToken: string): Promise<{ nickname: string }> {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${userAccessToken}` },
    });
    if (!res.ok) throw new UnauthorizedException("No se pudo leer el perfil de FACEIT");
    const info = await res.json();
    return { nickname: info.nickname ?? info.preferred_username };
  }

  /** Data API uses the app's static key, not the user's OAuth token. */
  async fetchCs2Stats(nickname: string) {
    const res = await fetch(`${DATA_API_BASE}/players?nickname=${encodeURIComponent(nickname)}`, {
      headers: { Authorization: `Bearer ${process.env.FACEIT_API_KEY}` },
    });
    if (!res.ok) return { playerId: null, stats: null };
    const player = await res.json();
    const cs2 = player.games?.cs2;
    return {
      playerId: player.player_id as string,
      stats: cs2 ? { elo: cs2.faceit_elo, skillLevel: cs2.skill_level } : null,
    };
  }
}
