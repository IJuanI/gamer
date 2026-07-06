import type { User } from "@prisma/client";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

const makeUser = (over: Partial<User> = {}): User => ({
  id: "u1",
  email: "test@gamer.net.ar",
  displayName: "Test",
  passwordHash: null,
  role: "MEMBER",
  avatarUrl: null,
  createdAt: new Date("2026-01-15T10:00:00Z"),
  updatedAt: new Date("2026-01-15T10:00:00Z"),
  ...over,
});

describe("UsersService", () => {
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let service: UsersService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it("findByEmail normaliza el email a minúsculas", () => {
    service.findByEmail("Test@Gamer.NET.AR");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@gamer.net.ar" },
    });
  });

  it("create normaliza el email a minúsculas", () => {
    prisma.user.create.mockResolvedValue(makeUser());
    service.create({ email: "Nuevo@Gamer.NET.AR", displayName: "Nuevo" } as never);
    expect(prisma.user.create.mock.calls[0][0].data.email).toBe("nuevo@gamer.net.ar");
  });

  it("toPublic no expone el hash de la contraseña", () => {
    const pub = UsersService.toPublic(makeUser({ passwordHash: "secret-hash" }));
    expect(pub).not.toHaveProperty("passwordHash");
    expect(pub.createdAt).toBe("2026-01-15T10:00:00.000Z");
    expect(pub.role).toBe("MEMBER");
  });
});
