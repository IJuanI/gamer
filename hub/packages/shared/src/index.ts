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
