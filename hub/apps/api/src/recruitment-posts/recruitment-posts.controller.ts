import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { PublicRecruitmentPost, RecruitmentPostType } from "@gamer/shared";
import { CurrentUser } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards";
import { GamesService } from "../games/games.service";
import { TeamsService } from "../teams/teams.service";
import { RecruitmentPostsService } from "./recruitment-posts.service";
import { CreateRecruitmentPostDto, UpdateRecruitmentPostDto } from "./dto";

interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Controller("recruitment-posts")
export class RecruitmentPostsController {
  constructor(
    private readonly posts: RecruitmentPostsService,
    private readonly games: GamesService,
    private readonly teams: TeamsService,
  ) {}

  /** Public: browse LFT/LFP posts, filterable by game/type/open state. */
  @Get()
  async list(
    @Query("gameId") gameId?: string,
    @Query("type") type?: RecruitmentPostType,
    @Query("isOpen") isOpen?: string,
  ): Promise<{ posts: PublicRecruitmentPost[] }> {
    const posts = await this.posts.list({
      gameId,
      type: type as never,
      isOpen: isOpen === undefined ? undefined : isOpen === "true",
    });
    return { posts: posts.map(RecruitmentPostsService.toPublic) };
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<{ post: PublicRecruitmentPost }> {
    const post = await this.posts.findById(id);
    return { post: RecruitmentPostsService.toPublic(post) };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateRecruitmentPostDto,
  ): Promise<{ post: PublicRecruitmentPost }> {
    const game = await this.games.findById(dto.gameId);
    if (!game) throw new NotFoundException("Juego no encontrado");
    if (dto.teamId) {
      await this.teams.assertCaptain(dto.teamId, user.id);
    }
    const post = await this.posts.create(user.id, dto as never);
    return { post: RecruitmentPostsService.toPublic(post) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateRecruitmentPostDto,
  ): Promise<{ post: PublicRecruitmentPost }> {
    await this.posts.assertCanManage(id, user.id);
    const post = await this.posts.update(id, dto);
    return { post: RecruitmentPostsService.toPublic(post) };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@CurrentUser() user: User, @Param("id") id: string): Promise<{ ok: true }> {
    await this.posts.assertCanManage(id, user.id);
    await this.posts.delete(id);
    return { ok: true };
  }
}
