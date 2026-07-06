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
import type { User } from "@prisma/client";
import type { AuthResponse } from "@gamer/shared";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto, RegisterDto } from "./dto";
import { CurrentUser } from "./decorators";
import { JwtAuthGuard } from "./guards";

const COOKIE_NAME = "access_token";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setSessionCookie(res: Response, user: User) {
    const token = this.auth.signToken(user);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.register(dto);
    this.setSessionCookie(res, user);
    return { user: UsersService.toPublic(user) };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.validateCredentials(dto.email, dto.password);
    this.setSessionCookie(res, user);
    return { user: UsersService.toPublic(user) };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: User): AuthResponse {
    if (!user) throw new UnauthorizedException();
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
  discordCallback(@Req() req: Request, @Res() res: Response) {
    this.setSessionCookie(res, req.user as User);
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
  googleCallback(@Req() req: Request, @Res() res: Response) {
    this.setSessionCookie(res, req.user as User);
    res.redirect(`${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/dashboard`);
  }
}
