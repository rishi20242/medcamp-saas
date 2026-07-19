import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Initiating database wipe...');
  
  try {
    // Delete in order to respect foreign key constraints
    await prisma.consultation.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.organization.deleteMany();
    
    console.log('✅ Successfully wiped all data from the database.');
  } catch (error) {
    console.error('❌ Failed to wipe database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
