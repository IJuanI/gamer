/** Shared types between the GamER Hub API and web app. */
export declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly EDITOR: "EDITOR";
    readonly MEMBER: "MEMBER";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const ROLE_LABELS: Record<Role, string>;
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
