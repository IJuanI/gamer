import { UsersService } from "./users.service";
import type { PrismaService } from "../prisma/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  beforeEach(() => {
    service = new UsersService({} as unknown as PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
