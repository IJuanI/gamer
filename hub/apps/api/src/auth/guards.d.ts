import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/** Authenticates via the JWT carried in the httpOnly `access_token` cookie. */
export declare class JwtAuthGuard extends JwtAuthGuard_base {
}
/** Authorizes based on @Roles(...). Must run after JwtAuthGuard. */
export declare class RolesGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export {};
