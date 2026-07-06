"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const auth_service_1 = require("./auth.service");
const makeUser = (over = {}) => ({
    id: "u1",
    email: "test@gamer.net.ar",
    displayName: "Test",
    passwordHash: null,
    role: "MEMBER",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
});
describe("AuthService", () => {
    let service;
    let users;
    let jwt;
    beforeEach(() => {
        users = { findByEmail: jest.fn(), create: jest.fn() };
        jwt = { sign: jest.fn().mockReturnValue("signed.jwt.token") };
        service = new auth_service_1.AuthService(users, jwt);
    });
    describe("register", () => {
        it("rechaza un email ya existente", async () => {
            users.findByEmail.mockResolvedValue(makeUser());
            await expect(service.register({ email: "test@gamer.net.ar", password: "password123", displayName: "Test" })).rejects.toBeInstanceOf(common_1.ConflictException);
            expect(users.create).not.toHaveBeenCalled();
        });
        it("hashea la contraseña y crea el usuario", async () => {
            users.findByEmail.mockResolvedValue(null);
            users.create.mockImplementation((d) => Promise.resolve(makeUser(d)));
            await service.register({ email: "new@gamer.net.ar", password: "password123", displayName: "Nuevo" });
            const arg = users.create.mock.calls[0][0];
            expect(arg.passwordHash).not.toBe("password123");
            await expect(bcrypt.compare("password123", arg.passwordHash)).resolves.toBe(true);
        });
    });
    describe("validateCredentials", () => {
        it("rechaza si el usuario no existe", async () => {
            users.findByEmail.mockResolvedValue(null);
            await expect(service.validateCredentials("x@y.com", "pw")).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it("rechaza una cuenta sin contraseña (solo OAuth)", async () => {
            users.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));
            await expect(service.validateCredentials("x@y.com", "pw")).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it("rechaza una contraseña incorrecta", async () => {
            const passwordHash = await bcrypt.hash("correcta", 12);
            users.findByEmail.mockResolvedValue(makeUser({ passwordHash }));
            await expect(service.validateCredentials("x@y.com", "incorrecta")).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it("acepta una contraseña correcta", async () => {
            const passwordHash = await bcrypt.hash("correcta", 12);
            const user = makeUser({ passwordHash });
            users.findByEmail.mockResolvedValue(user);
            await expect(service.validateCredentials("x@y.com", "correcta")).resolves.toBe(user);
        });
    });
    it("signToken firma con el id del usuario como subject", () => {
        expect(service.signToken(makeUser())).toBe("signed.jwt.token");
        expect(jwt.sign).toHaveBeenCalledWith({ sub: "u1" });
    });
});
