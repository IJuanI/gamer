import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get nodeEnv(): string {
    return this.config.get("NODE_ENV", "development");
  }

  get isProduction(): boolean {
    return this.nodeEnv === "production";
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === "development";
  }

  get port(): number {
    return Number(this.config.get("PORT") || this.config.get("API_PORT") || 4000);
  }

  get firebaseProjectId(): string {
    return this.config.getOrThrow("FIREBASE_PROJECT_ID");
  }

  get jwtSecret(): string {
    return this.config.get("JWT_SECRET", "dev-only-change-me-please-32chars-min");
  }

  get webOrigin(): string | undefined {
    return this.config.get("WEB_ORIGIN");
  }

  get googleCloudProject(): string | undefined {
    return this.config.get("GOOGLE_CLOUD_PROJECT");
  }

  get discordOAuthConfigured(): boolean {
    return (
      Boolean(this.config.get("DISCORD_CLIENT_ID")) &&
      Boolean(this.config.get("DISCORD_CLIENT_SECRET"))
    );
  }

  get googleOAuthConfigured(): boolean {
    return (
      Boolean(this.config.get("GOOGLE_CLIENT_ID")) &&
      Boolean(this.config.get("GOOGLE_CLIENT_SECRET"))
    );
  }

  get faceitOAuthConfigured(): boolean {
    return (
      Boolean(this.config.get("FACEIT_CLIENT_ID")) &&
      Boolean(this.config.get("FACEIT_CLIENT_SECRET")) &&
      Boolean(this.config.get("FACEIT_API_KEY"))
    );
  }

  get riotOAuthConfigured(): boolean {
    return (
      Boolean(this.config.get("RIOT_CLIENT_ID")) &&
      Boolean(this.config.get("RIOT_CLIENT_SECRET")) &&
      Boolean(this.config.get("RIOT_API_KEY"))
    );
  }
}
