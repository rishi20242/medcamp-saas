"use client";
import { useState } from "react";
import { getPatientStatusAction } from "../../../actions";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StatusPage() {
  const [identifier, setIdentifier] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const campCode = (params?.campCode as string) || "";

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPatient(null);
    try {
      const result = await getPatientStatusAction(identifier, campCode);
      if (result) {
        setPatient(result);
      } else {
        setError("No patient found with this token or phone number in this camp.");
      }
    } catch (err) {
      setError("An error occurred while fetching status.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "REGISTERED": return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
      case "TRIAGE": return "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300";
      case "DOCTOR": return "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300";
      case "DOCTOR_REFERRED_OUT_OF_STOCK": return "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300";
      case "PHARMACY": return "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300";
      case "COMPLETED": return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
      default: return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 transition-colors">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Track Patient Status</h1>
          <p className="text-slate-500 dark:text-slate-400">Enter your Token Number or Phone Number</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleCheck} className="flex gap-3">
            <input 
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 101 or 9876543210"
              className="flex-grow bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-5 py-3.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          {patient && (
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{patient.name}</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Token #{patient.tokenNumber} &bull; {patient.age} Yrs &bull; {patient.gender}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${patient.status !== 'REGISTERED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>1</div>
                  <div>
                    <p className="font-bold text-sm">Registration & Triage</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vitals taken</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${['PHARMACY', 'COMPLETED'].includes(patient.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>2</div>
                  <div>
                    <p className="font-bold text-sm">Doctor Consultation</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Diagnosis & prescription</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${patient.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>3</div>
                  <div>
                    <p className="font-bold text-sm">Pharmacy Dispensation</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Medicines collected</p>
                  </div>
                </div>
              </div>

              {patient.status === "COMPLETED" && (
                <div className="mt-8 text-center">
                  <Link 
                    href={`/${patient.campaign?.campCode || campCode}/camp/report/${patient.id}`}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Digital Health Report
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
