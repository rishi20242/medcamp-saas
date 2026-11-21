const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' }
  });

  if (!campaign) {
    console.log("No active campaign found. Please create one first.");
    return;
  }

  const patient = await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      name: "John Doe",
      tokenNumber: Math.floor(Math.random() * 1000) + 1,
      age: 45,
      gender: "Male",
      phone: "9999999999",
      height: 175,
      weight: 70,
      bloodPressure: "120/80",
      pulse: 72,
      bloodGroup: "O+",
      allergies: "None",
      status: "COMPLETED",
      consultations: {
        create: {
          doctorId: (await prisma.staff.findFirst({ where: { role: 'DOCTOR' } }))?.id || "unknown",
          doctorName: "Dr. Smith",
          diagnosis: "Common Cold",
          clinicalNotes: "Patient has mild fever and sore throat. Recommended rest.",
          prescription: JSON.stringify([
            { medicine: "Paracetamol 500mg", dosage: "1-1-1", duration: 3, form: "tablet" },
            { medicine: "Cough Syrup", dosage: "10", duration: 5, form: "liquid" }
          ])
        }
      }
    }
  });

  console.log(`\n========================================`);
  console.log(`✅ FAKE PATIENT GENERATED FOR TESTING`);
  console.log(`========================================`);
  console.log(`Patient Name: ${patient.name}`);
  console.log(`Token Number: ${patient.tokenNumber}`);
  console.log(`Phone Number: ${patient.phone}`);
  console.log(`Status: ${patient.status}`);
  console.log(`\nYou can now go to /report and enter Token: ${patient.tokenNumber} to view the report!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
