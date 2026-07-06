"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const guards_1 = require("./guards");
function contextWith(user) {
    return {
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
        getHandler: () => () => { },
        getClass: () => class {
        },
    };
}
describe("RolesGuard", () => {
    let reflector;
    let guard;
    beforeEach(() => {
        reflector = { getAllAndOverride: jest.fn() };
        guard = new guards_1.RolesGuard(reflector);
    });
    it("permite rutas sin @Roles", () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);
        expect(guard.canActivate(contextWith({ role: "MEMBER" }))).toBe(true);
    });
    it("permite cuando el rol del usuario está autorizado", () => {
        reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
        expect(guard.canActivate(contextWith({ role: "ADMIN" }))).toBe(true);
    });
    it("rechaza cuando el rol no alcanza", () => {
        reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
        expect(() => guard.canActivate(contextWith({ role: "MEMBER" }))).toThrow(common_1.ForbiddenException);
    });
    it("rechaza cuando no hay usuario autenticado", () => {
        reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
        expect(() => guard.canActivate(contextWith(undefined))).toThrow(common_1.ForbiddenException);
    });
});
