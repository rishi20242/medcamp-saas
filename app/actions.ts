"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// --- AUTH & STAFF MANAGEMENT ---

export async function seedStaffAccounts() {
  const existing = await prisma.staff.count();
  if (existing > 0) return;

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.staff.createMany({
    data: [
      { name: "Dr. Rishi MBBS", designation: "Chief Pediatrician", staffId: "DOC01", password: passwordHash, role: "DOCTOR" },
      { name: "Nurse Joy", designation: "Head Triage Nurse", staffId: "NUR01", password: passwordHash, role: "NURSE" },
      { name: "Pharm. Alice", designation: "Lead Pharmacist", staffId: "PHA01", password: passwordHash, role: "PHARMACIST" },
    ]
  });
}

export async function loginAction(staffId: string, password: string) {
  await seedStaffAccounts(); // Ensure demo accounts exist

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }
  const staff = await prisma.staff.findUnique({ where: { staffId } });
  if (!staff) return { success: false, error: "Invalid credentials." };
  
  const isValid = await bcrypt.compare(password, staff.password);
  if (!isValid) return { success: false, error: "Invalid credentials." };

  cookies().set("staffId", staff.id, { httpOnly: true, path: "/" });
  return { success: true, role: staff.role };
}

export async function logoutAction() {
  cookies().delete("staffId");
  return { success: true };
}

export async function getSessionStaff() {
  const staffId = cookies().get("staffId")?.value;
  if (!staffId) return null;
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  return staff;
}

// --- CAMPAIGN MANAGEMENT ---

export async function getActiveCampaignAction() {
  return await prisma.campaign.findFirst({
    where: { status: "ACTIVE" },
  });
}

export async function initializeCampAction(formData: FormData) {
  const institution = formData.get("organizingInstitution") as string;
  const organizer = formData.get("chiefOrganizer") as string;
  const department = formData.get("department") as string;
  const staffDataStr = formData.get("staffData") as string;

  let org = await prisma.organization.findFirst({
    where: { name: institution }
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: institution },
    });
  }

  // Handle staff creation
  if (staffDataStr) {
    const staffList = JSON.parse(staffDataStr);
    for (const staff of staffList) {
      // Create or update to ensure unique staffIds
      const passwordHash = await bcrypt.hash(staff.password, 10);
      await prisma.staff.upsert({
        where: { staffId: staff.staffId },
        update: {
          name: staff.name,
          designation: staff.designation,
          password: passwordHash,
          role: staff.role,
          organizationId: org.id
        },
        create: {
          name: staff.name,
          designation: staff.designation,
          staffId: staff.staffId,
          password: passwordHash,
          role: staff.role,
          organizationId: org.id
        }
      });
    }
  }

  // Mark any existing campaigns as COMPLETED
  await prisma.campaign.updateMany({
    where: { status: "ACTIVE" },
    data: { status: "COMPLETED" }
  });

  const baseCode = institution.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "CAMP";
  const uniqueId = Math.random().toString(36).substring(2, 5).toUpperCase();
  const generatedCampCode = `${baseCode}-${new Date().getFullYear()}-${uniqueId}`;

  const newCamp = await prisma.campaign.create({
    data: {
      organizationId: org.id,
      organizingInstitution: institution,
      chiefOrganizer: organizer,
      campCode: generatedCampCode,
      department: department,
      date: new Date(),
      status: "ACTIVE",
    },
  });

  revalidatePath("/");
  return newCamp;
}



export async function getOrganizationOverviewAction(campCode?: string) {
  if (campCode) {
    const camp = await prisma.campaign.findFirst({ where: { campCode } });
    if (camp) {
      return await prisma.organization.findUnique({
        where: { id: camp.organizationId },
        include: {
          staff: true,
          campaigns: {
            include: {
              _count: {
                select: { patients: true }
              }
            },
            orderBy: { date: 'desc' }
          }
        }
      });
    }
  }
  
  const org = await prisma.organization.findFirst({
    include: {
      staff: true,
      campaigns: {
        include: {
          _count: {
            select: { patients: true }
          }
        },
        orderBy: { date: 'desc' }
      }
    }
  });
  return org;
}

