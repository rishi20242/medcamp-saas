import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import RegisterClient from "./RegisterClient";

const prisma = new PrismaClient();

export default async function RegisterPageServer({ params }: { params: { campCode: string } }) {
  const cookieStore = cookies();
  const patientId = cookieStore.get("patientId")?.value;

  let initialPatient = null;
  if (patientId) {
    const pt = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { campaign: true }
    });
    if (pt && pt.campaign.campCode === params.campCode) {
      initialPatient = pt;
    }
  }

  return <RegisterClient campCode={params.campCode} initialPatient={initialPatient} />;
}
