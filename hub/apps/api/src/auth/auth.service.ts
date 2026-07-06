import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto";

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException("Ya existe una cuenta con ese email");

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.users.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    });
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");
    return user;
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id });
  }
}
