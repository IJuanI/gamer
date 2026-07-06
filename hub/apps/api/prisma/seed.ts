import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const seedUsers = [
    { email: "admin@gamer.net.ar", displayName: "Admin GamER", role: Role.ADMIN, password: "admin1234" },
    { email: "editor@gamer.net.ar", displayName: "Editor GamER", role: Role.EDITOR, password: "editor1234" },
    { email: "miembro@gamer.net.ar", displayName: "Miembro GamER", role: Role.MEMBER, password: "miembro1234" },
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
