"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// --- AUTH & STAFF MANAGEMENT ---

export async function loginAction(staffId: string, password: string, campCode: string) {
  if (!staffId || typeof staffId !== "string") {
    return { success: false, error: "Staff ID is required." };
  }
  if (!campCode || typeof campCode !== "string") {
    return { success: false, error: "Camp Code is required." };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const normalizedStaffId = staffId.trim().toUpperCase();
  const normalizedCampCode = campCode.trim().toUpperCase();

  const campaign = await prisma.campaign.findFirst({ where: { campCode: normalizedCampCode } });
  if (!campaign) return { success: false, error: "Invalid deployment." };
  if (campaign.status === "INACTIVE") {
    return { success: false, error: "Access Denied: This deployment has been turned off by the camp organizer." };
  }

  const staff = await prisma.staff.findUnique({ 
    where: { 
      deploymentId_staffId: { deploymentId: normalizedCampCode, staffId: normalizedStaffId } 
    } 
  });
  if (!staff) return { success: false, error: "Invalid credentials for this deployment." };
  
  const isValid = await bcrypt.compare(password, staff.password);
  if (!isValid) return { success: false, error: "Invalid credentials." };

  cookies().set("staffId", staff.id, { 
    httpOnly: true, 
    path: "/", 
    maxAge: 86400,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return { success: true, role: staff.role };
}

export async function logoutAction() {
  cookies().delete("staffId");
  return { success: true };
}

export async function getSessionStaff() {
  const staffId = cookies().get("staffId")?.value;
  if (!staffId) return null;
  const staff = await prisma.staff.findUnique({ 
    where: { id: staffId },
    select: {
      id: true,
      name: true,
      designation: true,
      staffId: true,
      role: true,
      deploymentId: true,
      organizationId: true
    }
  });
  return staff;
}

// --- CAMPAIGN MANAGEMENT ---

export async function getActiveCampaignAction(campCode?: string) {
  if (campCode) {
    return await prisma.campaign.findFirst({
      where: { campCode: campCode.trim().toUpperCase(), status: "ACTIVE" },
    });
  }
  return await prisma.campaign.findFirst({
    where: { status: "ACTIVE" },
  });
}

export async function initializeCampAction(formData: FormData) {
  const institution = (formData.get("organizingInstitution") as string || "").trim();
  const organizer = (formData.get("chiefOrganizer") as string || "").trim();
  const department = (formData.get("department") as string || "").trim();
  const staffDataStr = formData.get("staffData") as string;

  if (!institution) {
    throw new Error("Organizing institution name is required.");
  }

  let org = await prisma.organization.findFirst({
    where: { name: institution }
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: institution },
    });
  }

  // Handle staff creation
  const baseCode = institution.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "CAMP";
  const uniqueId = Math.random().toString(36).substring(2, 5).toUpperCase();
  const generatedCampCode = `${baseCode}-${new Date().getFullYear()}-${uniqueId}`;

  if (staffDataStr) {
    try {
      const staffList = JSON.parse(staffDataStr);
      if (Array.isArray(staffList)) {
        for (const staff of staffList) {
          if (!staff.password || !staff.staffId) continue;
          const passwordHash = await bcrypt.hash(staff.password, 10);
          const normalizedStaffId = String(staff.staffId).trim().toUpperCase();
          await prisma.staff.upsert({
            where: { deploymentId_staffId: { deploymentId: generatedCampCode, staffId: normalizedStaffId } },
            update: {
              name: staff.name || normalizedStaffId,
              designation: staff.designation || staff.role || "Staff",
              password: passwordHash,
              role: staff.role || "DOCTOR",
              organizationId: org.id
            },
            create: {
              name: staff.name || normalizedStaffId,
              designation: staff.designation || staff.role || "Staff",
              staffId: normalizedStaffId,
              deploymentId: generatedCampCode,
              password: passwordHash,
              role: staff.role || "DOCTOR",
              organizationId: org.id
            }
          });
        }
      }
    } catch (e) {
      console.error("Error parsing staff data in initializeCampAction:", e);
    }
  }

  // Mark only existing campaigns of this specific organization as COMPLETED (tenant-scoped)
  await prisma.campaign.updateMany({
    where: { organizationId: org.id, status: "ACTIVE" },
    data: { status: "COMPLETED" }
  });

  const newCamp = await prisma.campaign.create({
    data: {
      organizationId: org.id,
      organizingInstitution: institution,
      chiefOrganizer: organizer || "Chief Organizer",
      campCode: generatedCampCode,
      department: department || "General Health",
      date: new Date(),
      status: "ACTIVE",
    },
  });

  revalidatePath("/");
  return newCamp;
}

export async function createDeploymentAction(formData: FormData) {
  const name = (formData.get("name") as string || "Medical Camp Deployment").trim();
  const rawCampCode = formData.get("campCode") as string;
  const orgId = formData.get("orgId") as string;

  if (!rawCampCode || !orgId) {
    return { success: false, error: "Camp code and organization ID are required." };
  }

  const campCode = rawCampCode.trim().toUpperCase();

  const docId = ((formData.get("docId") as string) || "DOC01").trim().toUpperCase();
  const docName = (formData.get("docName") as string || "Dr. Medical Officer").trim();
  const docPassword = (formData.get("docPassword") as string || "password123").trim();

  const nurId = ((formData.get("nurId") as string) || "NUR01").trim().toUpperCase();
  const nurName = (formData.get("nurName") as string || "Staff Nurse").trim();
  const nurPassword = (formData.get("nurPassword") as string || "password123").trim();

  const phaId = ((formData.get("phaId") as string) || "PHA01").trim().toUpperCase();
  const phaName = (formData.get("phaName") as string || "Pharmacist").trim();
  const phaPassword = (formData.get("phaPassword") as string || "password123").trim();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return { success: false, error: "Organization not found." };

  const existingCamp = await prisma.campaign.findFirst({ where: { campCode } });
  if (existingCamp) {
    return { success: false, error: "A deployment with this Camp Code already exists. Please choose a different code." };
  }

  const docHash = await bcrypt.hash(docPassword, 10);
  const nurHash = await bcrypt.hash(nurPassword, 10);
  const phaHash = await bcrypt.hash(phaPassword, 10);

  await prisma.$transaction([
    prisma.campaign.create({
      data: {
        name,
        campCode,
        organizationId: orgId,
        organizingInstitution: org.name,
        chiefOrganizer: "Dashboard Admin",
        department: "General",
        date: new Date(),
        status: "ACTIVE",
      },
    }),
    prisma.staff.createMany({
      data: [
        { name: docName, designation: "Doctor", staffId: docId, password: docHash, role: "DOCTOR", organizationId: orgId, deploymentId: campCode },
        { name: nurName, designation: "Nurse", staffId: nurId, password: nurHash, role: "NURSE", organizationId: orgId, deploymentId: campCode },
        { name: phaName, designation: "Pharmacist", staffId: phaId, password: phaHash, role: "PHARMACIST", organizationId: orgId, deploymentId: campCode },
      ]
    })
  ]);

  revalidatePath("/");
  return { success: true };
}

export async function toggleDeploymentStatusAction(deploymentId: string, status: string) {
  const allowedStatuses = ["ACTIVE", "INACTIVE", "COMPLETED", "ARCHIVED"];
  const targetStatus = status.trim().toUpperCase();
  if (!allowedStatuses.includes(targetStatus)) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    await prisma.campaign.update({
      where: { id: deploymentId },
      data: { status: targetStatus }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update status." };
  }
}

export async function getOrganizationOverviewAction(campCode?: string) {
  const staffSelect = {
    id: true,
    name: true,
    designation: true,
    staffId: true,
    role: true,
    deploymentId: true,
    createdAt: true
  };

  if (campCode) {
    const normalized = campCode.trim().toUpperCase();
    const camp = await prisma.campaign.findFirst({ where: { campCode: normalized } });
    if (camp) {
      return await prisma.organization.findUnique({
        where: { id: camp.organizationId },
        include: {
          staff: { select: staffSelect },
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
    return null;
  }
  
  const org = await prisma.organization.findFirst({
    include: {
      staff: { select: staffSelect },
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
  const normalized = campCode.trim().toUpperCase();
  const camp = await prisma.campaign.findFirst({ where: { campCode: normalized } });
  if (!camp) return { success: false, error: "Camp not found." };

  await prisma.campaign.update({
    where: { id: camp.id },
    data: { status: "ARCHIVED" }
  });

  // Scope staff deletion and patient/consultation unbinding strictly to this deployment
  const deploymentStaff = await prisma.staff.findMany({ where: { deploymentId: normalized } });
  const staffIds = deploymentStaff.map(s => s.id);

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
      where: { deploymentId: normalized }
    });
  }

  cookies().delete("staffId");
  revalidatePath("/");
  return { success: true };
}

export async function provisionMidCampStaffAction(formData: FormData) {
  const name = (formData.get("name") as string || "Staff Member").trim();
  const role = (formData.get("role") as string || "DOCTOR").trim();
  const rawStaffId = formData.get("staffId") as string;
  const password = formData.get("password") as string;
  const designation = (formData.get("designation") as string || role).trim();
  const rawCampCode = formData.get("campCode") as string;

  if (!rawStaffId || !password || !rawCampCode) {
    return { success: false, error: "Staff ID, password, and Camp Code are required." };
  }

  const staffId = rawStaffId.trim().toUpperCase();
  const campCode = rawCampCode.trim().toUpperCase();

  let orgId: string | null = null;
  const camp = await prisma.campaign.findFirst({ where: { campCode }});
  if (camp) {
    orgId = camp.organizationId;
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
    where: { deploymentId_staffId: { deploymentId: campCode, staffId } },
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
      organizationId: orgId,
      deploymentId: campCode
    }
  });

  revalidatePath("/");
  return { success: true };
}

// --- PATIENT WORKFLOW ACTIONS ---

export async function registerPatientAction(campCode: string, formData: FormData) {
  const normalizedCampCode = campCode.trim().toUpperCase();
  const campaign = await prisma.campaign.findFirst({ where: { campCode: normalizedCampCode, status: "ACTIVE" } });
  if (!campaign) {
    return { success: false, error: "System not initialized or deployment is inactive." };
  }
  const campaignId = campaign.id;
  const rawPhone = (formData.get("phone") as string || "").replace(/\D/g, '');
  const phone = rawPhone.length > 0 ? rawPhone : null;

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

  const firstName = (formData.get("firstName") as string || "").trim();
  const lastName = (formData.get("lastName") as string || "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || "Patient";

  const rawAge = parseInt(formData.get("age") as string, 10);
  const age = isNaN(rawAge) ? 25 : rawAge;

  const rawHeight = parseFloat(formData.get("height") as string);
  const height = isNaN(rawHeight) ? null : rawHeight;

  const rawWeight = parseFloat(formData.get("weight") as string);
  const weight = isNaN(rawWeight) ? null : rawWeight;

  const newPatient = await prisma.$transaction(async (tx) => {
    const maxTokenRecord = await tx.patient.findFirst({
      where: { campaignId },
      orderBy: { tokenNumber: "desc" },
    });

    const nextTokenNumber = maxTokenRecord ? maxTokenRecord.tokenNumber + 1 : 101;

    return await tx.patient.create({
      data: {
        campaignId,
        name: fullName,
        age,
        gender: (formData.get("gender") as string || "Other").trim(),
        phone,
        height,
        weight,
        bloodGroup: (formData.get("bloodGroup") as string || "").trim() || null,
        allergies: (formData.get("allergies") as string || "").trim() || null,
        pastSurgeries: (formData.get("surgeries") as string || "").trim() || null,
        currentMedications: (formData.get("medications") as string || "").trim() || null,
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
    maxAge: 86400
  });

  revalidatePath(`/${normalizedCampCode}/register`);
  return { success: true, tokenNumber: newPatient.tokenNumber, patient: newPatient };
}

export async function clearPatientCookieAction() {
  cookies().delete("patientId");
  return { success: true };
}

export async function fetchPatientByCampTokenAction(campCode: string, tokenNumber: number) {
  if (isNaN(tokenNumber)) return { success: false, error: "Invalid token number." };
  try {
    const patient = await prisma.patient.findFirst({
      where: {
        tokenNumber,
        campaign: { campCode: campCode.trim().toUpperCase() }
      },
      include: {
        consultations: true,
      }
    });
    return { success: !!patient, patient };
  } catch (error) {
    return { success: false, error: "Database error." };
  }
}

export async function fetchHistoricalReportAction(campCode: string, phone: string, tokenNumber: number) {
  const normalizedCamp = campCode.trim().toUpperCase();

  // Demo bypass for quick showcase
  if (normalizedCamp === "42" || campCode === "42") {
    return {
      id: "mock-patient-42",
      tokenNumber: 42,
      name: "Alexander Hamilton",
      age: 38,
      gender: "Male",
      bloodGroup: "O+",
      phone: "5550199",
      height: 180,
      weight: 75,
      bloodPressure: "120/80",
      pulse: 72,
      status: "COMPLETED",
      campaign: {
        campCode: "42",
        organizingInstitution: "Global Health Foundation",
        department: "Cardiology",
        chiefOrganizer: "Dr. Sarah Mitchell",
      },
      consultations: [
        {
          symptoms: "Patient reported mild chest tightness after exercise. No history of heart disease.",
          diagnosis: "Mild Angina Pectoris",
          doctorName: "Dr. Gregory House",
          prescriptions: JSON.stringify([
            { name: "Aspirin", medicine: "Aspirin", dosage: "75mg 1-0-0", days: 30 },
            { name: "Atorvastatin", medicine: "Atorvastatin", dosage: "20mg 0-0-1", days: 30 }
          ])
        }
      ]
    };
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: { 
        phone: phone.replace(/\D/g, ''), 
        tokenNumber: isNaN(tokenNumber) ? -1 : tokenNumber,
        campaign: {
          campCode: normalizedCamp
        }
      },
      include: {
        campaign: true,
        consultations: true
      }
    });
    
    if (!patient) return null;
    return JSON.parse(JSON.stringify(patient));
  } catch (err: any) {
    console.error("fetchHistoricalReportAction error:", err);
    throw new Error("Server error: " + err.message);
  }
}

export async function fetchTriagePatient(campCode: string, tokenNumber: number) {
  if (isNaN(tokenNumber)) return null;
  const patient = await prisma.patient.findFirst({
    where: {
      tokenNumber,
      status: { in: ["REGISTERED", "TRIAGE"] },
      campaign: { campCode: campCode.trim().toUpperCase() }
    },
  });
  return patient;
}

export async function fetchNurseQueue(campCode: string) {
  const patients = await prisma.patient.findMany({
    where: { 
      status: { in: ["REGISTERED", "TRIAGE"] },
      campaign: { campCode: campCode.trim().toUpperCase() }
    },
    orderBy: { tokenNumber: "asc" },
  });
  return patients;
}

export async function updateVitalsAction(campCode: string, tokenNumber: number, vitalsData: any) {
  if (isNaN(tokenNumber)) return { success: false, error: "Invalid token number." };

  const normalizedCamp = campCode.trim().toUpperCase();
  const patient = await prisma.patient.findFirst({
    where: { 
      tokenNumber,
      campaign: { campCode: normalizedCamp }
    },
  });

  if (!patient) return { success: false, error: "Patient not found." };

  const staff = await getSessionStaff();

  const rawHeight = parseFloat(vitalsData.height);
  const height = isNaN(rawHeight) ? null : rawHeight;

  const rawWeight = parseFloat(vitalsData.weight);
  const weight = isNaN(rawWeight) ? null : rawWeight;

  const rawPulse = parseInt(vitalsData.pulse, 10);
  const pulse = isNaN(rawPulse) ? null : rawPulse;

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      height,
      weight,
      bloodPressure: vitalsData.bloodPressure ? String(vitalsData.bloodPressure).trim() : null,
      pulse,
      status: "DOCTOR",
      triageNurseId: staff ? staff.id : null,
    },
  });

  revalidatePath(`/${normalizedCamp}/nurse`);
  revalidatePath(`/${normalizedCamp}/doctor`);
  return { success: true };
}

export async function fetchDoctorQueue(campCode: string) {
  const normalizedCamp = campCode.trim().toUpperCase();
  const patients = await prisma.patient.findMany({
    where: { 
      status: { in: ["DOCTOR", "DOCTOR_REFERRED_OUT_OF_STOCK"] },
      campaign: { campCode: normalizedCamp }
    },
    include: {
      consultations: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { tokenNumber: "asc" },
  });
  
  // Sort out-of-stock patients to the top
  return patients.sort((a, b) => {
    if (a.status === "DOCTOR_REFERRED_OUT_OF_STOCK" && b.status !== "DOCTOR_REFERRED_OUT_OF_STOCK") return -1;
    if (b.status === "DOCTOR_REFERRED_OUT_OF_STOCK" && a.status !== "DOCTOR_REFERRED_OUT_OF_STOCK") return 1;
    return 0;
  });
}

export async function submitPrescriptionAction(patientId: string, clinicalData: { symptoms: string, diagnosis: string, medicines: any[] }) {
  const staff = await getSessionStaff();

  // Normalize medicines to ensure both 'name' and 'medicine' keys exist
  const normalizedMedicines = (clinicalData.medicines || []).map((med: any) => ({
    name: med.name || med.medicine || "Medicine",
    medicine: med.name || med.medicine || "Medicine",
    dosage: med.dosage || "1-0-1",
    days: med.days || 3
  }));

  const consultation = await prisma.consultation.create({
    data: {
      patientId,
      doctorId: staff ? staff.id : null,
      doctorName: staff ? staff.name : "Consulting Physician",
      symptoms: clinicalData.symptoms || "General checkup",
      diagnosis: clinicalData.diagnosis || "Observation",
      prescriptions: JSON.stringify(normalizedMedicines),
    },
  });

  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: { 
      status: "PHARMACY",
      outOfStockNote: null // Clear out of stock note once doctor updates prescription
    },
    include: { campaign: true }
  });

  if (patient.campaign) {
    revalidatePath(`/${patient.campaign.campCode}/doctor`);
    revalidatePath(`/${patient.campaign.campCode}/pharmacy`);
  }
  return { success: true, consultationId: consultation.id };
}

export async function fetchPharmacyQueue(campCode: string) {
  const normalizedCamp = campCode.trim().toUpperCase();
  const patients = await prisma.patient.findMany({
    where: { 
      status: "PHARMACY",
      campaign: { campCode: normalizedCamp }
    },
    include: {
      consultations: {
        orderBy: { createdAt: "desc" }
      },
    },
    orderBy: { tokenNumber: "asc" },
  });
  return patients;
}

export async function completeDispensationAction(patientId: string) {
  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: { status: "COMPLETED" },
    include: { campaign: true }
  });

  if (patient.campaign) {
    revalidatePath(`/${patient.campaign.campCode}/pharmacy`);
    revalidatePath(`/${patient.campaign.campCode}/camp/report/${patient.id}`);
  }
  return { success: true };
}

