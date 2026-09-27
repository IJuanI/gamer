import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PublicRecruitmentPost } from "@gamer/shared";
import { FirestoreService } from "../firestore/firestore.service";
import { GamesService } from "../games/games.service";

type RecruitmentPostType = "LOOKING_FOR_TEAM" | "LOOKING_FOR_PLAYERS";

interface RecruitmentPost {
  id: string;
  type: RecruitmentPostType;
  authorId: string;
  gameId: string;
  teamId?: string;
  title: string;
  body: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class RecruitmentPostsService {
  constructor(private readonly firestore: FirestoreService) {}

  async list(filters: { gameId?: string; type?: RecruitmentPostType; isOpen?: boolean }): Promise<RecruitmentPost[]> {
    let query: Array<[string, string, any]> = [];
    if (filters.gameId) query.push(["gameId", "==", filters.gameId]);
    if (filters.type) query.push(["type", "==", filters.type]);
    if (filters.isOpen !== undefined) query.push(["isOpen", "==", filters.isOpen]);

    return query.length > 0 ? this.firestore.query<RecruitmentPost>("recruitmentPosts", query) : this.firestore.findAll<RecruitmentPost>("recruitmentPosts");
  }

  async findById(id: string): Promise<RecruitmentPost> {
    const post = await this.firestore.findUnique<RecruitmentPost>("recruitmentPosts", id);
    if (!post) throw new NotFoundException("Publicación no encontrada");
    return post;
  }

  async create(
    authorId: string,
    data: { type: RecruitmentPostType; gameId: string; teamId?: string; title: string; body: string },
  ): Promise<RecruitmentPost> {
    return this.firestore.create<RecruitmentPost>("recruitmentPosts", {
      ...data,
      authorId,
      isOpen: true,
    });
  }

  async assertCanManage(id: string, userId: string): Promise<RecruitmentPost> {
    const post = await this.findById(id);
    if (post.authorId === userId) return post;
    throw new ForbiddenException("No podés editar esta publicación");
  }

  async update(id: string, data: { title?: string; body?: string; isOpen?: boolean }): Promise<RecruitmentPost> {
    return this.firestore.set<RecruitmentPost>("recruitmentPosts", id, data);
  }

  async delete(id: string): Promise<void> {
    await this.firestore.delete("recruitmentPosts", id);
  }

  static toPublic(post: RecruitmentPost): PublicRecruitmentPost {
    return {
      id: post.id,
      type: post.type,
      author: { id: post.authorId, displayName: "Unknown", avatarUrl: null },
      game: { id: post.gameId, slug: "", name: "", iconUrl: null, rankVerifiable: false },
      team: post.teamId ? { id: post.teamId, name: "Unknown", tag: null } : null,
      title: post.title,
      body: post.body,
      isOpen: post.isOpen,
      createdAt: post.createdAt,
    };
  }
}
