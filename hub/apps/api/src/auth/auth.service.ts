import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "90d";

interface UserWithPassword {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserWithPassword> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException("Ya existe una cuenta con ese email");

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.users.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    }) as any;
  }

  async validateCredentials(email: string, password: string): Promise<UserWithPassword> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");
    return user as any;
  }

  signTokens(user: UserWithPassword): TokenPair {
    return {
      accessToken: this.jwt.sign({ sub: user.id, type: "access" }, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      refreshToken: this.jwt.sign({ sub: user.id, type: "refresh" }, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
    };
  }
}