export async function getPatientStatusAction(identifier: string, campCode?: string) {
  // Demo mock bypass
  if (identifier === "42") {
    return {
      id: "mock-patient-42",
      tokenNumber: 42,
      name: "Alexander Hamilton",
      age: 38,
      gender: "Male",
      bloodGroup: "O+",
      phone: "555-0199",
      height: 180,
      weight: 75,
      bloodPressure: "120/80",
      pulse: 72,
      status: "COMPLETED",
      campaign: {
        campCode: "42",
        organizingInstitution: "Global Health Foundation",
        department: "Cardiology",
        chiefOrganizer: "Dr. Sarah Mitchell",
      },
      consultations: [
        {
          symptoms: "Patient reported mild chest tightness after exercise. No history of heart disease.",
          diagnosis: "Mild Angina Pectoris",
          doctorName: "Dr. Gregory House",
          prescriptions: JSON.stringify([
            { name: "Aspirin", medicine: "Aspirin", dosage: "75mg 1-0-0", days: 30 },
            { name: "Atorvastatin", medicine: "Atorvastatin", dosage: "20mg 0-0-1", days: 30 }
          ])
        }
      ]
    };
  }

  const cleanId = String(identifier || "").trim();
  // Standard phone numbers are 10 digits; tokens are shorter
  const isPhone = cleanId.replace(/\D/g, '').length >= 10;
  
  const whereClause: any = isPhone 
    ? { phone: cleanId.replace(/\D/g, '') }
    : { tokenNumber: isNaN(Number(cleanId)) ? -1 : Number(cleanId) };

  if (campCode) {
    whereClause.campaign = { campCode: campCode.trim().toUpperCase() };
  }

  const patient = await prisma.patient.findFirst({
    where: whereClause,
    include: {
      campaign: true,
      consultations: {
        orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              designation: true,
              role: true
            }
          }
        }
      }
    },
    orderBy: { tokenNumber: 'desc' }
  });

  return patient;
}

