"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GlobalLandingPage() {
  const router = useRouter();
  const [campCode, setCampCode] = useState("");

  const handleAccessCamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (campCode.trim()) {
      router.push(`/${campCode.trim().toUpperCase()}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-['Outfit'] flex flex-col items-center justify-center p-4">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-4xl text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-200 to-indigo-500 mb-6 drop-shadow-sm">
          MedCamp.
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          The ultimate multi-tenant platform for orchestrating, digitizing, and automating medical camps at scale.
        </p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* Administrator Portal */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Staff & Admin Portal</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Deploy a brand new medical camp ecosystem or access your existing live deployment.</p>
          
          <div className="space-y-4">
            <form onSubmit={handleAccessCamp} className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter Camp Code..."
                value={campCode}
                onChange={(e) => setCampCode(e.target.value)}
                className="flex-1 bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 font-mono uppercase"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25">
                Access
              </button>
            </form>
            <div className="flex items-center gap-4 text-slate-500 text-sm font-semibold uppercase tracking-widest my-4">
              <span className="flex-1 h-px bg-slate-800"></span>
              OR
              <span className="flex-1 h-px bg-slate-800"></span>
            </div>
            <Link href="/admin/setup" className="block w-full text-center bg-white text-slate-900 hover:bg-slate-200 px-6 py-4 rounded-xl font-black transition-all shadow-xl shadow-white/5">
              Launch New Camp
            </Link>
          </div>
        </div>

        {/* Patient Portal */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Patient Portal</h2>
          <p className="text-slate-400 mb-8 leading-relaxed flex-1">Access your historical medical reports, prescriptions, and post-camp follow-up instructions securely.</p>
          
          <Link href="/patient-portal" className="block w-full text-center bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-xl font-black transition-all shadow-xl shadow-emerald-500/20">
            Retrieve Medical Report
          </Link>
        </div>

      </div>
    </div>
  );
}
