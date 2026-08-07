import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Creamos un "Pool" de conexiones usando tu URL de Neon
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Le pasamos el pool al adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos el cliente usando el adaptador
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = ['Principiantes', 'Scaled', 'Advance', 'RX'];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Categorías creadas exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });