import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto";
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    register(dto: RegisterDto): Promise<User>;
    validateCredentials(email: string, password: string): Promise<User>;
    signToken(user: User): string;
}
