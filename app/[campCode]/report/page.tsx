"use client";
import { useState } from "react";
import { getPatientStatusAction } from "../../actions";
import Link from "next/link";

export default function PublicReportPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSearching(true);
    setError("");
    setPatientData(null);

    try {
      const result = await getPatientStatusAction(identifier);
      if (result) {
        if (result.status === "COMPLETED") {
          setPatientData(result);
        } else {
          setError(`Patient found, but status is currently '${result.status}'. Report is only available after Pharmacy completion.`);
        }
      } else {
        setError("No patient found with that Token ID.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the report.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 print:bg-white dark:print:bg-white flex flex-col font-sans transition-colors">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
      `}} />
      
      {/* Hide search interface during print */}
      <div className="print:hidden">
        <header className="bg-indigo-600 dark:bg-indigo-900 text-white p-6 shadow-md text-center relative transition-colors">
          <Link href="/" className="absolute left-6 top-6 text-indigo-200 hover:text-white transition-colors flex items-center gap-2 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back Home
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Patient Medical Report</h1>
          <p className="text-indigo-200 mt-2 font-medium">Download your official Medical Prescription Sheet</p>
        </header>

        <div className="max-w-xl mx-auto mt-10 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Camp Token ID</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 text-lg"
              >
                {isSearching ? "Searching..." : "Fetch Medical Report"}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl text-center font-medium transition-colors">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Report Container */}
      {patientData && (
        <div className="max-w-4xl mx-auto w-full my-8 bg-white shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none print:p-0 overflow-hidden relative break-inside-avoid">
          
          <div className="p-8 md:p-12 print:p-12">
            {/* Top Branding Matrix */}
            <div className="flex flex-col items-center justify-center border-b-2 border-slate-800 pb-4 mb-4 text-center">
              <h1 className="text-2xl font-extrabold tracking-wider text-slate-900 text-center uppercase mb-1">
                {patientData.campaign?.organizingInstitution || "APOLLO HOSPITALS MEDICAL CAMP"}
              </h1>
              <p className="text-sm font-bold text-slate-600 tracking-widest uppercase">
                Organized by: {patientData.campaign?.chiefOrganizer || "Chief Organizer"}
              </p>
              <div className="mt-2 bg-slate-800 text-white px-4 py-1 rounded-full font-bold text-xs tracking-widest uppercase">
                Official Medical Report &bull; Token #{patientData.tokenNumber}
              </div>
            </div>

            {/* Secondary Grid: Patient Vitals */}
            <div className="grid grid-cols-4 gap-2 mb-4 border border-slate-200 rounded-xl overflow-hidden divide-x divide-slate-200">
              <div className="bg-slate-50 p-2 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient Info</span>
                <span className="font-black text-slate-800 text-sm leading-tight">{patientData.name}</span>
                <span className="text-[10px] font-bold text-slate-500">{patientData.age} Yrs &bull; {patientData.gender}</span>
              </div>
              <div className="bg-slate-50 p-2 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Blood Pressure</span>
                <span className="font-black text-slate-800 text-sm">{patientData.bloodPressure || "--"} <span className="text-[9px] text-slate-500 font-bold">mmHg</span></span>
              </div>
              <div className="bg-slate-50 p-2 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pulse</span>
                <span className="font-black text-slate-800 text-sm">{patientData.pulse || "--"} <span className="text-[9px] text-slate-500 font-bold">bpm</span></span>
              </div>
              <div className="bg-slate-50 p-2 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Measurements</span>
                <div className="flex gap-2">
                  <span className="font-black text-slate-800 text-sm">{patientData.weight || "--"}<span className="text-[9px] text-slate-500 font-bold ml-0.5">kg</span></span>
                  <span className="font-black text-slate-800 text-sm">{patientData.height || "--"}<span className="text-[9px] text-slate-500 font-bold ml-0.5">cm</span></span>
                </div>
              </div>
            </div>

            {/* Clinical Block */}
            {patientData.consultations?.map((consultation: any, idx: number) => (
              <div key={idx} className="mb-4 break-inside-avoid">
                <div className="bg-slate-900 text-white p-3 rounded-t-xl flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-black">{consultation.doctorName}</h2>
                    <p className="text-slate-400 text-[10px] font-medium">{consultation.doctor?.designation || "Medical Officer"}</p>
                  </div>
                </div>
                
                <div className="border border-t-0 border-slate-200 rounded-b-xl p-4 bg-white space-y-3">
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        Reported Symptoms
                      </h3>
                      <p className="font-medium text-slate-800 text-sm leading-relaxed">{consultation.symptoms}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        Final Diagnosis
                      </h3>
                      <p className="font-bold text-indigo-700 text-sm leading-relaxed bg-indigo-50 inline-block px-2 py-0.5 rounded-md border border-indigo-100">{consultation.diagnosis}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      Prescribed Medications
                    </h3>
                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                            <th className="py-1 px-3 w-8 text-center">#</th>
                            <th className="py-1 px-3">Medicine Name</th>
                            <th className="py-1 px-3">Dosage Schedule</th>
                            <th className="py-1 px-3 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            let meds = [];
                            try {
                              meds = JSON.parse(consultation.prescriptions);
                            } catch (e) {
                              // fallback
                            }
                            if (!Array.isArray(meds) || meds.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="py-3 px-3 text-center text-[10px] text-slate-400 font-medium italic">No medications prescribed.</td>
                                </tr>
                              );
                            }
                            return meds.map((med: any, mIdx: number) => (
                              <tr key={mIdx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-0.5 px-3 text-center text-slate-400 font-medium text-[10px]">{mIdx + 1}</td>
                                <td className="py-0.5 px-3 font-bold text-slate-800 text-[11px]">{med.name}</td>
                                <td className="py-0.5 px-3 text-[10px]">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-bold tracking-widest border border-slate-200 shadow-sm">{med.dosage}</span>
                                </td>
                                <td className="py-0.5 px-3 text-right font-bold text-slate-600 text-[11px]">{med.days} Days</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Closing Slogan */}
            <div className="text-center w-full break-inside-avoid">
              <p className="text-xs font-medium italic text-emerald-600 tracking-wide mt-2 mb-1">✨ Wish you a speedy recovery! Recover faster. ✨</p>
            </div>

            {/* Footer Signature */}
            <div className="mt-2 flex justify-between items-end border-t-2 border-dashed border-slate-300 pt-4 break-inside-avoid">
              <div className="text-slate-400 font-medium text-[10px]">
                Generated via MedCamp OS<br/>
                <span className="text-[10px]">Date: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-800 mb-1"></div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Authorized Signature</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Print Button */}
      {patientData && (
        <div className="print:hidden fixed bottom-8 right-8 z-50">
          <button 
            onClick={handlePrint}
            className="bg-indigo-600 dark:bg-emerald-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 dark:hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-slate-800"
            title="Download PDF / Print"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
        </div>
      )}

    </div>
  );
}
