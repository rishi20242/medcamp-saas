"use client";
import { useState, useEffect } from "react";
import { fetchDoctorQueue, fetchPharmacyQueue, fetchNurseQueue } from "../../actions";
import { useParams } from "next/navigation";

export default function PublicDisplay() {
  const [nurseQueue, setNurseQueue] = useState<any[]>([]);
  const [doctorQueue, setDoctorQueue] = useState<any[]>([]);
  const [pharmacyQueue, setPharmacyQueue] = useState<any[]>([]);

  const params = useParams();
  const campCode = params.campCode as string;

  const loadData = async () => {
    try {
      const [nQueue, dQueue, pQueue] = await Promise.all([
        fetchNurseQueue(campCode),
        fetchDoctorQueue(campCode),
        fetchPharmacyQueue(campCode)
      ]);
      setNurseQueue(nQueue);
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

  const nurseTokens = nurseQueue.slice(0, 9);
  const doctorTokens = doctorQueue.slice(0, 9);
  const nextInLineDoctor = doctorQueue.slice(9, 14);
  const pharmacyReady = pharmacyQueue.slice(0, 3); // Show up to 3 ready for pickup

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
      {/* Background glow effects */}
      <div className="absolute -top-[20%] left-[5%] w-[40%] h-[50%] bg-amber-500/10 dark:bg-amber-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-violet-500/10 dark:bg-violet-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 uppercase tracking-[0.2em] mb-3">Live Status</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium tracking-widest uppercase">Medical Camp Automation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-10 flex-grow relative z-10">
        {/* Serving Now - Nurse */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
            Nurse Chamber
          </h2>
          
          <div className="flex-grow flex flex-col items-center justify-start w-full">
            {nurseTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
                {nurseTokens.map((patient, index) => (
                  <div key={patient.id} className={`${index === 0 ? "bg-[#1a202c] dark:bg-slate-900/90 border-slate-700 shadow-2xl" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 shadow-inner"} backdrop-blur-md p-6 rounded-3xl text-center border flex flex-col justify-center items-center h-40 transition-colors`}>
                    <p className={`font-bold uppercase tracking-[0.2em] mb-2 ${index === 0 ? "text-amber-500 text-sm" : "text-amber-600/80 dark:text-amber-400/80 text-xs"}`}>
                      {index === 0 ? "Now Serving" : "Token"}
                    </p>
                    <p className={`font-black ${index === 0 ? "text-amber-400 text-5xl xl:text-6xl drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "text-transparent bg-clip-text bg-gradient-to-b from-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] text-4xl xl:text-5xl"}`}>
                      {patient.tokenNumber}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 font-medium text-2xl h-full flex items-center justify-center">
                No patients in queue
              </div>
            )}
          </div>
        </div>

        {/* Serving Now - Doctor */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            Doctor Chamber
          </h2>
          
          <div className="flex-grow flex flex-col items-center justify-start w-full">
            {doctorTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
                {doctorTokens.map((patient, index) => (
                  <div key={patient.id} className={`${index === 0 ? "bg-[#1a202c] dark:bg-slate-900/90 border-slate-700 shadow-2xl" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 shadow-inner"} backdrop-blur-md p-6 rounded-3xl text-center border flex flex-col justify-center items-center h-40 transition-colors`}>
                    <p className={`font-bold uppercase tracking-[0.2em] mb-2 ${index === 0 ? "text-emerald-500 text-sm" : "text-emerald-600/80 dark:text-emerald-400/80 text-xs"}`}>
                      {index === 0 ? "Now Serving" : "Token"}
                    </p>
                    <p className={`font-black ${index === 0 ? "text-emerald-400 text-5xl xl:text-6xl drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-transparent bg-clip-text bg-gradient-to-b from-emerald-500 to-emerald-700 dark:from-emerald-300 dark:to-emerald-600 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)] text-4xl xl:text-5xl"}`}>
                      {patient.tokenNumber}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 font-medium text-2xl h-full flex items-center justify-center">
                No patients in queue
              </div>
            )}
          </div>
        </div>

        {/* Pharmacy Ready */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-8 flex flex-col relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>

          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
            Pharmacy Pickup
          </h2>
          
          <div className="flex-grow flex flex-col items-center justify-start w-full">
            {pharmacyReady.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
                {pharmacyReady.map((patient, index) => (
                  <div key={patient.id} className={`${index === 0 ? "bg-[#1a202c] dark:bg-slate-900/90 border-slate-700 shadow-2xl" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 shadow-inner"} backdrop-blur-md p-6 rounded-3xl text-center border flex flex-col justify-center items-center h-40 transition-colors`}>
                    <p className={`font-bold uppercase tracking-[0.2em] mb-2 ${index === 0 ? "text-violet-500 text-sm" : "text-violet-600/80 dark:text-violet-400/80 text-xs"}`}>
                      Token
                    </p>
                    <p className={`font-black ${index === 0 ? "text-violet-400 text-5xl xl:text-6xl drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "text-transparent bg-clip-text bg-gradient-to-b from-violet-500 to-violet-700 dark:from-violet-300 dark:to-violet-600 drop-shadow-[0_0_20px_rgba(139,92,246,0.2)] text-4xl xl:text-5xl"}`}>
                      {patient.tokenNumber}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 font-medium text-2xl h-full flex items-center justify-center">
                No medicines pending pickup
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-10 relative z-10 flex justify-center w-full">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700/50 px-10 py-5 rounded-2xl flex items-center justify-between w-full shadow-xl transition-colors">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 mr-8">Next in line (Doctor)</span>
          <div className="flex gap-4 flex-wrap justify-end items-center flex-grow">
            {nextInLineDoctor.length === 0 ? (
              <span className="text-slate-500 font-medium">None</span>
            ) : (
              nextInLineDoctor.map((p) => (
                <span key={p.id} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">{p.tokenNumber}</span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
