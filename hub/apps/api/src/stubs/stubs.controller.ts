import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";

@Controller()
export class StubsController {
  private stubResponse = { message: "Feature coming soon", data: [] };

  // Games
  @Get("games")
  getGames() {
    return { games: [] };
  }

  @Get("games/:id")
  getGame(@Param("id") id: string) {
    return this.stubResponse;
  }

  @Post("games")
  createGame() {
    return this.stubResponse;
  }

  // Game Profiles
  @Get("game-profiles")
  getGameProfiles() {
    return { gameProfiles: [] };
  }

  @Post("game-profiles")
  createGameProfile() {
    return this.stubResponse;
  }

  // Teams
  @Get("teams")
  getTeams() {
    return { teams: [] };
  }

  @Post("teams")
  createTeam() {
    return this.stubResponse;
  }

  @Put("teams/:id")
  updateTeam(@Param("id") id: string) {
    return this.stubResponse;
  }

  @Delete("teams/:id")
  deleteTeam(@Param("id") id: string) {
    return { ok: true };
  }

  // Recruitment Posts
  @Get("recruitment-posts")
  getRecruitmentPosts() {
    return { recruitmentPosts: [] };
  }

  @Post("recruitment-posts")
  createRecruitmentPost() {
    return this.stubResponse;
  }

  // Platform Links
  @Get("platform-links")
  getPlatformLinks() {
    return { platformLinks: [] };
  }

  @Post("platform-links")
  createPlatformLink() {
    return this.stubResponse;
  }
}
