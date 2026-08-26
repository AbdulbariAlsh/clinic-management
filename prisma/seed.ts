import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@clinic.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin user seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
