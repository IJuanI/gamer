import { Strategy } from "passport-discord";
import { UsersService } from "../users/users.service";
declare const DiscordStrategy_base: new (options: import("passport-discord").StrategyOptions) => Strategy & {
    validate(...args: any[]): unknown;
};
/**
 * Registered only when DISCORD_CLIENT_ID/SECRET are set (see auth.module).
 * Profile shape comes from passport-discord.
 */
export declare class DiscordStrategy extends DiscordStrategy_base {
    private readonly users;
    constructor(users: UsersService);
    validate(_accessToken: string, _refreshToken: string, profile: any): Promise<{
        id: string;
        email: string;
        displayName: string;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.Role;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
