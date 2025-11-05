import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo company
  const demoCompany = await prisma.company.upsert({
    where: { slug: 'demo-construction' },
    update: {},
    create: {
      name: 'Demo Construction',
      slug: 'demo-construction',
      logoUrl: null,
      brandColors: {
        primary: '#6B7F39',
        secondary: '#8FA84E',
        accent: '#B8C59A',
        background: '#F8FAF5',
        text: '#2D3319',
      },
      settings: {
        language: 'es',
        theme: 'light',
        timezone: 'Europe/Madrid',
      },
    },
  });

  console.log('✅ Created demo company:', demoCompany.name);

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const workerPassword = await bcrypt.hash('worker123', 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      companyId: demoCompany.id,
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create worker user
  const workerUser = await prisma.user.upsert({
    where: { email: 'worker@demo.com' },
    update: {},
    create: {
      email: 'worker@demo.com',
      passwordHash: workerPassword,
      name: 'Worker User',
      role: 'WORKER',
      companyId: demoCompany.id,
      isActive: true,
    },
  });

  console.log('✅ Created worker user:', workerUser.email);

  // Create sample project
  const sampleProject = await prisma.project.create({
    data: {
      title: 'Renovación Completa de Cocina',
      descriptionOriginal: 'Cambiamos todo, muebles nuevos, piso nuevo, pintura',
      location: 'Madrid, España',
      clientName: 'Cliente Demo',
      status: 'DRAFT',
      companyId: demoCompany.id,
      createdByUserId: workerUser.id,
      metadata: {
        estimatedDuration: '2 weeks',
        budget: '15000',
      },
    },
  });

  console.log('✅ Created sample project:', sampleProject.title);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nDemo Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:  admin@demo.com / admin123');
  console.log('Worker: worker@demo.com / worker123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
