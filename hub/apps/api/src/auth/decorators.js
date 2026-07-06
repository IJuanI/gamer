"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = "roles";
/** Restrict a route to one or more roles. Used with RolesGuard. */
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
/** Inject the authenticated user (set by JwtStrategy.validate) into a handler. */
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    return ctx.switchToHttp().getRequest().user;
});
