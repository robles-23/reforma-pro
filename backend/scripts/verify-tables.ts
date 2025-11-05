import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTables() {
  try {
    console.log('Verifying budgets table structure...');
    const budgetsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'budgets'
      ORDER BY ordinal_position
    `;
    console.log('Budgets columns:', budgetsColumns);

    console.log('\nVerifying electronic_invoices table structure...');
    const invoicesColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'electronic_invoices'
      ORDER BY ordinal_position
    `;
    console.log('Electronic invoices columns:', invoicesColumns);

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
