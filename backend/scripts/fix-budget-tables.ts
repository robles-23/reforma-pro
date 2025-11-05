import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTables() {
  try {
    console.log('🔧 Dropping old budget and electronic_invoice tables...');

    // Drop old tables if they exist
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "budgets" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "electronic_invoices" CASCADE;');

    console.log('✅ Old tables dropped successfully');
    console.log('');
    console.log('⚠️  Now run: npx prisma migrate deploy');
    console.log('This will recreate the tables with the correct schema.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixTables();
