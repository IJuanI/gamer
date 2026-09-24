import { Module } from "@nestjs/common";
import { GamesModule } from "../games/games.module";
import { TeamsModule } from "../teams/teams.module";
import { RecruitmentPostsService } from "./recruitment-posts.service";
import { RecruitmentPostsController } from "./recruitment-posts.controller";

@Module({
  imports: [GamesModule, TeamsModule],
  controllers: [RecruitmentPostsController],
  providers: [RecruitmentPostsService],
})
export class RecruitmentPostsModule {}
