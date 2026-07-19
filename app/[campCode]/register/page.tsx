import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import RegisterClient from "./RegisterClient";

const prisma = new PrismaClient();

export default async function RegisterPageServer({ params }: { params: { campCode: string } }) {
  const cookieStore = cookies();
  const patientId = cookieStore.get("patientId")?.value;

  let initialPatient = null;
  if (patientId) {
    initialPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
  }

  return <RegisterClient campCode={params.campCode} initialPatient={initialPatient} />;
}
