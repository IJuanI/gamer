import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import * as bcrypt from "bcryptjs";

// This script seeds the D1 database. Usage: Pass DB binding via environment.
// For local testing: npx tsx seed-d1.ts (requires D1 to be bound)

const seedUsers = [
  { email: "admin@local", displayName: "Admin GamER", role: "ADMIN", password: "admin1234" },
  { email: "editor@local", displayName: "Editor GamER", role: "EDITOR", password: "editor1234" },
  { email: "member@local", displayName: "Miembro GamER", role: "MEMBER", password: "member1234" },
];

async function main() {
  // For local D1 testing, you'd need a D1 database binding passed in.
  // This is primarily meant to be run via a Cloudflare Worker context.
  console.log("Note: This seed script is designed for Cloudflare Worker context.");
  console.log("To seed the production D1 database, use wrangler tail or create a worker endpoint.");

  // For now, just output the SQL commands to insert:
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    console.log(`\n-- Insert user: ${u.email}`);
    console.log(`INSERT OR REPLACE INTO users (id, email, displayName, passwordHash, role, createdAt, updatedAt) VALUES`);
    console.log(`  ('${generateId()}', '${u.email}', '${u.displayName}', '${passwordHash.replace(/'/g, "''")}', '${u.role}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`);
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

main().catch(console.error);
