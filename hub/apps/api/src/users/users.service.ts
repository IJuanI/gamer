import { Injectable } from "@nestjs/common";
import type { PublicUser } from "@gamer/shared";
import { FirestoreService } from "../firestore/firestore.service";
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  provider: string;
  providerAccountId: string;
  userId: string;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly firestore: FirestoreService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.firestore.findByField<User>(
      "users",
      "email",
      email.toLowerCase()
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.firestore.findUnique<User>("users", id);
  }

  async getAll(): Promise<User[]> {
    return this.firestore.findAll<User>("users");
  }

  async create(data: {
    email: string;
    displayName: string;
    passwordHash?: string;
    avatarUrl?: string | null;
    role?: string;
  }): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    return this.firestore.set<User>("users", id, {
      email: data.email.toLowerCase(),
      displayName: data.displayName,
      ...(data.passwordHash && { passwordHash: data.passwordHash }),
      avatarUrl: data.avatarUrl || null,
      role: data.role || "user",
      createdAt: now,
      updatedAt: now,
    });
  }

  async findOrCreateByOAuth(params: {
    provider: string;
    providerAccountId: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  }): Promise<User> {
    const accountKey = `${params.provider}_${params.providerAccountId}`;

    const existing = await this.firestore.findByField<Account>(
      "accounts",
      "accountKey",
      accountKey
    );

    if (existing) {
      const user = await this.firestore.findUnique<User>("users", existing.userId);
      if (user) return user;
    }

    const email = params.email.toLowerCase();
    let user = await this.firestore.findByField<User>("users", "email", email);

    if (!user) {
      user = await this.create({
        email,
        displayName: params.displayName,
        avatarUrl: params.avatarUrl,
      });
    }

    await this.firestore.create<Account>("accounts", {
      accountKey,
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      userId: user.id,
    });

    return user;
  }

  static toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: (user.role || "user") as any,
      avatarUrl: user.avatarUrl || null,
      createdAt: user.createdAt,
    };
  }
}
