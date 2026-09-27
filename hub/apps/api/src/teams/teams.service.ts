import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PublicTeam } from "@gamer/shared";
import { FirestoreService } from "../firestore/firestore.service";
import { GamesService } from "../games/games.service";

interface Team {
  id: string;
  gameId: string;
  name: string;
  tag?: string;
  logoUrl?: string;
  bio?: string;
  captainId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class TeamsService {
  constructor(private readonly firestore: FirestoreService) {}

  async list(gameId?: string): Promise<Team[]> {
    if (gameId) {
      return this.firestore.query<Team>("teams", [["gameId", "==", gameId]]);
    }
    return this.firestore.findAll<Team>("teams");
  }

  async findById(id: string): Promise<Team> {
    const team = await this.firestore.findUnique<Team>("teams", id);
    if (!team) throw new NotFoundException("Equipo no encontrado");
    return team;
  }

  async create(userId: string, data: { gameId: string; name: string; tag?: string; logoUrl?: string; bio?: string }): Promise<Team> {
    const existing = await this.firestore.query<Team>("teams", [
      ["gameId", "==", data.gameId],
      ["name", "==", data.name],
    ]);
    if (existing.length > 0) throw new ConflictException("Ya existe un equipo con ese nombre para este juego");

    return this.firestore.create<Team>("teams", {
      ...data,
      captainId: userId,
      memberIds: [userId],
    });
  }

  async assertCaptain(teamId: string, userId: string): Promise<void> {
    const team = await this.findById(teamId);
    if (team.captainId !== userId) {
      throw new ForbiddenException("Solo el capitán puede hacer esto");
    }
  }

  async update(id: string, data: { name?: string; tag?: string; logoUrl?: string; bio?: string }): Promise<Team> {
    return this.firestore.set<Team>("teams", id, data);
  }

  async addMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (team.memberIds.includes(userId)) {
      throw new ConflictException("Ese usuario ya es parte del equipo");
    }
    return this.firestore.set<Team>("teams", teamId, {
      memberIds: [...team.memberIds, userId],
    });
  }

  async removeMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team.memberIds.includes(userId)) {
      throw new NotFoundException("Ese usuario no es parte del equipo");
    }
    if (team.captainId === userId) {
      throw new ForbiddenException("El capitán no puede salir del equipo sin transferir el rol");
    }
    return this.firestore.set<Team>("teams", teamId, {
      memberIds: team.memberIds.filter((id) => id !== userId),
    });
  }

  static toPublic(team: Team): PublicTeam {
    return {
      id: team.id,
      name: team.name,
      tag: team.tag || null,
      logoUrl: team.logoUrl || null,
      bio: team.bio || null,
      game: { id: team.gameId, slug: "", name: "", iconUrl: null, rankVerifiable: false },
      members: team.memberIds.map((userId) => ({
        id: `${team.id}-${userId}`,
        userId,
        displayName: "Unknown",
        avatarUrl: null,
        role: userId === team.captainId ? "CAPTAIN" : "MEMBER",
        joinedAt: team.createdAt,
      })),
      createdAt: team.createdAt,
    };
  }
}
