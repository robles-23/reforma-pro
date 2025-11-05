import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@reforma-pro.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const companyName = process.env.COMPANY_NAME || 'Abu24';

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`✅ Admin user already exists: ${email}`);
      process.exit(0);
    }

    // Find or create company
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let company = await prisma.company.findUnique({
      where: { slug },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          slug: slug,
        },
      });
      console.log(`✅ Company created: ${companyName}`);
    } else {
      console.log(`✅ Using existing company: ${companyName}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('==================================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Company: ${companyName}`);
    console.log('==================================');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
