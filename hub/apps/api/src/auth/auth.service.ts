import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto";

const SALT_ROUNDS = 12;

interface UserWithPassword {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  role?: string;
  createdAt: string;
  updatedAt: string;
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

  signToken(user: UserWithPassword): string {
    return this.jwt.sign({ sub: user.id });
  }
}
