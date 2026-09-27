import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import type { AuthResponse } from "@gamer/shared";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto, RegisterDto } from "./dto";
import { CurrentUser } from "./decorators";
import { JwtAuthGuard } from "./guards";

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

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  private setSessionCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  private clearSessionCookies(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.register(dto);
    await this.users.updateActivity(user.id);
    const tokens = this.auth.signTokens(user);
    this.setSessionCookies(res, tokens);
    return { user: UsersService.toPublic(user) };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.validateCredentials(dto.email, dto.password);
    await this.users.updateActivity(user.id);
    const tokens = this.auth.signTokens(user);
    this.setSessionCookies(res, tokens);
    return { user: UsersService.toPublic(user) };
  }

  @Post("refresh")
  @UseGuards(AuthGuard("refresh"))
  async refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    if (!user) throw new UnauthorizedException();
    await this.users.updateActivity(user.id);
    const tokens = this.auth.signTokens(user);
    this.setSessionCookies(res, tokens);
    return { user: UsersService.toPublic(user) };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearSessionCookies(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    if (!user) throw new UnauthorizedException();
    await this.users.updateActivity(user.id);
    return { user: UsersService.toPublic(user) };
  }

  // ── OAuth: Discord ──────────────────────────────────────
  @Get("discord")
  @UseGuards(AuthGuard("discord"))
  discordLogin() {
    // Passport redirects to Discord.
  }

  @Get("discord/callback")
  @UseGuards(AuthGuard("discord"))
  async discordCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    await this.users.updateActivity(user.id);
    const tokens = this.auth.signTokens(user);
    this.setSessionCookies(res, tokens);
    res.redirect(`${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/dashboard`);
  }

  // ── OAuth: Google ───────────────────────────────────────
  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleLogin() {
    // Passport redirects to Google.
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    await this.users.updateActivity(user.id);
    const tokens = this.auth.signTokens(user);
    this.setSessionCookies(res, tokens);
    res.redirect(`${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/dashboard`);
  }
}
