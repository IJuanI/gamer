import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { FileLogger } from "./logger";
import { HttpExceptionFilter } from "./common/http-exception.filter";
import { CloudLoggingService } from "./logging/cloud-logging.service";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { validateEnvironment } from "./common/environment.validator";

async function bootstrap() {
  try {
    validateEnvironment();
  } catch (error) {
    console.error("Environment validation failed:", error);
    process.exit(1);
  }

  console.log("Starting GamER Hub API...");
  const app = await NestFactory.create(AppModule, { logger: new FileLogger() });
  console.log("AppModule created");

  const cloudLogging = app.get(CloudLoggingService);
  app.useGlobalFilters(new HttpExceptionFilter(cloudLogging));

  // Rate limiting: stricter for telemetry endpoints
  const telemetryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 errors per minute per IP
    message: "Too many error reports, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(generalLimiter);
  app.use("/api/telemetry", telemetryLimiter);

  app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));
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
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🎮 GamER Hub API");
  console.log(`  Environment: ${nodeEnv.toUpperCase()}`);
  console.log(`  Port: ${port}`);
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    console.log(`  Cloud Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  }
  console.log("  Features:");
  console.log(`    ✓ Firestore Database`);
  console.log(`    ✓ Google Cloud Logging`);
  console.log(`    ✓ JWT Authentication`);
  if (process.env.DISCORD_CLIENT_ID) console.log(`    ✓ Discord OAuth`);
  if (process.env.GOOGLE_CLIENT_ID) console.log(`    ✓ Google OAuth`);
  if (process.env.FACEIT_CLIENT_ID) console.log(`    ✓ FACEIT Integration`);
  if (process.env.RIOT_CLIENT_ID) console.log(`    ✓ Riot Games Integration`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const config = new DocumentBuilder()
    .setTitle("GamER Hub API")
    .setDescription("API documentation for GamER Hub - Entre Ríos Gamers")
    .setVersion("1.0.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access_token"
    )
    .addCookieAuth("access_token", {
      type: "apiKey",
      in: "cookie",
      description: "JWT token in cookie",
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 1,
    },
  });

  const server = await app.listen(port);
  Logger.log(`GamER Hub API escuchando en http://localhost:${port}/api`, "Bootstrap");
  Logger.log(`Swagger docs disponibles en http://localhost:${port}/docs`, "Bootstrap");

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    Logger.log(`${signal} received, shutting down gracefully...`, "Bootstrap");
    await app.close();
    server.close(() => {
      Logger.log("Server closed", "Bootstrap");
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      Logger.error("Forced shutdown after 10 seconds", "Bootstrap");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason, promise) => {
    Logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`, "Bootstrap");
  });
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
