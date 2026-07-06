import { Injectable } from "@nestjs/common";
import type { Prisma, User } from "@prisma/client";
import type { PublicUser } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  /** Find a user by OAuth identity, creating one (and the User) on first login. */
  async findOrCreateByOAuth(params: {
    provider: string;
    providerAccountId: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  }): Promise<User> {
    const existing = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
        },
      },
      include: { user: true },
    });
    if (existing) return existing.user;

    const email = params.email.toLowerCase();
    // Reuse a local account with the same email if one exists; else create.
    const user =
      (await this.prisma.user.findUnique({ where: { email } })) ??
      (await this.prisma.user.create({
        data: { email, displayName: params.displayName, avatarUrl: params.avatarUrl },
      }));

    await this.prisma.account.create({
      data: {
        provider: params.provider,
        providerAccountId: params.providerAccountId,
        userId: user.id,
      },
    });
    return user;
  }

  static toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
