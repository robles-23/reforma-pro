import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function recreateBudgetTables() {
  try {
    console.log('Starting budget and electronic invoice tables recreation...');

    // Step 1: Drop existing tables (if any)
    console.log('Dropping existing tables...');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "budgets" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "electronic_invoices" CASCADE;');
    console.log('✓ Tables dropped successfully');

    // Step 2: Read and execute the migration SQL
    const migrationPath = path.join(
      __dirname,
      '..',
      'prisma',
      'migrations',
      '20251105143500_add_budget_and_electronic_invoice_with_images',
      'migration.sql'
    );

    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }

    console.log('✓ Migration executed successfully');

    // Step 3: Verify tables exist
    console.log('Verifying tables...');
    const budgetsCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'budgets'
    `;
    const invoicesCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'electronic_invoices'
    `;

    console.log('Budgets table exists:', budgetsCount);
    console.log('Electronic invoices table exists:', invoicesCount);

    console.log('\n✅ Tables recreated successfully!');
  } catch (error) {
    console.error('❌ Error recreating tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recreateBudgetTables()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
