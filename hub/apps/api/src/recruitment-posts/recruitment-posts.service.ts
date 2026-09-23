import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma, RecruitmentPostType } from "@prisma/client";
import type { PublicRecruitmentPost } from "@gamer/shared";
import { PrismaService } from "../prisma/prisma.service";
import { GamesService } from "../games/games.service";

const withRelations = {
  author: true,
  game: true,
  team: true,
} satisfies Prisma.RecruitmentPostInclude;

type PostWithRelations = Prisma.RecruitmentPostGetPayload<{ include: typeof withRelations }>;

@Injectable()
export class RecruitmentPostsService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { gameId?: string; type?: RecruitmentPostType; isOpen?: boolean }) {
    return this.prisma.recruitmentPost.findMany({
      where: {
        gameId: filters.gameId,
        type: filters.type,
        isOpen: filters.isOpen,
      },
      include: withRelations,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.recruitmentPost.findUnique({ where: { id }, include: withRelations });
    if (!post) throw new NotFoundException("Publicación no encontrada");
    return post;
  }

  create(
    authorId: string,
    data: { type: RecruitmentPostType; gameId: string; teamId?: string; title: string; body: string },
  ) {
    return this.prisma.recruitmentPost.create({ data: { ...data, authorId }, include: withRelations });
  }

  async assertCanManage(id: string, userId: string) {
    const post = await this.findById(id);
    if (post.authorId === userId) return post;
    if (post.teamId) {
      const captain = await this.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: post.teamId, userId } },
      });
      if (captain?.role === "CAPTAIN") return post;
    }
    throw new ForbiddenException("No podés editar esta publicación");
  }

  update(id: string, data: { title?: string; body?: string; isOpen?: boolean }) {
    return this.prisma.recruitmentPost.update({ where: { id }, data, include: withRelations });
  }

  delete(id: string) {
    return this.prisma.recruitmentPost.delete({ where: { id } });
  }

  static toPublic(post: PostWithRelations): PublicRecruitmentPost {
    return {
      id: post.id,
      type: post.type,
      author: { id: post.author.id, displayName: post.author.displayName, avatarUrl: post.author.avatarUrl },
      game: GamesService.toPublic(post.game),
      team: post.team ? { id: post.team.id, name: post.team.name, tag: post.team.tag } : null,
      title: post.title,
      body: post.body,
      isOpen: post.isOpen,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