export async function closeAndWipeCampAction(campCode: string) {
  const camp = await prisma.campaign.findFirst({ where: { campCode } });
  if (!camp) return { success: false, error: "Camp not found." };

  await prisma.campaign.update({
    where: { id: camp.id },
    data: { status: "ARCHIVED" }
  });

  const staff = await prisma.staff.findMany({ where: { organizationId: camp.organizationId } });
  const staffIds = staff.map(s => s.id);

  if (staffIds.length > 0) {
    await prisma.consultation.updateMany({
      where: { doctorId: { in: staffIds } },
      data: { doctorId: null }
    });

    await prisma.patient.updateMany({
      where: { triageNurseId: { in: staffIds } },
      data: { triageNurseId: null }
    });

    await prisma.staff.deleteMany({
      where: { organizationId: camp.organizationId }
    });
  }

  cookies().delete("staffId");
  revalidatePath("/");
  return { success: true };
}

export async function provisionMidCampStaffAction(formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const staffId = formData.get("staffId") as string;
  const password = formData.get("password") as string;
  const designation = formData.get("designation") as string;
  const campCode = formData.get("campCode") as string;

  let orgId = null;
  if (campCode) {
    const camp = await prisma.campaign.findFirst({ where: { campCode }});
    if (camp) {
      orgId = camp.organizationId;
    }
  }

  if (!orgId) {
    const org = await prisma.organization.findFirst();
    if (org) orgId = org.id;
  }

  if (!orgId) {
    return { success: false, error: "No organization found." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.staff.upsert({
    where: { staffId },
    update: {
      name,
      designation,
      password: passwordHash,
      role,
      organizationId: orgId
    },
    create: {
      name,
      designation,
      staffId,
      password: passwordHash,
      role,
      organizationId: orgId
    }
  });

  revalidatePath("/");
  return { success: true };
}

// --- PATIENT WORKFLOW ACTIONS ---

export async function registerPatientAction(campCode: string, formData: FormData) {
  const campaign = await prisma.campaign.findFirst({ where: { campCode, status: "ACTIVE" } });
  if (!campaign) {
    return { success: false, error: "System not initialized. Please complete camp setup." };
  }
  const campaignId = campaign.id;
  const phone = formData.get("phone") as string || null;

  // Duplicate Prevention Check
  if (phone) {
    const existing = await prisma.patient.findFirst({
      where: { campaignId, phone }
    });
    if (existing) {
      return { 
        success: false, 
        error: `You are already registered under Token #${existing.tokenNumber}. Click here to modify your info.`, 
        patient: existing 
      };
    }
  }

  const newPatient = await prisma.$transaction(async (tx) => {
    const maxTokenRecord = await tx.patient.findFirst({
      where: { campaignId },
      orderBy: { tokenNumber: "desc" },
    });

    const nextTokenNumber = maxTokenRecord ? maxTokenRecord.tokenNumber + 1 : 101;

    return await tx.patient.create({
      data: {
        campaignId,
        name: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
        age: parseInt(formData.get("age") as string, 10),
        gender: formData.get("gender") as string,
        phone,
        height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
        weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
        allergies: formData.get("allergies") as string || null,
        pastSurgeries: formData.get("surgeries") as string || null,
        currentMedications: formData.get("medications") as string || null,
        tokenNumber: nextTokenNumber,
        status: "REGISTERED",
      },
    });
  });

  cookies().set("patientId", newPatient.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  revalidatePath(`/${campCode}/register`);
  return { success: true, tokenNumber: newPatient.tokenNumber, patient: newPatient };
}

export async function fetchHistoricalReportAction(campCode: string, phone: string, tokenNumber: number) {
  const patient = await prisma.patient.findFirst({
    where: { 
      phone, 
      tokenNumber,
      campaign: {
        campCode: campCode
      }
    },
    include: {
      campaign: true,
      consultations: true
    }
  });
  return patient;
}

export async function fetchTriagePatient(campCode: string, tokenNumber: number) {
  const patient = await prisma.patient.findFirst({
    where: {
      tokenNumber,
      status: { in: ["REGISTERED", "TRIAGE"] },
      campaign: { campCode }
    },
  });
  return patient;
}

export async function fetchNurseQueue(campCode: string) {
  const patients = await prisma.patient.findMany({
    where: { 
      status: "REGISTERED",
      campaign: { campCode }
    },
    orderBy: { tokenNumber: "asc" },
  });
  return patients;
}

export async function updateVitalsAction(campCode: string, tokenNumber: number, vitalsData: any) {
  const patient = await prisma.patient.findFirst({
    where: { 
      tokenNumber,
      campaign: { campCode }
    },
  });

  if (!patient) return { success: false, error: "Patient not found." };

  const staff = await getSessionStaff();

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      height: vitalsData.height ? parseFloat(vitalsData.height) : null,
      weight: vitalsData.weight ? parseFloat(vitalsData.weight) : null,
      bloodPressure: vitalsData.bloodPressure || null,
      pulse: vitalsData.pulse ? parseInt(vitalsData.pulse, 10) : null,
      status: "DOCTOR",
      triageNurseId: staff ? staff.id : null,
    },
  });

  revalidatePath("/");
  return true;
}

