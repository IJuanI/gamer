"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
/**
 * End-to-end auth + RBAC flow. Requires a running Postgres (docker compose up db)
 * with migrations + seed applied. Mirrors the bootstrap config from main.ts.
 *
 * Seed users (see prisma/seed.ts):
 *   admin@gamer.net.ar / admin1234     (ADMIN)
 *   miembro@gamer.net.ar / miembro1234 (MEMBER)
 */
describe("Auth & RBAC (e2e)", () => {
    let app;
    let prisma;
    const ephemeralEmail = "e2e-nuevo@gamer.net.ar";
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({ imports: [app_module_1.AppModule] }).compile();
        app = moduleRef.createNestApplication();
        app.use((0, cookie_parser_1.default)());
        app.setGlobalPrefix("api");
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
        prisma = app.get(prisma_service_1.PrismaService);
        await app.init();
        await prisma.user.deleteMany({ where: { email: ephemeralEmail } });
    });
    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: ephemeralEmail } });
        await app.close();
    });
    const cookieFrom = (res) => {
        const set = res.headers["set-cookie"];
        return Array.isArray(set) ? set : [set];
    };
    it("GET /api/health responde ok", async () => {
        await (0, supertest_1.default)(app.getHttpServer()).get("/api/health").expect(200);
    });
    it("rechaza el registro con datos inválidos (validación en español)", async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post("/api/auth/register")
            .send({ email: "no-es-email", password: "corta", displayName: "" })
            .expect(400);
        expect(JSON.stringify(res.body)).toContain("email");
    });
    it("registra un usuario nuevo como MEMBER y setea la cookie de sesión", async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post("/api/auth/register")
            .send({ email: ephemeralEmail, password: "password123", displayName: "Nuevo E2E" })
            .expect(201);
        expect(res.body.user.role).toBe("MEMBER");
        expect(res.body.user).not.toHaveProperty("passwordHash");
        expect(cookieFrom(res).join(";")).toContain("access_token=");
    });
    it("rechaza login con credenciales incorrectas", async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .post("/api/auth/login")
            .send({ email: "admin@gamer.net.ar", password: "incorrecta" })
            .expect(401);
    });
    it("GET /api/auth/me sin cookie devuelve 401", async () => {
        await (0, supertest_1.default)(app.getHttpServer()).get("/api/auth/me").expect(401);
    });
    describe("RBAC sobre /api/users", () => {
        const login = async (email, password) => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post("/api/auth/login")
                .send({ email, password })
                .expect(201);
            return cookieFrom(res);
        };
        it("un ADMIN obtiene la lista de usuarios (200)", async () => {
            const cookie = await login("admin@gamer.net.ar", "admin1234");
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get("/api/users")
                .set("Cookie", cookie)
                .expect(200);
            expect(Array.isArray(res.body.users)).toBe(true);
            expect(res.body.users.length).toBeGreaterThan(0);
        });
        it("un MEMBER es rechazado (403)", async () => {
            const cookie = await login("miembro@gamer.net.ar", "miembro1234");
            await (0, supertest_1.default)(app.getHttpServer()).get("/api/users").set("Cookie", cookie).expect(403);
        });
        it("sin sesión es rechazado (401)", async () => {
            await (0, supertest_1.default)(app.getHttpServer()).get("/api/users").expect(401);
        });
    });
});
