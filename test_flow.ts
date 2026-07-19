import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== STARTING A-Z END-TO-END TEST ===");
  
  try {
    // 1. Setup New Camp (Organization & Campaign & Staff)
    const institution = "TEST-HOSPITAL-" + Date.now();
    const campCode = "TESTCAMP-" + Math.floor(Math.random() * 1000);
    console.log(`[1] Creating Organization: ${institution}`);
    
    let org = await prisma.organization.create({
      data: { name: institution }
    });

    console.log(`[2] Creating Campaign: ${campCode}`);
    const campaign = await prisma.campaign.create({
      data: {
        organizationId: org.id,
        campCode: campCode,
        organizingInstitution: "Test Org",
        chiefOrganizer: "Test Organizer",
        department: "General Testing",
        date: new Date(),
        status: "ACTIVE"
      }
    });

    console.log(`[3] Provisioning Test Staff for Campaign`);
    const passwordHash = "mockhash";
    const doctor = await prisma.staff.create({
      data: {
        name: "Dr. Test",
        designation: "Chief Tester",
        staffId: `DOC-${campCode}`,
        password: passwordHash,
        role: "DOCTOR",
        organizationId: org.id
      }
    });

    // 2. Patient Registration
    console.log(`[4] Registering Patient`);
    const patientPhone = "9998887776";
    const patient = await prisma.patient.create({
      data: {
        campaignId: campaign.id,
        name: "Test Patient",
        age: 30,
        gender: "Male",
        phone: patientPhone,
        tokenNumber: 101,
        status: "REGISTERED",
      }
    });
    console.log(`    -> Registered Patient with Token #${patient.tokenNumber}`);

    // Verify Nurse Queue Isolation
    const nurseQueue = await prisma.patient.findMany({
      where: { status: "REGISTERED", campaign: { campCode } }
    });
    if (nurseQueue.length !== 1 || nurseQueue[0].id !== patient.id) {
      throw new Error("Nurse Queue Isolation Failed!");
    }
    console.log(`    -> Nurse Queue Verification Passed.`);

    // 3. Triage & Vitals
    console.log(`[5] Recording Vitals (Nurse)`);
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        height: 180,
        weight: 75,
        bloodPressure: "120/80",
        pulse: 72,
        status: "DOCTOR",
      }
    });

    // Verify Doctor Queue Isolation
    const doctorQueue = await prisma.patient.findMany({
      where: { status: "DOCTOR", campaign: { campCode } }
    });
    if (doctorQueue.length !== 1 || doctorQueue[0].id !== patient.id) {
      throw new Error("Doctor Queue Isolation Failed!");
    }
    console.log(`    -> Doctor Queue Verification Passed.`);

    // 4. Doctor Consultation
    console.log(`[6] Doctor Consultation & Prescription`);
    const prescriptions = JSON.stringify([{ name: "Test Medicine", dosage: "1-0-1", days: "5" }]);
    await prisma.$transaction([
      prisma.consultation.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          doctorName: "Dr. Test",
          symptoms: "Test Symptoms",
          diagnosis: "Test Diagnosis",
          prescriptions: prescriptions,
        }
      }),
      prisma.patient.update({
        where: { id: patient.id },
        data: { status: "PHARMACY" }
      })
    ]);

    // Verify Pharmacy Queue Isolation
    const pharmacyQueue = await prisma.patient.findMany({
      where: { status: "PHARMACY", campaign: { campCode } }
    });
    if (pharmacyQueue.length !== 1 || pharmacyQueue[0].id !== patient.id) {
      throw new Error("Pharmacy Queue Isolation Failed!");
    }
    console.log(`    -> Pharmacy Queue Verification Passed.`);

    // 5. Pharmacy Dispensation
    console.log(`[7] Dispensing Medicine (Pharmacy)`);
    await prisma.patient.update({
      where: { id: patient.id },
      data: { status: "COMPLETED" }
    });

    // 6. Report Retrieval
    console.log(`[8] Simulating Report Retrieval`);
    const historicalReport = await prisma.patient.findFirst({
      where: {
        phone: patientPhone,
        tokenNumber: 101,
        campaign: { campCode }
      },
      include: {
        campaign: true,
        consultations: true
      }
    });

    if (!historicalReport || historicalReport.status !== "COMPLETED") {
      throw new Error("Report Retrieval Failed!");
    }
    
    console.log(`    -> Report Retrieved Successfully!`);
    console.log(`    -> Diagnosis: ${historicalReport.consultations[0].diagnosis}`);
    console.log(`    -> Prescriptions: ${historicalReport.consultations[0].prescriptions}`);

    console.log("=== ALL TESTS PASSED SUCCESSFULLY ===");

  } catch (error) {
    console.error("TEST FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
