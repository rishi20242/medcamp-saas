"use client";
import { useState, useEffect } from "react";
import { fetchDoctorQueue, fetchPharmacyQueue } from "../../actions";
import { useParams } from "next/navigation";

export default function PublicDisplay() {
  const [doctorQueue, setDoctorQueue] = useState<any[]>([]);
  const [pharmacyQueue, setPharmacyQueue] = useState<any[]>([]);

  const params = useParams();
  const campCode = params.campCode as string;

  const loadData = async () => {
    try {
      const [dQueue, pQueue] = await Promise.all([
        fetchDoctorQueue(campCode),
        fetchPharmacyQueue(campCode)
      ]);
      setDoctorQueue(dQueue);
      setPharmacyQueue(pQueue);
    } catch (error) {
      console.error("Failed to load display data", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentlyServingDoctor = doctorQueue.length > 0 ? doctorQueue[0] : null;
  const nextInLineDoctor = doctorQueue.slice(1, 4);
  const pharmacyReady = pharmacyQueue.slice(0, 3); // Show up to 3 ready for pickup

  return (
    <div className="min-h-[85vh] bg-slate-950 text-slate-200 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden border border-slate-800 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 uppercase tracking-[0.2em] mb-3">Live Status</h1>
        <p className="text-slate-500 text-lg font-medium tracking-widest uppercase">Medical Camp Automation</p>
      </div>

      <div className="grid grid-cols-2 gap-10 flex-grow relative z-10">
        {/* Serving Now - Doctor */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          
          <h2 className="text-2xl font-bold text-center text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            Doctor Chamber
          </h2>
          
          <div className="flex-grow flex flex-col items-center justify-center space-y-10">
            {currentlyServingDoctor ? (
              <>
                <div className="text-center relative">
                  <p className="text-sm font-bold text-emerald-500/80 uppercase tracking-[0.3em] mb-4">Token</p>
                  <div className="text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                    {currentlyServingDoctor.tokenNumber}
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-full">
                  <p className="text-xl text-emerald-300 font-bold tracking-wide">Please proceed to Doctor 1</p>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 font-medium text-2xl">
                No patients in queue
              </div>
            )}
          </div>
        </div>

        {/* Pharmacy Ready */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>

          <h2 className="text-2xl font-bold text-center text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
            Pharmacy Pickup
          </h2>
          
          <div className="flex-grow grid grid-cols-2 gap-6 content-start">
            {pharmacyReady.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 font-medium text-xl mt-10">
                No medicines pending pickup
              </div>
            ) : (
              pharmacyReady.map((patient) => (
                <div key={patient.id} className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl text-center border border-slate-700/50 shadow-inner">
                  <p className="text-xs font-bold text-violet-400/80 uppercase tracking-[0.2em] mb-2">Token</p>
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-violet-300 to-violet-600 drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">{patient.tokenNumber}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-10 relative z-10 flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 px-10 py-5 rounded-2xl flex items-center gap-6 shadow-xl">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Next in line (Doctor)</span>
          <div className="flex gap-4">
            {nextInLineDoctor.length === 0 ? (
              <span className="text-slate-500 font-medium">None</span>
            ) : (
              nextInLineDoctor.map((p) => (
                <span key={p.id} className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-700">{p.tokenNumber}</span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
