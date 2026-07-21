"use client";

import { useState } from "react";
import { fetchHistoricalReportAction } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientPortalPage() {
  const [campCode, setCampCode] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFetchReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campCode || !phone || !token) return;
    
    setLoading(true);
    setError("");
    
    try {
      const patient = await fetchHistoricalReportAction(campCode.trim().toUpperCase(), phone.replace(/\D/g, ''), parseInt(token));
      
      if (!patient) {
        setError("No records found for this Phone Number and Token.");
        return;
      }

      if (patient.status !== "COMPLETED" && patient.status !== "PHARMACY") {
        setError("Your consultation is not yet complete. Please check back later.");
        return;
      }

      // Redirect to the actual report page (we can reuse the existing report view)
      // The report route is `/[campCode]/camp/report/[id]`
      router.push(`/${patient.campaign.campCode}/camp/report/${patient.id}`);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching your records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-['Outfit'] flex flex-col items-center justify-center p-4 transition-colors">
      
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl shadow-emerald-500/10 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
        
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>

        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Patient Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Retrieve your historical medical reports, diagnosis, and prescriptions from past camps.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleFetchReport} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Camp Code</label>
            <input 
              type="text"
              value={campCode}
              onChange={(e) => setCampCode(e.target.value.toUpperCase())}
              placeholder="e.g. CAMP-2026"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Registered Phone Number</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              placeholder="e.g. 9876543210"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Camp Token Number</label>
            <input 
              type="number"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 105"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? "Searching Records..." : "Retrieve Medical Report"}
            {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </form>

      </div>
    </div>
  );
}
