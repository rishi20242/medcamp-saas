"use client";
import { useState, useEffect } from "react";
import { fetchPharmacyQueue, completeDispensationAction } from "../../actions";
import { useParams } from "next/navigation";

export default function PharmacyCounter() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [dispensedItems, setDispensedItems] = useState<Record<number, boolean>>({});

  const params = useParams();
  const campCode = params.campCode as string;

  const loadQueue = async () => {
    try {
      const patients = await fetchPharmacyQueue(campCode);
      setQueue(patients);
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0]);
        setDispensedItems({});
      } else if (patients.length === 0) {
        setSelectedPatient(null);
      } else {
        const stillInQueue = patients.find(p => p.id === selectedPatient?.id);
        if (!stillInQueue) {
          setSelectedPatient(patients.length > 0 ? patients[0] : null);
          setDispensedItems({});
        } else {
          // Update selected patient to get latest consultations
          setSelectedPatient(stillInQueue);
        }
      }
    } catch (error) {
      console.error("Failed to load pharmacy queue", error);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [selectedPatient]);

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setDispensedItems({});
  };

  const handleCompleteDispensation = async () => {
    if (!selectedPatient) return;
    
    const confirmTransfer = window.confirm("Are you sure you want to verify and complete the medicine handover to this patient?");
    if (!confirmTransfer) return;

    setIsCompleting(true);
    try {
      await completeDispensationAction(selectedPatient.id);
      setSelectedPatient(null);
      setDispensedItems({});
      await loadQueue();
    } catch (error) {
      console.error(error);
      alert("Failed to complete dispensation.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Extract latest consultation and its prescriptions
  const latestConsultation = selectedPatient?.consultations?.[selectedPatient.consultations.length - 1];
  const prescriptions = latestConsultation?.prescriptions ? JSON.parse(latestConsultation.prescriptions) : [];

  const allDispensed = prescriptions.length > 0 && prescriptions.every((_: any, i: number) => dispensedItems[i]);

  return (
    <div className="flex flex-col h-[82vh] bg-white/60 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] max-w-7xl mx-auto overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex justify-between items-center shadow-md z-10 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          Pharmacy Dispensation
          <button onClick={loadQueue} type="button" className="ml-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors border border-white/20 shadow-sm" title="Refresh Latest Data">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </h2>
        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/20 backdrop-blur-md">
            Tokens Pending: <span className="font-bold ml-1 text-fuchsia-200">{queue.length}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-grow overflow-hidden bg-slate-50/30">
        {/* Queue */}
        <div className="w-1/3 border-r border-slate-200/60 p-5 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Pending Dispensation</h3>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center text-slate-400 font-medium py-10">No prescriptions pending</div>
            ) : (
              queue.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => handleSelectPatient(patient)}
                  className={`group p-5 bg-white border ${selectedPatient?.id === patient.id ? 'border-violet-500 shadow-md shadow-violet-500/10' : 'border-slate-100'} rounded-2xl shadow-sm cursor-pointer hover:border-violet-300 hover:shadow-violet-500/10 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${selectedPatient?.id === patient.id ? 'bg-violet-500' : 'bg-violet-400 transform -translate-x-full group-hover:translate-x-0'} transition-transform duration-300`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-violet-700 text-lg tracking-tight block">Token #{patient.tokenNumber}</span>
                      <p className="text-xs text-slate-500 mt-1">{patient.consultations?.[patient.consultations.length - 1]?.doctorName || "Doctor"}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Consulted
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Dispensation Detail */}
        <div className="w-2/3 p-8 overflow-y-auto flex flex-col bg-white/40">
          {selectedPatient ? (
            <>
              <div className="flex justify-between items-start mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tight">#{selectedPatient.tokenNumber}</h3>
                  <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {selectedPatient.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold text-sm">{latestConsultation?.diagnosis || "--"}</span>
                </div>
              </div>
              
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Prescription Details</h4>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Medicine</th>
                        <th className="p-4 font-bold">Dosage</th>
                        <th className="p-4 font-bold">Duration</th>
                        <th className="p-4 font-bold text-center">Dispensed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No medications prescribed.</td>
                        </tr>
                      ) : (
                        prescriptions.map((med: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800">{med.name}</p>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{med.dosage}</td>
                            <td className="p-4 text-slate-600 font-medium">{med.days} Days</td>
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={!!dispensedItems[index]}
                                onChange={(e) => setDispensedItems({...dispensedItems, [index]: e.target.checked})}
                                className="w-6 h-6 text-violet-600 rounded-lg border-slate-300 focus:ring-violet-500 cursor-pointer accent-violet-600 transition-all" 
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={handleCompleteDispensation}
                  disabled={isCompleting || (!allDispensed && prescriptions.length > 0)}
                  className={`w-full py-4 rounded-xl font-bold tracking-wide text-white flex justify-center items-center gap-2 transition-all duration-300 
                    ${(!allDispensed && prescriptions.length > 0) ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 shadow-lg shadow-slate-900/20 hover:bg-violet-600 hover:shadow-violet-500/30 active:scale-[0.99]'} 
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {isCompleting ? "Processing..." : "Mark as Completed & Handover"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-400 font-medium">
              <p>Select a token from the queue to view prescriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
