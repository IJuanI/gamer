/** Shared types between the GamER Hub API and web app. */

export const Role = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  MEMBER: "Miembro",
};

/** Public, safe-to-serialize representation of a user. */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

// ── Games & gaming profiles ──────────────────────────────

export const PlatformProvider = {
  FACEIT: "FACEIT",
  RIOT: "RIOT",
  EPIC: "EPIC",
} as const;
export type PlatformProvider = (typeof PlatformProvider)[keyof typeof PlatformProvider];

export interface PublicGame {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  /** Whether this game has any verified rank source at all (drives whether a rank badge can ever render). */
  rankVerifiable: boolean;
}

/** Cached, provider-specific stats — only ever set from a verified platform sync, never user input. */
export interface PlatformLinkStats {
  elo?: number;
  skillLevel?: number;
  tier?: string;
  division?: string;
  leaguePoints?: number;
}

export interface PublicPlatformLink {
  id: string;
  provider: PlatformProvider;
  externalHandle: string;
  /** True if this provider/game combo can supply real rank data (false = identity verification only). */
  hasRankData: boolean;
  cachedStats: PlatformLinkStats | null;
  statsFetchedAt: string | null;
}

export interface PublicGameProfile {
  id: string;
  userId: string;
  game: PublicGame;
  inGameHandle: string;
  platformLink: PublicPlatformLink | null;
  createdAt: string;
}

export interface CreateGameProfilePayload {
  gameId: string;
  inGameHandle: string;
}

export interface UpdateGameProfilePayload {
  inGameHandle: string;
}

// ── Teams ─────────────────────────────────────────────────

export const TeamRole = {
  CAPTAIN: "CAPTAIN",
  MEMBER: "MEMBER",
} as const;
export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

export interface PublicTeamMember {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: TeamRole;
  joinedAt: string;
}

export interface PublicTeam {
  id: string;
  name: string;
  tag: string | null;
  logoUrl: string | null;
  bio: string | null;
  game: PublicGame;
  members: PublicTeamMember[];
  createdAt: string;
}

export interface CreateTeamPayload {
  name: string;
  gameId: string;
  tag?: string;
  logoUrl?: string;
  bio?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  tag?: string;
  logoUrl?: string;
  bio?: string;
}

// ── Recruitment posts ────────────────────────────────────

export const RecruitmentPostType = {
  LOOKING_FOR_TEAM: "LOOKING_FOR_TEAM",
  LOOKING_FOR_PLAYERS: "LOOKING_FOR_PLAYERS",
} as const;
export type RecruitmentPostType =
  (typeof RecruitmentPostType)[keyof typeof RecruitmentPostType];

export interface PublicRecruitmentPost {
  id: string;
  type: RecruitmentPostType;
  author: { id: string; displayName: string; avatarUrl: string | null };
  game: PublicGame;
  team: { id: string; name: string; tag: string | null } | null;
  title: string;
  body: string;
  isOpen: boolean;
  createdAt: string;
}

export interface CreateRecruitmentPostPayload {
  type: RecruitmentPostType;
  gameId: string;
  teamId?: string;
  title: string;
  body: string;
}

export interface UpdateRecruitmentPostPayload {
  title?: string;
  body?: string;
  isOpen?: boolean;
}