export async function fetchDoctorQueue(campCode: string) {
  const patients = await prisma.patient.findMany({
    where: { 
      status: "DOCTOR",
      campaign: { campCode }
    },
    orderBy: { tokenNumber: "asc" },
  });
  return patients;
}

export async function submitPrescriptionAction(patientId: string, clinicalData: { symptoms: string, diagnosis: string, medicines: any[] }) {
  const staff = await getSessionStaff();

  await prisma.consultation.create({
    data: {
      patientId,
      doctorId: staff ? staff.id : null,
      doctorName: staff ? staff.name : "Dr. Default",
      symptoms: clinicalData.symptoms,
      diagnosis: clinicalData.diagnosis,
      prescriptions: JSON.stringify(clinicalData.medicines),
    },
  });

  await prisma.patient.update({
    where: { id: patientId },
    data: { status: "PHARMACY" },
  });

  revalidatePath("/");
  return true;
}

export async function fetchPharmacyQueue(campCode: string) {
  const patients = await prisma.patient.findMany({
    where: { 
      status: "PHARMACY",
      campaign: { campCode }
    },
    include: {
      consultations: true,
    },
    orderBy: { tokenNumber: "asc" },
  });
  return patients;
}

export async function completeDispensationAction(patientId: string) {
  await prisma.patient.update({
    where: { id: patientId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/");
  return true;
}

export async function getPatientStatusAction(identifier: string) {
  // Can be Token number or Phone
  const isToken = !isNaN(Number(identifier));
  
  const patient = await prisma.patient.findFirst({
    where: isToken 
      ? { tokenNumber: Number(identifier) }
      : { phone: identifier },
    include: {
      campaign: true,
      consultations: {
        include: {
          doctor: true
        }
      }
    },
    orderBy: { tokenNumber: 'desc' }
  });

  return patient;
}

export async function getPatientReportAction(patientId: string) {
  return await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      campaign: true,
      consultations: {
        include: {
          doctor: true,
        },
      },
    },
  });
}

export async function updatePatientAction(patientId: string, formData: FormData) {
  const updatedPatient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
      age: parseInt(formData.get("age") as string, 10),
      gender: formData.get("gender") as string,
      phone: formData.get("phone") as string || null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      allergies: formData.get("allergies") as string || null,
      pastSurgeries: formData.get("surgeries") as string || null,
      currentMedications: formData.get("medications") as string || null,
    }
  });

  revalidatePath("/");
  return { success: true, tokenNumber: updatedPatient.tokenNumber, patient: updatedPatient };
}

export async function checkPatientStatusAction() {
  const patientId = cookies().get("patientId")?.value;
  if (!patientId) return null;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { campaign: true }
  });

  if (!patient) return null;

  return {
    status: patient.status,
    campCode: patient.campaign.campCode,
    tokenNumber: patient.tokenNumber,
    patientId: patient.id
  };
}
