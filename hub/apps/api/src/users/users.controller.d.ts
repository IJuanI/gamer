import { PrismaService } from "../prisma/prisma.service";
export declare class UsersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /** Admin-only: list every member of the community. Demonstrates RBAC. */
    list(): Promise<{
        users: import("@gamer/shared").PublicUser[];
    }>;
}
