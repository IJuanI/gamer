import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { FileLogger } from "./logger";

async function bootstrap() {
  console.log("Starting GamER Hub API...");
  const app = await NestFactory.create(AppModule, { logger: new FileLogger() });
  console.log("AppModule created");

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix("api");
  app.enableCors({
    // Dev on 3000, Playwright visual runs on 3100. WEB_ORIGIN overrides (e.g. prod).
    origin: process.env.WEB_ORIGIN
      ? process.env.WEB_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:3000", "http://localhost:3100"],
    credentials: true,
  });
  console.log("Middleware configured");

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  console.log(`Listening on port ${port}`);
  await app.listen(port);
  Logger.log(`GamER Hub API escuchando en http://localhost:${port}/api`, "Bootstrap");
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
