import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as bcrypt from "bcrypt";

const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;

async function main() {
  // Connect to Firestore (either emulator or production)
  const app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gamer-hub-dev",
  });

  const db = getFirestore(app);

  if (FIRESTORE_EMULATOR_HOST) {
    console.log(`✓ Connected to Firestore Emulator at ${FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log(`✓ Connected to Firestore (production)`);
  }

  // Seed games
  const games = [
    { slug: "cs2", name: "Counter-Strike 2", rankVerifiable: true },
    { slug: "lol", name: "League of Legends", rankVerifiable: true },
    { slug: "valorant", name: "Valorant", rankVerifiable: false },
    { slug: "rocket-league", name: "Rocket League", rankVerifiable: false },
  ];

  console.log("\n📝 Seeding games...");
  for (const game of games) {
    await db.collection("games").doc(game.slug).set({
      slug: game.slug,
      name: game.name,
      rankVerifiable: game.rankVerifiable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ seeded game: ${game.name}`);
  }

  // Seed users
  const users = [
    {
      email: "admin@local",
      displayName: "Admin GamER",
      role: "ADMIN",
      password: "admin1234",
    },
    {
      email: "editor@local",
      displayName: "Editor GamER",
      role: "EDITOR",
      password: "editor1234",
    },
    {
      email: "member@local",
      displayName: "Miembro GamER",
      role: "MEMBER",
      password: "member1234",
    },
  ];

  console.log("\n👤 Seeding users...");
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const docRef = db.collection("users").doc();
    await docRef.set({
      id: docRef.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      passwordHash,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ seeded ${user.role}: ${user.email} / ${user.password}`);
  }

  console.log("\n✨ Seeding complete!\n");

  await app.delete();
  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
