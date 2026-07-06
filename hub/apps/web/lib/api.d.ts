import type { AuthResponse, LoginPayload, RegisterPayload, PublicUser } from "@gamer/shared";
export declare const api: {
    register: (payload: RegisterPayload) => Promise<AuthResponse>;
    login: (payload: LoginPayload) => Promise<AuthResponse>;
    logout: () => Promise<{
        ok: boolean;
    }>;
    me: () => Promise<AuthResponse>;
    listUsers: () => Promise<{
        users: PublicUser[];
    }>;
};
export declare const oauthUrl: (provider: "discord" | "google") => string;
