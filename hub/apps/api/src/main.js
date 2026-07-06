"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const logger_1 = require("./logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: new logger_1.FileLogger() });
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix("api");
    app.enableCors({
        // Dev on 3000, Playwright visual runs on 3100. WEB_ORIGIN overrides (e.g. prod).
        origin: process.env.WEB_ORIGIN
            ? process.env.WEB_ORIGIN.split(",").map((o) => o.trim())
            : ["http://localhost:3000", "http://localhost:3100"],
        credentials: true,
    });
    const port = Number(process.env.API_PORT ?? 4000);
    await app.listen(port);
    common_1.Logger.log(`GamER Hub API escuchando en http://localhost:${port}/api`, "Bootstrap");
}
void bootstrap();
