import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('📅 Current database time:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();