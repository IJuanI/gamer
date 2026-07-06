import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Clean slate
  await db.ideaClaim.deleteMany();
  await db.idea.deleteMany();
  await db.membership.deleteMany();
  await db.empresa.deleteMany();
  await db.user.deleteMany();

  const pw = await bcrypt.hash("password123", 10);

  // Users — note "ana" is persona + empresa member + admin all at once.
  const ana = await db.user.create({
    data: { name: "Ana Gómez", email: "ana@polo.test", passwordHash: pw, isAdmin: true },
  });
  const beto = await db.user.create({
    data: { name: "Beto Ruiz", email: "beto@polo.test", passwordHash: pw },
  });
  const caro = await db.user.create({
    data: { name: "Caro Díaz", email: "caro@polo.test", passwordHash: pw },
  });

  const dev = await db.empresa.create({
    data: {
      slug: "devria",
      name: "DevRía",
      tagline: "Software a medida para la región",
      sector: "Software",
      description:
        "Estudio de desarrollo de software con foco en productos web y móviles.",
      website: "https://example.com",
    },
  });
  const data = await db.empresa.create({
    data: {
      slug: "datalitoral",
      name: "Data Litoral",
      tagline: "Datos e IA aplicada",
      sector: "Data / IA",
      description: "Consultora de datos, analítica e inteligencia artificial.",
    },
  });
  const iot = await db.empresa.create({
    data: {
      slug: "rioiot",
      name: "Río IoT",
      tagline: "Hardware conectado",
      sector: "IoT",
      description: "Soluciones de Internet de las Cosas para industria y agro.",
    },
  });

  // Memberships — Ana belongs to TWO empresas; Beto owns one.
  await db.membership.createMany({
    data: [
      { userId: ana.id, empresaId: dev.id, role: "OWNER" },
      { userId: ana.id, empresaId: data.id, role: "MEMBER" },
      { userId: beto.id, empresaId: iot.id, role: "OWNER" },
    ],
  });

  // Ideas posted by personas
  const idea1 = await db.idea.create({
    data: {
      title: "App para gestionar turnos del club de barrio",
      description:
        "Necesitamos una app simple para reservar canchas y pagar online en nuestro club.",
      category: "App móvil",
      budget: "A convenir",
      authorId: caro.id,
    },
  });
  await db.idea.create({
    data: {
      title: "Sensor de humedad para cultivos",
      description:
        "Busco quien desarrolle un sensor económico y un panel para monitorear humedad del suelo.",
      category: "IoT",
      authorId: caro.id,
    },
  });

  // A claim — DevRía (via Ana) picks up idea1
  await db.ideaClaim.create({
    data: {
      ideaId: idea1.id,
      empresaId: dev.id,
      actorId: ana.id,
      message: "Nos interesa, tenemos experiencia en apps de reservas.",
    },
  });
  await db.idea.update({ where: { id: idea1.id }, data: { status: "CLAIMED" } });

  console.log("Seed listo. Login de prueba:");
  console.log("  admin/empresa/persona → ana@polo.test  / password123");
  console.log("  empresa                → beto@polo.test / password123");
  console.log("  persona                → caro@polo.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
