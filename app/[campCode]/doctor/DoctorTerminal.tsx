"use client";
import { useState, useEffect } from "react";
import { fetchDoctorQueue, submitPrescriptionAction } from "../../actions";
import { useParams } from "next/navigation";

export default function DoctorTerminal() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Clinical State
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  
  // Prescription State
  const [prescriptions, setPrescriptions] = useState<{name: string, dosage: string, days: string}[]>([]);
  const [newDrug, setNewDrug] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newDays, setNewDays] = useState("");

  const [snippets, setSnippets] = useState<string[]>(["Viral Fever", "Common Cold", "URTI", "Hypertension", "Gastroenteritis"]);
  const commonSymptoms = ["Fever", "Cough", "Cold", "Body Ache", "Headache"];
  const stockMedicines = ["Paracetamol 500mg", "Ibuprofen 400mg", "Amoxicillin 250mg", "Cetirizine 10mg", "ORS Sachet", "Antacid Gel"];

  const [showCustomSymptom, setShowCustomSymptom] = useState(false);
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const [showCustomDrug, setShowCustomDrug] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddCustomSymptom = () => {
    if (customSymptomInput.trim() !== "") {
      setSymptoms(symptoms ? `${symptoms}, ${customSymptomInput}` : customSymptomInput);
      setCustomSymptomInput("");
      setShowCustomSymptom(false);
    }
  };

  const params = useParams();
  const campCode = params.campCode as string;

  const loadQueue = async () => {
    setIsRefreshing(true);
    try {
      const patients = await fetchDoctorQueue(campCode);
      setQueue(patients);
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0]);
      } else if (patients.length === 0) {
        setSelectedPatient(null);
      } else {
        // If selected patient is no longer in queue, deselect
        const stillInQueue = patients.find(p => p.id === selectedPatient?.id);
        if (!stillInQueue) {
          setSelectedPatient(patients.length > 0 ? patients[0] : null);
        }
      }
    } catch (error) {
      console.error("Failed to load queue", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000); // Polling every 5s for live updates
    return () => clearInterval(interval);
  }, [selectedPatient]); // Added dependency to handle auto-selection properly

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDrug.trim() !== "") {
      if (!newDosage || newDosage.trim() === "") {
        alert("Dosage is required before adding a prescription.");
        return;
      }
      setPrescriptions([...prescriptions, { name: newDrug, dosage: newDosage, days: newDays }]);
      setNewDrug("");
      setNewDosage("");
      setNewDays("");
    }
  };

  const removePrescription = (indexToRemove: number) => {
    setPrescriptions(prescriptions.filter((_, index) => index !== indexToRemove));
  };

  const handleEndConsultation = async () => {
    if (!selectedPatient) return;
    
    const confirmTransfer = window.confirm("Confirm patient transfer to Pharmacy counter? You can click OK to proceed or Cancel to modify the response.");
    if (!confirmTransfer) return;

    setIsSubmitting(true);
    try {
      await submitPrescriptionAction(selectedPatient.id, {
        symptoms,
        diagnosis,
        medicines: prescriptions
      });
      // Clear form
      setSymptoms("");
      setDiagnosis("");
      setPrescriptions([]);
      setSelectedPatient(null);
      // Reload queue
      await loadQueue();
    } catch (error) {
      console.error(error);
      alert("Failed to submit consultation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[82vh] gap-6 max-w-7xl mx-auto transition-colors">
      {/* Sidebar: Patient Queue */}
      <div className="w-1/3 flex flex-col bg-white/60 dark:bg-slate-950/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white/40 dark:bg-slate-900/80 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Queue
            <button onClick={loadQueue} disabled={isRefreshing} type="button" className="ml-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 p-1.5 rounded-xl transition-colors border border-slate-200 dark:border-slate-600 shadow-sm disabled:opacity-50" title="Refresh Latest Data">
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{queue.length} Pending</span>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-grow scrollbar-hide">
          {queue.length === 0 ? (
            <div className="text-center text-slate-400 font-medium py-10">No patients in queue</div>
          ) : (
            queue.map((patient) => (
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatient(patient)}
                className={`group p-4 bg-white dark:bg-slate-900 border ${selectedPatient?.id === patient.id ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-700'} rounded-2xl cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${selectedPatient?.id === patient.id ? 'bg-emerald-500' : 'bg-emerald-400 transform -translate-x-full group-hover:translate-x-0'} transition-transform duration-300`}></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">Token #{patient.tokenNumber}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">Waiting</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{patient.name} &bull; {patient.age} Yrs &bull; {patient.gender.charAt(0)}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Main Area: Consultation */}
      <div className="w-2/3 flex flex-col bg-white/60 dark:bg-slate-950/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-colors">
        {selectedPatient ? (
          <>
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-white/40 dark:bg-slate-900/80 flex justify-between items-center transition-colors">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Token #{selectedPatient.tokenNumber}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {selectedPatient.name} &bull; {selectedPatient.age} Yrs &bull; {selectedPatient.gender}
                </p>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-grow space-y-8">
              
              {/* Medical History Panel */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm transition-colors">
                <h3 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Patient Medical Background (Self-Reported)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Allergies</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPatient.allergies || "None reported"}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Past Surgeries</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPatient.pastSurgeries || "None reported"}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Current Medications</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPatient.currentMedications || "None reported"}</p>
                  </div>
                </div>
              </div>

              {/* New Vitals / Fundamental Measures Panel */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm transition-colors">
                <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Vitals & Fundamental Measures (From Triage)
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3 transition-colors">
                    <span className="text-amber-500 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/50 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Height</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPatient.height || "--"} <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">cm</span></p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3 transition-colors">
                    <span className="text-amber-500 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/50 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg></span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Weight</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPatient.weight || "--"} <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">kg</span></p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3 transition-colors">
                    <span className="text-amber-500 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/50 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">BP</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPatient.bloodPressure || "--"} <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">mmHg</span></p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3 transition-colors">
                    <span className="text-rose-500 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/50 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pulse</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedPatient.pulse || "--"} <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">bpm</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Symptoms (Screening Notes)</label>
                
                <div className="flex flex-wrap gap-2 items-center">
                  {commonSymptoms.map((sym, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => setSymptoms(symptoms ? `${symptoms}, ${sym}` : sym)}
                      className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-1.5 px-3 rounded-full transition-colors border border-slate-200 dark:border-slate-600 shadow-sm"
                    >
                      {sym}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomSymptom(!showCustomSymptom)}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors shadow-sm"
                    title="Add Custom Symptom"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>

                {showCustomSymptom && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input 
                      type="text" 
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSymptom())}
                      className="flex-grow rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-3 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100 transition-all text-sm shadow-sm" 
                      placeholder="Type custom symptom..." 
                    />
                    <button 
                      type="button"
                      onClick={handleAddCustomSymptom}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                    >
                      Add
                    </button>
                  </div>
                )}

                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 shadow-inner" 
                  rows={2} 
                  placeholder="Selected symptoms will appear here..." 
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Diagnosis</label>
                  <div className="flex gap-2 flex-wrap justify-end max-w-sm">
                    {snippets.map((snip, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setDiagnosis(diagnosis ? `${diagnosis}, ${snip}` : snip)}
                        className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-md transition-colors"
                      >
                        +{snip}
                      </button>
                    ))}
                  </div>
                </div>
                <input 
                  type="text" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 shadow-inner" 
                  placeholder="Enter diagnosis (e.g., Viral Fever)" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center justify-between">
                  Prescriptions
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-normal normal-case">Integrated Pharmacy DB</span>
                </label>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 transition-colors">
                  <form onSubmit={handleAddPrescription} className="flex space-x-3">
                    {!showCustomDrug ? (
                      <select
                        value={newDrug}
                        onChange={(e) => setNewDrug(e.target.value)}
                        className="flex-grow rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-3 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm shadow-sm text-slate-700 dark:text-slate-200"
                      >
                        <option value="">Select Stock Medicine</option>
                        {stockMedicines.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={newDrug}
                        onChange={(e) => setNewDrug(e.target.value)}
                        className="flex-grow rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-3 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm shadow-sm text-slate-900 dark:text-slate-100" 
                        placeholder="Type unlisted custom drug..." 
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCustomDrug(!showCustomDrug)}
                      className="px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold transition-colors shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-600"
                      title="Toggle Custom/Stock Medicine"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <input 
                      type="text" 
                      value={newDosage}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.length === 3 && /^\d{3}$/.test(val)) {
                          val = val.split('').join('-');
                        }
                        setNewDosage(val);
                      }}
                      className="w-24 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm shadow-sm placeholder:text-red-300 dark:placeholder:text-red-400" 
                      placeholder="Dosage *" 
                      required
                    />
                    <input 
                      type="text" 
                      value={newDays}
                      onChange={(e) => setNewDays(e.target.value)}
                      className="w-24 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm shadow-sm" 
                      placeholder="Days" 
                    />
                    <button 
                      type="submit"
                      className="bg-slate-800 dark:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-sm text-sm"
                    >
                      Add
                    </button>
                  </form>
                  
                  <div className="pt-2">
                    <ul className="space-y-2">
                      {prescriptions.map((med, index) => (
                        <li key={index} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{med.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{med.dosage} &bull; {med.days} Days</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removePrescription(index)}
                            className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white/40 dark:bg-slate-900/80 flex justify-end transition-colors">
              <button 
                onClick={handleEndConsultation}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold tracking-wide hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Send to Pharmacy"}
                {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium">
            <p>Select a patient from the queue</p>
          </div>
        )}
      </div>
    </div>
  );
}

