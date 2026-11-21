import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import RegisterClient from "./RegisterClient";

export default async function RegisterPageServer({ 
  params,
  searchParams 
}: { 
  params: { campCode: string },
  searchParams: { access?: string }
}) {
  const cookieStore = cookies();
  const patientId = cookieStore.get("patientId")?.value;
  const hasAccessCookie = cookieStore.get(`access_${params.campCode}`)?.value === "granted";

  const campaign = await prisma.campaign.findFirst({
    where: { campCode: params.campCode }
  });

  if (!campaign) {
    return <div className="p-10 text-center text-red-500 font-bold">Campaign not found.</div>;
  }

  if (campaign.status === "INACTIVE") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-rose-200 dark:border-rose-900/30 max-w-md w-full">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-3xl mx-auto flex items-center justify-center mb-6 ring-4 ring-rose-50 dark:ring-rose-900/20">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">Deployment Inactive</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            This medical camp deployment is currently closed or suspended by the organizer. Registration is unavailable.
          </p>
        </div>
      </div>
    );
  }

  // QR Gatekeeper Logic
  let isGranted = hasAccessCookie;
  
  if (searchParams.access === campaign.slugToken) {
    isGranted = true;
  }

  if (!isGranted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">Scan QR to Register</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Welcome to MedCamp! Please scan the official QR code located at the camp counter to start your registration.
          </p>
        </div>
      </div>
    );
  }

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


  return <RegisterClient campCode={params.campCode} initialPatient={initialPatient} accessGranted={searchParams.access === campaign.slugToken} />;
}
