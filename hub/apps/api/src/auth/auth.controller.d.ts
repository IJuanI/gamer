import type { Request, Response } from "express";
import type { User } from "@prisma/client";
import type { AuthResponse } from "@gamer/shared";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    private setSessionCookie;
    register(dto: RegisterDto, res: Response): Promise<AuthResponse>;
    login(dto: LoginDto, res: Response): Promise<AuthResponse>;
    logout(res: Response): {
        ok: boolean;
    };
    me(user: User): AuthResponse;
    discordLogin(): void;
    discordCallback(req: Request, res: Response): void;
    googleLogin(): void;
    googleCallback(req: Request, res: Response): void;
}
