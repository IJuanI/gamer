import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TeamRole as PrismaTeamRole, type Prisma } from "@prisma/client";
import type { PublicTeam } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { GamesService } from "../games/games.service";

const withRelations = {
  game: true,
  members: { include: { user: true }, orderBy: { joinedAt: "asc" as const } },
} satisfies Prisma.TeamInclude;

type TeamWithRelations = Prisma.TeamGetPayload<{ include: typeof withRelations }>;

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  list(gameId?: string) {
    return this.prisma.team.findMany({
      where: gameId ? { gameId } : undefined,
      include: withRelations,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id }, include: withRelations });
    if (!team) throw new NotFoundException("Equipo no encontrado");
    return team;
  }

  async create(userId: string, data: { gameId: string; name: string; tag?: string; logoUrl?: string; bio?: string }) {
    const existing = await this.prisma.team.findFirst({
      where: { gameId: data.gameId, name: data.name },
    });
    if (existing) throw new ConflictException("Ya existe un equipo con ese nombre para este juego");

    const team = await this.prisma.team.create({
      data: {
        ...data,
        members: { create: { userId, role: PrismaTeamRole.CAPTAIN } },
      },
      include: withRelations,
    });
    return team;
  }

  async assertCaptain(teamId: string, userId: string) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership || membership.role !== PrismaTeamRole.CAPTAIN) {
      throw new ForbiddenException("Solo el capitán puede hacer esto");
    }
  }

  async update(id: string, data: { name?: string; tag?: string; logoUrl?: string; bio?: string }) {
    return this.prisma.team.update({ where: { id }, data, include: withRelations });
  }

  async addMember(teamId: string, userId: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (existing) throw new ConflictException("Ese usuario ya es parte del equipo");
    await this.prisma.teamMember.create({ data: { teamId, userId, role: PrismaTeamRole.MEMBER } });
    return this.findById(teamId);
  }

  async removeMember(teamId: string, userId: string) {
    const membership = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (!membership) throw new NotFoundException("Ese usuario no es parte del equipo");
    if (membership.role === PrismaTeamRole.CAPTAIN) {
      throw new ForbiddenException("El capitán no puede salir del equipo sin transferir el rol");
    }
    await this.prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
    return this.findById(teamId);
  }

  static toPublic(team: TeamWithRelations): PublicTeam {
    return {
      id: team.id,
      name: team.name,
      tag: team.tag,
      logoUrl: team.logoUrl,
      bio: team.bio,
      game: GamesService.toPublic(team.game),
      members: team.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      createdAt: team.createdAt.toISOString(),
    };
  }
}
