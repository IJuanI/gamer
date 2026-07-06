import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import type { Role } from "@gamer/shared";

export const ROLES_KEY = "roles";

/** Restrict a route to one or more roles. Used with RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Inject the authenticated user (set by JwtStrategy.validate) into a handler. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
