import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaNeon({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const cafes = [
  {
    id: "1",
    slug: "cafe-heidelberg",
    name: "کافه هایدلبرگ",
    manager: "علی احمدی",
    phone: "09120000001",
    region: "پاسداران",
    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Classic",
      grinderBrand: "مازر",
      grinderModel: "Super Jolly",
    },
    coffeeLines: [
      {
        id: "line-101",
        name: "لاین ۱۰۱",
      },
      {
        id: "ethiopia",
        name: "اتیوپیا",
      },
    ],
  },

  {
    id: "2",
    slug: "cafe-x",
    name: "کافه ایکس",
    manager: "سارا محمدی",
    phone: "09120000002",
    region: "تجریش",
    equipment: {
      espressoMachineBrand: "نووا سیمونلی",
      espressoMachineModel: "Appia",
      grinderBrand: "مازر",
      grinderModel: "Mini",
    },
    coffeeLines: [
      {
        id: "line-102",
        name: "لاین ۱۰۲",
      },
    ],
  },

  {
    id: "3",
    slug: "cafe-y",
    name: "کافه وای",
    manager: "رضا کریمی",
    phone: "09120000003",
    region: "ونک",
    equipment: {
      espressoMachineBrand: "لا مارزوکو",
      espressoMachineModel: "Linea Mini",
      grinderBrand: "اورکا",
      grinderModel: "Atom",
    },
    coffeeLines: [
      {
        id: "line-101-y",
        name: "لاین ۱۰۱",
      },
      {
        id: "line-102-y",
        name: "لاین ۱۰۲",
      },
      {
        id: "ethiopia-y",
        name: "اتیوپیا",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  for (const cafe of cafes) {
    await prisma.cafe.upsert({
      where: {
        slug: cafe.slug,
      },

      update: {
        name: cafe.name,
        manager: cafe.manager,
        phone: cafe.phone,
        region: cafe.region,

        equipment: {
          upsert: {
            create: cafe.equipment,

            update: cafe.equipment,
          },
        },

        coffeeLines: {
          deleteMany: {},

          create: cafe.coffeeLines.map((line) => ({
            name: line.name,
          })),
        },
      },

      create: {
        name: cafe.name,
        slug: cafe.slug,
        manager: cafe.manager,
        phone: cafe.phone,
        region: cafe.region,

        equipment: {
          create: cafe.equipment,
        },

        coffeeLines: {
          create: cafe.coffeeLines.map((line) => ({
            name: line.name,
          })),
        },
      },
    });

    console.log(`✅ Seeded: ${cafe.name}`);
  }

  console.log("🌱 Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
