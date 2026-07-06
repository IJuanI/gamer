import { Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";
export interface JwtPayload {
    sub: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly users;
    constructor(users: UsersService);
    validate(payload: JwtPayload): Promise<{
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
