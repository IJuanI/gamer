import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PublicRecruitmentPost } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { RecruitmentPost } from "@prisma/client";

@Injectable()
export class RecruitmentPostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { gameId?: string; type?: string; isOpen?: boolean }): Promise<RecruitmentPost[]> {
    const where: any = {};
    if (filters.gameId) where.gameId = filters.gameId;
    if (filters.type) where.type = filters.type;
    if (filters.isOpen !== undefined) where.isOpen = filters.isOpen;

    return this.prisma.recruitmentPost.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
    });
  }

  async findById(id: string): Promise<RecruitmentPost> {
    const post = await this.prisma.recruitmentPost.findUnique({
      where: { id },
    });
    if (!post) throw new NotFoundException("Publicación no encontrada");
    return post;
  }

  async create(
    authorId: string,
    data: { type: string; gameId: string; teamId?: string; title: string; body: string },
  ): Promise<RecruitmentPost> {
    return this.prisma.recruitmentPost.create({
      data: {
        ...data,
        authorId,
        isOpen: true,
      },
    });
  }

  async assertCanManage(id: string, userId: string): Promise<RecruitmentPost> {
    const post = await this.findById(id);
    if (post.authorId === userId) return post;
    throw new ForbiddenException("No podés editar esta publicación");
  }

  async update(id: string, data: { title?: string; body?: string; isOpen?: boolean }): Promise<RecruitmentPost> {
    return this.prisma.recruitmentPost.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recruitmentPost.delete({
      where: { id },
    });
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
      createdAt: post.createdAt.toISOString(),
    };
  }
}
