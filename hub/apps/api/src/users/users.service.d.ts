import type { Prisma, User } from "@prisma/client";
import type { PublicUser } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        displayName: string;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.Role;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findById(id: string): Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        displayName: string;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.Role;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    create(data: Prisma.UserCreateInput): Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        displayName: string;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.Role;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    /** Find a user by OAuth identity, creating one (and the User) on first login. */
    findOrCreateByOAuth(params: {
        provider: string;
        providerAccountId: string;
        email: string;
        displayName: string;
        avatarUrl?: string | null;
    }): Promise<User>;
    static toPublic(user: User): PublicUser;
}
