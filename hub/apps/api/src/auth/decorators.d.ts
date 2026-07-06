import type { Role } from "@gamer/shared";
export declare const ROLES_KEY = "roles";
/** Restrict a route to one or more roles. Used with RolesGuard. */
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
/** Inject the authenticated user (set by JwtStrategy.validate) into a handler. */
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
