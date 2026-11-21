"use client";
import { useEffect, useState } from "react";
import { checkPatientStatusAction } from "../actions";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PatientNotification() {
  const [reportReady, setReportReady] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  // ONLY poll and show notification if we are on the registration page
  const cleanPath = (pathname || "").replace(/\/+$/, '');
  const isRegistrationPage = cleanPath.endsWith("/register");

  useEffect(() => {
    if (!isRegistrationPage || dismissed) return;

    // Poll every 10 seconds
    const interval = setInterval(async () => {
      try {
        const data = await checkPatientStatusAction();
        if (data && data.status === "COMPLETED") {
          const url = `/${data.campCode}/camp/report/${data.patientId}`;
          if (pathname !== url) {
            setReportUrl(url);
            setReportReady(true);
          } else {
            setReportReady(false);
          }
        }
      } catch (error) {
        console.error("Failed to check patient status:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pathname, isRegistrationPage, dismissed]);

  if (!isRegistrationPage || !reportReady || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 print:hidden">
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-2xl shadow-emerald-500/20 rounded-2xl p-5 w-80 relative overflow-hidden flex flex-col gap-3 transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <button 
          onClick={() => {
            setReportReady(false);
            setDismissed(true);
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">Report Generated!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your medical report and prescription are ready.</p>
          </div>
        </div>
        <Link 
          href={reportUrl}
          onClick={() => setReportReady(false)}
          className="w-full mt-2 bg-slate-900 dark:bg-emerald-600 text-white text-center py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
        >
          View My Report
        </Link>
      </div>
    </div>
  );
}
