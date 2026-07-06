import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./guards";

function contextWith(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => () => {},
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
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
    expect(() => guard.canActivate(contextWith({ role: "MEMBER" }))).toThrow(ForbiddenException);
  });

  it("rechaza cuando no hay usuario autenticado", () => {
    reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    expect(() => guard.canActivate(contextWith(undefined))).toThrow(ForbiddenException);
  });
});
