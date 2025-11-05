import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Create Prisma client with logging
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'pretty',
});

// Handle connection errors
prisma.$connect().catch((error) => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