export async function getPatientReportAction(patientId: string) {
  // Demo mock bypass
  if (patientId === "mock-patient-42") {
    return {
      id: "mock-patient-42",
      tokenNumber: 42,
      name: "Alexander Hamilton",
      age: 38,
      gender: "Male",
      bloodGroup: "O+",
      phone: "5550199",
      height: 180,
      weight: 75,
      bloodPressure: "120/80",
      pulse: 72,
      status: "COMPLETED",
      campaign: {
        campCode: "42",
        organizingInstitution: "Global Health Foundation",
        department: "Cardiology",
        chiefOrganizer: "Dr. Sarah Mitchell",
      },
      consultations: [
        {
          symptoms: "Patient reported mild chest tightness after exercise. No history of heart disease.",
          diagnosis: "Mild Angina Pectoris",
          doctorName: "Dr. Gregory House",
          prescriptions: JSON.stringify([
            { name: "Aspirin", medicine: "Aspirin", dosage: "75mg 1-0-0", days: 30 },
            { name: "Atorvastatin", medicine: "Atorvastatin", dosage: "20mg 0-0-1", days: 30 }
          ])
        }
      ]
    };
  }

  return await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      campaign: true,
      consultations: {
        orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              designation: true,
              role: true
            }
          },
        },
      },
    },
  });
}

