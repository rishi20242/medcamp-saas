import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting initialization of turnkey Demo Camp (DEMO-2026)...");

  // 1. Ensure Organization exists
  const orgName = "Apollo Outreach Healthcare";
  let org = await prisma.organization.findFirst({
    where: { name: orgName },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: { name: orgName },
    });
    console.log(`✅ Created organization: ${org.name} (${org.id})`);
  } else {
    console.log(`ℹ️ Found existing organization: ${org.name}`);
  }

  // 2. Camp Details
  const campCode = "DEMO-2026";
  const campaign = await prisma.campaign.upsert({
    where: { campCode },
    update: {
      name: "Apollo Medical Outreach 2026",
      organizationId: org.id,
      organizingInstitution: orgName,
      chiefOrganizer: "Dr. Sarah Mitchell, Chief Medical Officer",
      department: "General Medicine",
      status: "ACTIVE",
      date: new Date(),
    },
    create: {
      campCode,
      name: "Apollo Medical Outreach 2026",
      organizationId: org.id,
      organizingInstitution: orgName,
      chiefOrganizer: "Dr. Sarah Mitchell, Chief Medical Officer",
      department: "General Medicine",
      status: "ACTIVE",
      date: new Date(),
    },
  });
  console.log(`✅ Camp initialized: ${campaign.campCode} (Status: ${campaign.status})`);

  // 3. Setup Staff with Universal Password: MedCamp@2026
  const passwordHash = await bcrypt.hash("MedCamp@2026", 10);

  const staffMembers = [
    {
      staffId: "DOC01",
      name: "Dr. Rajesh Sharma",
      role: "DOCTOR",
      designation: "General Physician",
    },
    {
      staffId: "DOC02",
      name: "Dr. Ananya Sen",
      role: "DOCTOR",
      designation: "Consultant Cardiologist",
    },
    {
      staffId: "NUR01",
      name: "Nurse Priya Nair",
      role: "NURSE",
      designation: "Head Triage Nurse",
    },
    {
      staffId: "PHA01",
      name: "Amit Roy",
      role: "PHARMACIST",
      designation: "Lead Pharmacist",
    },
  ];

  const createdStaffMap: Record<string, string> = {};

  for (const s of staffMembers) {
    const staff = await prisma.staff.upsert({
      where: {
        deploymentId_staffId: {
          deploymentId: campCode,
          staffId: s.staffId,
        },
      },
      update: {
        name: s.name,
        role: s.role,
        designation: s.designation,
        password: passwordHash,
        organizationId: org.id,
      },
      create: {
        deploymentId: campCode,
        staffId: s.staffId,
        name: s.name,
        role: s.role,
        designation: s.designation,
        password: passwordHash,
        organizationId: org.id,
      },
    });
    createdStaffMap[s.staffId] = staff.id;
    console.log(`✅ Staff member configured: ${s.staffId} (${s.name} - ${s.role})`);
  }

  // 4. Reset & populate demo patients for DEMO-2026
  // Delete existing patients under this camp so queues are clean and consistent
  const existingPatients = await prisma.patient.findMany({
    where: { campaignId: campaign.id },
    select: { id: true },
  });
  
  if (existingPatients.length > 0) {
    const patientIds = existingPatients.map((p) => p.id);
    await prisma.consultation.deleteMany({
      where: { patientId: { in: patientIds } },
    });
    await prisma.patient.deleteMany({
      where: { campaignId: campaign.id },
    });
    console.log(`🧹 Cleaned ${existingPatients.length} previous demo patients.`);
  }

  // Patient 100: COMPLETED (Sample Report Ready)
  const patient100 = await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 100,
      name: "Vikram Malhotra",
      age: 45,
      gender: "Male",
      phone: "9988776655",
      bloodGroup: "O+",
      height: 175,
      weight: 74,
      bloodPressure: "125/82",
      pulse: 74,
      status: "COMPLETED",
      triageNurseId: createdStaffMap["NUR01"],
      allergies: "None reported",
      pastSurgeries: "Appendectomy (2018)",
      currentMedications: "None",
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient100.id,
      doctorId: createdStaffMap["DOC01"],
      doctorName: "Dr. Rajesh Sharma",
      symptoms: "Patient presented with mild recurrent tension headaches and work fatigue. No history of cardiovascular distress.",
      diagnosis: "Tension-type Headache & Mild Physical Fatigue",
      prescriptions: JSON.stringify([
        { name: "Paracetamol 650mg", medicine: "Paracetamol 650mg", dosage: "1-0-1 (After Food)", days: 3 },
        { name: "Cetirizine 10mg", medicine: "Cetirizine 10mg", dosage: "0-0-1 (Night)", days: 5 },
        { name: "Multivitamin + Zinc Complex", medicine: "Multivitamin + Zinc Complex", dosage: "1-0-0 (Morning)", days: 15 },
      ]),
    },
  });
  console.log(`✅ [Token #100] Vikram Malhotra - COMPLETED (Sample Report ID: ${patient100.id})`);

  // Patient 101: PHARMACY (Ready in Pharmacy queue for dispensing demo)
  const patient101 = await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 101,
      name: "Anita Desai",
      age: 48,
      gender: "Female",
      phone: "9876543214",
      bloodGroup: "B+",
      height: 160,
      weight: 63,
      bloodPressure: "130/85",
      pulse: 78,
      status: "PHARMACY",
      triageNurseId: createdStaffMap["NUR01"],
      allergies: "Sulfa antibiotics",
      pastSurgeries: "None",
      currentMedications: "Thyroxine 50mcg",
    },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient101.id,
      doctorId: createdStaffMap["DOC01"],
      doctorName: "Dr. Rajesh Sharma",
      symptoms: "Persistent dry cough, mild throat irritation for 4 days, fatigue.",
      diagnosis: "Acute Bronchial Irritation / Pharyngitis",
      prescriptions: JSON.stringify([
        { name: "Amoxicillin 500mg", medicine: "Amoxicillin 500mg", dosage: "1-0-1 (After Food)", days: 5 },
        { name: "Dextromethorphan Cough Syrup", medicine: "Dextromethorphan Cough Syrup", dosage: "10ml - Bedtime", days: 5 },
        { name: "Vitamin C 500mg Chewable", medicine: "Vitamin C 500mg Chewable", dosage: "1-0-0 (Morning)", days: 10 },
      ]),
    },
  });
  console.log(`✅ [Token #101] Anita Desai - In PHARMACY queue`);

  // Patient 102: DOCTOR (Ready in Doctor queue with vitals triaged)
  await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 102,
      name: "Kavita Reddy",
      age: 29,
      gender: "Female",
      phone: "9876543212",
      bloodGroup: "A+",
      height: 165,
      weight: 58,
      bloodPressure: "118/76",
      pulse: 72,
      status: "DOCTOR",
      triageNurseId: createdStaffMap["NUR01"],
      allergies: "Penicillin (Hives)",
      pastSurgeries: "None",
      currentMedications: "Iron supplements",
    },
  });
  console.log(`✅ [Token #102] Kavita Reddy - In DOCTOR queue`);

  // Patient 103: DOCTOR (Ready in Doctor queue with vitals triaged)
  await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 103,
      name: "Mohammad Tariq",
      age: 55,
      gender: "Male",
      phone: "9876543213",
      bloodGroup: "AB+",
      height: 172,
      weight: 80,
      bloodPressure: "142/90",
      pulse: 82,
      status: "DOCTOR",
      triageNurseId: createdStaffMap["NUR01"],
      allergies: "None",
      pastSurgeries: "None",
      currentMedications: "Metformin 500mg",
    },
  });
  console.log(`✅ [Token #103] Mohammad Tariq - In DOCTOR queue`);

  // Patient 104: REGISTERED (Ready in Nurse queue for triage demo)
  await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 104,
      name: "Ravi Kumar",
      age: 42,
      gender: "Male",
      phone: "9876543210",
      bloodGroup: "O+",
      status: "REGISTERED",
      allergies: "None reported",
    },
  });
  console.log(`✅ [Token #104] Ravi Kumar - In NURSE queue`);

  // Patient 105: REGISTERED (Ready in Nurse queue for triage demo)
  await prisma.patient.create({
    data: {
      campaignId: campaign.id,
      tokenNumber: 105,
      name: "Sunita Devi",
      age: 36,
      gender: "Female",
      phone: "9876543211",
      bloodGroup: "B+",
      status: "REGISTERED",
      allergies: "None",
    },
  });
  console.log(`✅ [Token #105] Sunita Devi - In NURSE queue`);

  console.log("\n=======================================================");
  console.log("🎉 ALL STATIONS AND QUEUES INITIALIZED SUCCESSFULLY!");
  console.log(`Camp Code:           ${campCode}`);
  console.log(`Password (All Staff):MedCamp@2026`);
  console.log(`Sample Report URL:   http://localhost:3000/${campCode}/camp/report/${patient100.id}`);
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
