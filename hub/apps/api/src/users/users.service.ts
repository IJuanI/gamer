import { Injectable } from "@nestjs/common";
import type { PublicUser } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { User, Account } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateActivity(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async create(data: {
    email: string;
    displayName: string;
    passwordHash?: string;
    avatarUrl?: string | null;
    role?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        displayName: data.displayName,
        passwordHash: data.passwordHash,
        avatarUrl: data.avatarUrl || null,
        role: data.role || "MEMBER",
      },
    });
  }

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

    if (existing) {
      return existing.user;
    }

    const email = params.email.toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.create({
        email,
        displayName: params.displayName,
        avatarUrl: params.avatarUrl,
      });
    }

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
      role: user.role.toLowerCase() as any,
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
