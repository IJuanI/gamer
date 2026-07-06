import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

const makeUser = (over: Partial<User> = {}): User => ({
  id: "u1",
  email: "test@gamer.net.ar",
  displayName: "Test",
  passwordHash: null,
  role: "MEMBER",
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

describe("AuthService", () => {
  let service: AuthService;
  let users: { findByEmail: jest.Mock; create: jest.Mock };
  let jwt: { sign: jest.Mock };

  beforeEach(() => {
    users = { findByEmail: jest.fn(), create: jest.fn() };
    jwt = { sign: jest.fn().mockReturnValue("signed.jwt.token") };
    service = new AuthService(users as unknown as UsersService, jwt as never);
  });

  describe("register", () => {
    it("rechaza un email ya existente", async () => {
      users.findByEmail.mockResolvedValue(makeUser());
      await expect(
        service.register({ email: "test@gamer.net.ar", password: "password123", displayName: "Test" }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });

    it("hashea la contraseña y crea el usuario", async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockImplementation((d) => Promise.resolve(makeUser(d)));

      await service.register({ email: "new@gamer.net.ar", password: "password123", displayName: "Nuevo" });

      const arg = users.create.mock.calls[0][0];
      expect(arg.passwordHash).not.toBe("password123");
      await expect(bcrypt.compare("password123", arg.passwordHash)).resolves.toBe(true);
    });
  });

  describe("validateCredentials", () => {
    it("rechaza si el usuario no existe", async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(service.validateCredentials("x@y.com", "pw")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it("rechaza una cuenta sin contraseña (solo OAuth)", async () => {
      users.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));
      await expect(service.validateCredentials("x@y.com", "pw")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it("rechaza una contraseña incorrecta", async () => {
      const passwordHash = await bcrypt.hash("correcta", 12);
      users.findByEmail.mockResolvedValue(makeUser({ passwordHash }));
      await expect(service.validateCredentials("x@y.com", "incorrecta")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it("acepta una contraseña correcta", async () => {
      const passwordHash = await bcrypt.hash("correcta", 12);
      const user = makeUser({ passwordHash });
      users.findByEmail.mockResolvedValue(user);
      await expect(service.validateCredentials("x@y.com", "correcta")).resolves.toBe(user);
    });
  });

  it("signToken firma con el id del usuario como subject", () => {
    expect(service.signToken(makeUser())).toBe("signed.jwt.token");
    expect(jwt.sign).toHaveBeenCalledWith({ sub: "u1" });
  });
});
