import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PublicGameProfile } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { GameProfile } from "@prisma/client";

@Injectable()
export class GameProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<GameProfile[]> {
    return this.prisma.gameProfile.findMany({
      where: { userId },
    });
  }

  async findOwned(id: string, userId: string): Promise<GameProfile> {
    const profile = await this.prisma.gameProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException("Perfil de juego no encontrado");
    if (profile.userId !== userId) throw new ForbiddenException("No podés editar este perfil");
    return profile;
  }

  async create(userId: string, gameId: string, inGameHandle: string): Promise<GameProfile> {
    const existing = await this.prisma.gameProfile.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    if (existing) throw new ConflictException("Ya tenés un perfil para este juego");
    return this.prisma.gameProfile.create({
      data: {
        userId,
        gameId,
        inGameHandle,
      },
    });
  }

  async update(id: string, inGameHandle: string): Promise<GameProfile> {
    return this.prisma.gameProfile.update({
      where: { id },
      data: { inGameHandle },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gameProfile.delete({
      where: { id },
    });
  }

  static toPublic(profile: GameProfile): PublicGameProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      game: { id: profile.gameId, slug: "", name: "", iconUrl: null, rankVerifiable: false },
      inGameHandle: profile.inGameHandle,
      createdAt: profile.createdAt.toISOString(),
      platformLink: null,
    };
  }
}
