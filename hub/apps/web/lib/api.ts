import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  PublicUser,
} from "@gamer/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  me: () => request<AuthResponse>("/auth/me"),

  listUsers: () => request<{ users: PublicUser[] }>("/users"),
};

export const oauthUrl = (provider: "discord" | "google") => `${API_URL}/api/auth/${provider}`;
