import { Logger } from "@nestjs/common";

async function bootstrap() {
  console.log("GamER Hub API");
  console.log("==============");
  console.log("For local development, use: wrangler dev");
  console.log("For production, deploy with: terraform apply");
  Logger.log("Use wrangler dev for local development", "Bootstrap");
}

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