export async function updatePatientAction(patientId: string, formData: FormData) {
  const firstName = (formData.get("firstName") as string || "").trim();
  const lastName = (formData.get("lastName") as string || "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || "Patient";

  const rawAge = parseInt(formData.get("age") as string, 10);
  const age = isNaN(rawAge) ? 25 : rawAge;

  const rawHeight = parseFloat(formData.get("height") as string);
  const height = isNaN(rawHeight) ? null : rawHeight;

  const rawWeight = parseFloat(formData.get("weight") as string);
  const weight = isNaN(rawWeight) ? null : rawWeight;

  const rawPhone = (formData.get("phone") as string || "").replace(/\D/g, '');
  const phone = rawPhone.length > 0 ? rawPhone : null;

  const updatedPatient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: fullName,
      age,
      gender: (formData.get("gender") as string || "Other").trim(),
      phone,
      height,
      weight,
      bloodGroup: (formData.get("bloodGroup") as string || "").trim() || null,
      allergies: (formData.get("allergies") as string || "").trim() || null,
      pastSurgeries: (formData.get("surgeries") as string || "").trim() || null,
      currentMedications: (formData.get("medications") as string || "").trim() || null,
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

export async function markOutOfStockAction(patientId: string, note: string) {
  const staff = await getSessionStaff();
  if (!staff || staff.role !== "PHARMACIST") {
    return { success: false, error: "Unauthorized" };
  }

  const updated = await prisma.patient.update({
    where: { id: patientId },
    data: {
      status: "DOCTOR_REFERRED_OUT_OF_STOCK",
      outOfStockNote: note ? note.trim() : "Medicine out of stock. Alternate prescription requested."
    },
    include: { campaign: true }
  });

  if (updated.campaign) {
    revalidatePath(`/${updated.campaign.campCode}/pharmacy`);
    revalidatePath(`/${updated.campaign.campCode}/doctor`);
  }
  return { success: true };
}
