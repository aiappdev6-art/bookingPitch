import { PrismaClient, Surface } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: "ADMIN" },
    create: { email, password: hashed, role: "ADMIN", name: "Admin" },
  });
  console.log("Admin:", admin.email);

  const samplePitches = [
    {
      name: "Pitch Al-Salam",
      description: "Outdoor grass pitch with floodlights",
      imageUrls: [
        "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200",
      ],
      pricePerHour: "12.000",
      capacity: 12,
      surface: Surface.GRASS,
      location: "Salmiya",
    },
    {
      name: "Pitch Al-Jahra Indoor",
      description: "Indoor 5-a-side covered arena",
      imageUrls: [
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200",
      ],
      pricePerHour: "10.000",
      capacity: 10,
      surface: Surface.INDOOR,
      location: "Jahra",
    },
    {
      name: "Pitch Al-Kuwait Turf",
      description: "Premium turf with FIFA-grade markings",
      imageUrls: [
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200",
      ],
      pricePerHour: "15.000",
      capacity: 14,
      surface: Surface.TURF,
      location: "Kuwait City",
    },
  ];

  for (const p of samplePitches) {
    const existing = await prisma.pitch.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.pitch.create({ data: p });
      console.log("Seeded pitch:", p.name);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
