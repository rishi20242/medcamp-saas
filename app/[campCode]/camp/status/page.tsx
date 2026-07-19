"use client";
import { useState } from "react";
import { getPatientStatusAction } from "../../../actions";
import Link from "next/link";

export default function StatusPage() {
  const [identifier, setIdentifier] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPatient(null);
    try {
      const result = await getPatientStatusAction(identifier);
      if (result) {
        setPatient(result);
      } else {
        setError("No patient found with this token or phone number.");
      }
    } catch (err) {
      setError("An error occurred while fetching status.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "REGISTERED": return "bg-slate-100 text-slate-600";
      case "TRIAGE": return "bg-blue-100 text-blue-600";
      case "DOCTOR": return "bg-amber-100 text-amber-600";
      case "PHARMACIST": return "bg-purple-100 text-purple-600";
      case "COMPLETED": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Track Patient Status</h1>
          <p className="text-slate-500">Enter your Token Number or Phone Number</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <form onSubmit={handleCheck} className="flex gap-3">
            <input 
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 101 or 9876543210"
              className="flex-grow bg-slate-50 rounded-xl px-5 py-3.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-70"
            >
              {isLoading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {patient && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{patient.name}</h2>
                  <p className="text-sm font-medium text-slate-500">Token #{patient.tokenNumber} &bull; {patient.age} Yrs &bull; {patient.gender}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${patient.status !== 'REGISTERED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>1</div>
                  <div className={patient.status !== 'REGISTERED' ? 'text-slate-900' : 'text-slate-400'}>
                    <p className="font-bold text-sm">Registration & Triage</p>
                    <p className="text-xs">Vitals taken</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${['PHARMACY', 'COMPLETED'].includes(patient.status) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
                  <div className={['PHARMACY', 'COMPLETED'].includes(patient.status) ? 'text-slate-900' : 'text-slate-400'}>
                    <p className="font-bold text-sm">Doctor Consultation</p>
                    <p className="text-xs">Diagnosis complete</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${patient.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
                  <div className={patient.status === 'COMPLETED' ? 'text-slate-900' : 'text-slate-400'}>
                    <p className="font-bold text-sm">Pharmacy Dispensation</p>
                    <p className="text-xs">Medicines collected</p>
                  </div>
                </div>
              </div>

              {patient.status === "COMPLETED" && (
                <div className="mt-8 text-center">
                  <Link 
                    href={`/camp/report/${patient.id}`}
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
