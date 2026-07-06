"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthUrl = exports.api = void 0;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
async function request(path, init) {
    const res = await fetch(`${API_URL}/api${path}`, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Request failed (${res.status})`);
    }
    return res.json();
}
exports.api = {
    register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
    login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me"),
    listUsers: () => request("/users"),
};
const oauthUrl = (provider) => `${API_URL}/api/auth/${provider}`;
exports.oauthUrl = oauthUrl;
