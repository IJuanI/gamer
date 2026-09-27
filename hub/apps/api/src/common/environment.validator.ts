export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  firebaseProjectId: string;
  jwtSecret: string;
  webOrigin?: string;
  googleCloudProject?: string;
  discordClientId?: string;
  discordClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  faceitClientId?: string;
  faceitClientSecret?: string;
  faceitApiKey?: string;
  riotClientId?: string;
  riotClientSecret?: string;
  riotApiKey?: string;
}

export function validateEnvironment(): EnvironmentConfig {
  const required = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`[Environment] Missing required variables: ${missing.join(", ")}`);
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const warnings = [];

  if (!process.env.GOOGLE_CLOUD_PROJECT && process.env.NODE_ENV === "production") {
    warnings.push("GOOGLE_CLOUD_PROJECT not set - Cloud Logging may not work");
  }

  if (!process.env.WEB_ORIGIN && process.env.NODE_ENV === "production") {
    warnings.push("WEB_ORIGIN not set - CORS may be misconfigured");
  }

  if (warnings.length > 0) {
    console.warn(`[Environment] Warnings:\n${warnings.map((w) => `  - ${w}`).join("\n")}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || process.env.API_PORT || 4000),
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID!,
    jwtSecret: process.env.JWT_SECRET!,
    webOrigin: process.env.WEB_ORIGIN,
    googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    faceitClientId: process.env.FACEIT_CLIENT_ID,
    faceitClientSecret: process.env.FACEIT_CLIENT_SECRET,
    faceitApiKey: process.env.FACEIT_API_KEY,
    riotClientId: process.env.RIOT_CLIENT_ID,
    riotClientSecret: process.env.RIOT_CLIENT_SECRET,
    riotApiKey: process.env.RIOT_API_KEY,
  };
}
