import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  PublicUser,
  PublicGame,
  PublicGameProfile,
  CreateGameProfilePayload,
  PublicTeam,
  CreateTeamPayload,
  UpdateTeamPayload,
  PublicRecruitmentPost,
  CreateRecruitmentPostPayload,
  UpdateRecruitmentPostPayload,
} from "@gamer/shared";

import { reportError } from "./telemetry";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// No production API is deployed yet, so unless NEXT_PUBLIC_API_URL was set at
// build time, this would otherwise point every deployed domain at localhost —
// a private address that public HTTPS pages can't reach without triggering
// the browser's Private Network Access permission prompt.
export const API_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_API_URL);

const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError: Error | null = null;
  const isRefreshPath = path === "/auth/refresh";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api${path}`, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.message ?? `Request failed (${res.status})`);

        // Retry on 5xx errors (server errors) or network issues
        const isRetryable = res.status >= 500 && attempt < MAX_RETRIES;

        if (isRetryable) {
          lastError = error;
          await sleep(RETRY_DELAY * Math.pow(2, attempt)); // exponential backoff
          continue;
        }

        // Report API errors to telemetry (all non-2xx responses)
        const severity = res.status >= 500 ? "ERROR" : "WARNING";
        if (res.status >= 400) {
          reportError({
            message: `API ${res.status}: ${path}`,
            severity,
            context: "apiError",
            metadata: {
              path,
              status: res.status,
              message: body.message,
              attempts: attempt + 1,
              requestId: res.headers.get("x-request-id"),
            },
          }).catch(() => {});
        }

        throw error;
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (err instanceof TypeError && attempt < MAX_RETRIES) {
        // Network error, retry
        lastError = err as Error;
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("Request failed after retries");
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  refresh: () => request<AuthResponse>("/auth/refresh", { method: "POST" }),

  me: () => request<AuthResponse>("/auth/me"),

  listUsers: () => request<{ users: PublicUser[] }>("/users"),

  // Games
  listGames: () => request<{ games: PublicGame[] }>("/games"),

  // Game profiles
  myGameProfiles: () => request<{ gameProfiles: PublicGameProfile[] }>("/me/game-profiles"),
  createGameProfile: (payload: CreateGameProfilePayload) =>
    request<PublicGameProfile>("/me/game-profiles", { method: "POST", body: JSON.stringify(payload) }),
  deleteGameProfile: (id: string) =>
    request<{ ok: boolean }>(`/me/game-profiles/${id}`, { method: "DELETE" }),

  // Platform links
  refreshPlatformLink: (id: string) =>
    request<{ ok: boolean }>(`/platform-links/${id}/refresh`, { method: "POST" }),
  unlinkPlatformLink: (id: string) =>
    request<{ ok: boolean }>(`/platform-links/${id}`, { method: "DELETE" }),

  // Teams
  listTeams: (gameId?: string) =>
    request<{ teams: PublicTeam[] }>(`/teams${gameId ? `?gameId=${gameId}` : ""}`),
  getTeam: (id: string) => request<PublicTeam>(`/teams/${id}`),
  createTeam: (payload: CreateTeamPayload) =>
    request<PublicTeam>("/teams", { method: "POST", body: JSON.stringify(payload) }),
  updateTeam: (id: string, payload: UpdateTeamPayload) =>
    request<PublicTeam>(`/teams/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  addTeamMember: (id: string, userId: string) =>
    request<PublicTeam>(`/teams/${id}/members`, { method: "POST", body: JSON.stringify({ userId }) }),
  removeTeamMember: (id: string, userId: string) =>
    request<{ ok: boolean }>(`/teams/${id}/members/${userId}`, { method: "DELETE" }),

  // Recruitment posts
  listRecruitmentPosts: (params?: { gameId?: string; type?: string; isOpen?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.gameId) q.set("gameId", params.gameId);
    if (params?.type) q.set("type", params.type);
    if (params?.isOpen !== undefined) q.set("isOpen", String(params.isOpen));
    const qs = q.toString();
    return request<{ recruitmentPosts: PublicRecruitmentPost[] }>(`/recruitment-posts${qs ? `?${qs}` : ""}`);
  },
  getRecruitmentPost: (id: string) => request<PublicRecruitmentPost>(`/recruitment-posts/${id}`),
  createRecruitmentPost: (payload: CreateRecruitmentPostPayload) =>
    request<PublicRecruitmentPost>("/recruitment-posts", { method: "POST", body: JSON.stringify(payload) }),
  updateRecruitmentPost: (id: string, payload: UpdateRecruitmentPostPayload) =>
    request<PublicRecruitmentPost>(`/recruitment-posts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteRecruitmentPost: (id: string) =>
    request<{ ok: boolean }>(`/recruitment-posts/${id}`, { method: "DELETE" }),
};

export const oauthUrl = (provider: "discord" | "google") => `${API_URL}/api/auth/${provider}`;

export const platformOauthUrl = (provider: "faceit" | "riot", game?: string) =>
  `${API_URL}/api/platform-links/${provider}/connect${game ? `?game=${game}` : ""}`;
