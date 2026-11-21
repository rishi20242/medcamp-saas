"use client";
import { useState, useEffect, useRef } from "react";
import { fetchPharmacyQueue, completeDispensationAction, markOutOfStockAction } from "../../actions";
import { useParams } from "next/navigation";
import { AlertModal, ConfirmModal, PromptModal } from "../../components/UIModal";

export default function PharmacyTerminal() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const selectedPatientRef = useRef<any | null>(null);

  useEffect(() => {
    selectedPatientRef.current = selectedPatient;
  }, [selectedPatient]);

  const [dispensedItems, setDispensedItems] = useState<Record<number, boolean>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const [showConfirmHandover, setShowConfirmHandover] = useState(false);
  const [showPromptStockout, setShowPromptStockout] = useState(false);

  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: "error" | "info" | "success" | "warning" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const params = useParams();
  const campCode = params.campCode as string;

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    selectedPatientRef.current = patient;
    setDispensedItems({});
  };

  const loadQueue = async () => {
    try {
      const patients = await fetchPharmacyQueue(campCode);
      setQueue(patients);
      const currentSelected = selectedPatientRef.current;
      if (patients.length > 0 && !currentSelected) {
        handleSelectPatient(patients[0]);
      } else if (patients.length === 0) {
        setSelectedPatient(null);
        selectedPatientRef.current = null;
      } else if (currentSelected) {
        const stillInQueue = patients.find(p => p.id === currentSelected.id);
        if (!stillInQueue) {
          handleSelectPatient(patients.length > 0 ? patients[0] : null);
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
  }, [campCode]);

  const executeCompleteDispensation = async () => {
    if (!selectedPatient) return;
    setIsCompleting(true);
    setShowConfirmHandover(false);
    try {
      await completeDispensationAction(selectedPatient.id);
      setSelectedPatient(null);
      setDispensedItems({});
      await loadQueue();
    } catch (error) {
      console.error(error);
      setModalState({
        isOpen: true,
        title: "Dispensation Notice",
        message: "Failed to complete dispensation. Please check server status.",
        type: "error"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const executeOutOfStock = async (note: string) => {
    if (!selectedPatient) return;
    setIsCompleting(true);
    setShowPromptStockout(false);
    try {
      await markOutOfStockAction(selectedPatient.id, note || "Out of stock. Alternate prescription requested.");
      setModalState({
        isOpen: true,
        title: "Referred to Doctor",
        message: `Token #${selectedPatient.tokenNumber} has been referred back to the Doctor desk with priority alert.`,
        type: "info"
      });
      setSelectedPatient(null);
      setDispensedItems({});
      await loadQueue();
    } catch (error) {
      console.error(error);
      setModalState({
        isOpen: true,
        title: "Action Interrupted",
        message: "Failed to mark medication out of stock.",
        type: "error"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Extract latest consultation and its prescriptions safely
  const latestConsultation = selectedPatient?.consultations?.[0] || selectedPatient?.consultations?.[selectedPatient.consultations.length - 1];
  let prescriptions: any[] = [];
  try {
    if (latestConsultation?.prescriptions) {
      const parsed = JSON.parse(latestConsultation.prescriptions);
      prescriptions = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error("Failed to parse prescriptions JSON", e);
    prescriptions = [];
  }

  const allDispensed = prescriptions.length > 0 && prescriptions.every((_: any, i: number) => dispensedItems[i]);

  return (
    <div className="flex flex-col h-[82vh] bg-white/60 dark:bg-slate-950/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] max-w-7xl mx-auto overflow-hidden transition-colors">
      <AlertModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <ConfirmModal
        isOpen={showConfirmHandover}
        onCancel={() => setShowConfirmHandover(false)}
        onConfirm={executeCompleteDispensation}
        title="Verify & Handover Medications"
        message={`Are you sure you want to verify and complete medicine handover for Token #${selectedPatient?.tokenNumber} (${selectedPatient?.name})? The consultation will be marked as COMPLETED.`}
        confirmText="Confirm & Handover"
        cancelText="Cancel"
        isLoading={isCompleting}
      />

      <PromptModal
        isOpen={showPromptStockout}
        onCancel={() => setShowPromptStockout(false)}
        onSubmit={executeOutOfStock}
        title="Report Out-of-Stock Medication"
        message="Enter a note or recommended alternative drug for the consulting physician:"
        placeholder="e.g. Paracetamol 500mg exhausted. Suggest Ibuprofen or syrup form."
        confirmText="Refer to Doctor"
        cancelText="Cancel"
        isLoading={isCompleting}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex justify-between items-center shadow-md z-10 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          Pharmacy Dispensation
          <button onClick={loadQueue} type="button" className="ml-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors border border-white/20 shadow-sm" title="Refresh Latest Data" aria-label="Refresh Data">
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
        <div className="w-1/3 border-r border-slate-200/60 dark:border-slate-800 p-5 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Pending Dispensation</h3>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center text-slate-400 font-medium py-10">No prescriptions pending</div>
            ) : (
              queue.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => handleSelectPatient(patient)}
                  className={`group p-5 bg-white dark:bg-slate-900 border ${selectedPatient?.id === patient.id ? 'border-violet-500 shadow-md shadow-violet-500/10' : 'border-slate-100 dark:border-slate-800'} rounded-2xl shadow-sm cursor-pointer hover:border-violet-300 hover:shadow-violet-500/10 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${selectedPatient?.id === patient.id ? 'bg-violet-500' : 'bg-violet-400 transform -translate-x-full group-hover:translate-x-0'} transition-transform duration-300`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-violet-700 dark:text-violet-400 text-lg tracking-tight block">Token #{patient.tokenNumber}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{patient.consultations?.[patient.consultations.length - 1]?.doctorName || "Doctor"}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
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
        <div className="w-2/3 p-8 overflow-y-auto flex flex-col bg-white/40 dark:bg-slate-900/40">
          {selectedPatient ? (
            <>
              <div className="flex justify-between items-start mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">#{selectedPatient.tokenNumber}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {selectedPatient.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</span>
                  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg font-bold text-sm">{latestConsultation?.diagnosis || "--"}</span>
                </div>
              </div>
              
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Prescription Details</h4>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Medicine</th>
                        <th className="p-4 font-bold">Dosage</th>
                        <th className="p-4 font-bold">Duration</th>
                        <th className="p-4 font-bold text-center">Dispensed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {prescriptions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No medications prescribed.</td>
                        </tr>
                      ) : (
                        prescriptions.map((med: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{med.name || med.medicine || "Medication"}</p>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{med.dosage}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{med.days} Days</td>
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox" 
                                id={`dispensed-${index}`}
                                aria-label={`Mark ${med.name || med.medicine} as dispensed`}
                                checked={!!dispensedItems[index]}
                                onChange={(e) => setDispensedItems({...dispensedItems, [index]: e.target.checked})}
                                className="w-6 h-6 text-violet-600 rounded-lg border-slate-300 dark:border-slate-700 focus:ring-violet-500 cursor-pointer accent-violet-600 transition-all" 
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowPromptStockout(true)}
                  disabled={isCompleting}
                  className="flex-1 py-4 rounded-xl font-bold tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 transition-all duration-300 flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Report Out of Stock
                </button>
                <button 
                  type="button"
                  onClick={() => setShowConfirmHandover(true)}
                  disabled={isCompleting || (!allDispensed && prescriptions.length > 0)}
                  className={`flex-1 py-4 rounded-xl font-bold tracking-wide text-white flex justify-center items-center gap-2 transition-all duration-300 
                    ${(!allDispensed && prescriptions.length > 0) ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500 dark:text-slate-400' : 'bg-slate-900 dark:bg-slate-700 shadow-lg shadow-slate-900/20 hover:bg-violet-600 hover:shadow-violet-500/30 active:scale-[0.99]'} 
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {isCompleting ? "Processing..." : "Mark as Completed & Handover"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium">
              <p>Select a token from the queue to view prescriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
