import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PublicTeam } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { Team, TeamMember } from "@prisma/client";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(gameId?: string) {
    return this.prisma.team.findMany({
      where: gameId ? { gameId } : undefined,
      include: { members: { include: { user: true } } },
    });
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (!team) throw new NotFoundException("Equipo no encontrado");
    return team;
  }

  async create(userId: string, data: { gameId: string; name: string; tag?: string; logoUrl?: string; bio?: string }) {
    const existing = await this.prisma.team.findFirst({
      where: {
        gameId: data.gameId,
        name: data.name,
      },
    });
    if (existing) throw new ConflictException("Ya existe un equipo con ese nombre para este juego");

    return this.prisma.team.create({
      data: {
        ...data,
        members: {
          create: {
            userId,
            role: "CAPTAIN",
          },
        },
      },
      include: { members: { include: { user: true } } },
    });
  }

  async assertCaptain(teamId: string, userId: string): Promise<void> {
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });
    if (!membership || membership.role !== "CAPTAIN") {
      throw new ForbiddenException("Solo el capitán puede hacer esto");
    }
  }

  async update(id: string, data: { name?: string; tag?: string; logoUrl?: string; bio?: string }) {
    return this.prisma.team.update({
      where: { id },
      data,
      include: { members: { include: { user: true } } },
    });
  }

  async addMember(teamId: string, userId: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });
    if (existing) {
      throw new ConflictException("Ese usuario ya es parte del equipo");
    }
    await this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: "MEMBER",
      },
    });
    return this.findById(teamId);
  }

  async removeMember(teamId: string, userId: string) {
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });
    if (!membership) {
      throw new NotFoundException("Ese usuario no es parte del equipo");
    }
    if (membership.role === "CAPTAIN") {
      throw new ForbiddenException("El capitán no puede salir del equipo sin transferir el rol");
    }
    await this.prisma.teamMember.delete({
      where: {
        teamId_userId: { teamId, userId },
      },
    });
    return this.findById(teamId);
  }

  static toPublic(team: any): PublicTeam {
    return {
      id: team.id,
      name: team.name,
      tag: team.tag || null,
      logoUrl: team.logoUrl || null,
      bio: team.bio || null,
      game: { id: team.gameId, slug: "", name: "", iconUrl: null, rankVerifiable: false },
      members: team.members.map((member: TeamMember & { user: any }) => ({
        id: member.id,
        userId: member.userId,
        displayName: member.user.displayName,
        avatarUrl: member.user.avatarUrl || null,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      })),
      createdAt: team.createdAt.toISOString(),
    };
  }
}
