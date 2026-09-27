import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedGames = [
  { slug: "cs2", name: "Counter-Strike 2", rankVerifiable: true },
  { slug: "lol", name: "League of Legends", rankVerifiable: true },
  { slug: "valorant", name: "Valorant", rankVerifiable: false },
  { slug: "rocket-league", name: "Rocket League", rankVerifiable: false },
];

async function main() {
  for (const g of seedGames) {
    await prisma.game.upsert({
      where: { slug: g.slug },
      update: { name: g.name, rankVerifiable: g.rankVerifiable },
      create: g,
    });
    // eslint-disable-next-line no-console
    console.log(`seeded game: ${g.name}`);
  }

  const seedUsers = [
    { email: "admin", displayName: "Admin GamER", role: Role.ADMIN, password: "admin1234" },
    { email: "editor", displayName: "Editor GamER", role: Role.EDITOR, password: "editor1234" },
    { email: "member", displayName: "Miembro GamER", role: Role.MEMBER, password: "member1234" },
  ];

  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, displayName: u.displayName },
      create: { email: u.email, displayName: u.displayName, role: u.role, passwordHash },
    });
    // eslint-disable-next-line no-console
    console.log(`seeded ${u.role}: ${u.email} / ${u.password}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
