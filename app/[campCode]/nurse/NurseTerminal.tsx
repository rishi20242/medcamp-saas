"use client";
import { useState, useEffect } from "react";
import { fetchTriagePatient, updateVitalsAction, fetchNurseQueue } from "../../actions";
import { useParams } from "next/navigation";

export default function NurseTriageTerminal() {
  const [searchToken, setSearchToken] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [patientFound, setPatientFound] = useState(false);
  const [vitalsSaved, setVitalsSaved] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [queue, setQueue] = useState<any[]>([]);

  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    bloodPressure: "",
    pulse: ""
  });

  const params = useParams();
  const campCode = params.campCode as string;

  const refreshQueue = async () => {
    try {
      const patients = await fetchNurseQueue(campCode);
      setQueue(patients);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const selectPatientFromQueue = (patient: any) => {
    setSearchToken(patient.tokenNumber.toString());
    setPatientData(patient);
    setPatientFound(true);
    setVitalsSaved(false);
    setVitals({
      height: patient.height?.toString() || "",
      weight: patient.weight?.toString() || "",
      bloodPressure: patient.bloodPressure || "",
      pulse: patient.pulse?.toString() || ""
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchToken.trim() !== "") {
      setIsSearching(true);
      try {
        const patient = await fetchTriagePatient(campCode, parseInt(searchToken, 10));
        if (patient) {
          selectPatientFromQueue(patient);
        } else {
          alert("Patient not found or not in TRIAGE/REGISTERED status.");
          setPatientFound(false);
        }
      } catch (error) {
        console.error(error);
        alert("Error fetching patient.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSaveVitals = async () => {
    setIsSaving(true);
    try {
      await updateVitalsAction(campCode, parseInt(searchToken, 10), vitals);
      setVitalsSaved(true);
      refreshQueue(); // Refresh the queue to remove the processed patient
    } catch (error) {
      console.error(error);
      alert("Failed to save vitals.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-row h-[85vh] max-w-7xl mx-auto gap-6">
      
      {/* Sidebar Queue */}
      <div className="w-1/3 bg-white/60 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex justify-between items-center shadow-md z-10 relative">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Active Registration Queue
          </h2>
          <button onClick={refreshQueue} className="text-white hover:text-amber-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {queue.length === 0 ? (
            <p className="text-slate-400 text-center font-medium mt-10">No patients waiting in queue.</p>
          ) : (
            queue.map((p) => (
              <div 
                key={p.id}
                onClick={() => selectPatientFromQueue(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  patientData?.id === p.id 
                    ? "border-amber-400 bg-amber-50 shadow-md" 
                    : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-lg">{p.name}</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg">#{p.tokenNumber}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {p.age} Yrs &bull; {p.gender} &bull; {p.phone || "No Phone"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Terminal */}
      <div className="flex-grow flex flex-col bg-white/60 backdrop-blur-xl border border-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white/80 p-6 flex justify-between items-center shadow-sm z-10 relative border-b border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            Triage & Vitals Counter
            <button onClick={refreshQueue} type="button" className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors border border-slate-200 shadow-sm" title="Refresh Latest Data">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </h2>
        </div>

        <div className="p-8 flex-grow overflow-y-auto">
          {/* Search Section */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-grow">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Search Patient by Token</label>
                <input 
                  type="text" 
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all duration-300" 
                  placeholder="Enter Token ID (e.g. 105)" 
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="bg-amber-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-600 active:scale-95 transition-all shadow-sm disabled:opacity-70"
                >
                  {isSearching ? "..." : "Lookup"}
                </button>
              </div>
            </form>
          </div>

          {/* Patient Details & Vitals Form */}
          {patientFound && !vitalsSaved && patientData && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <span className="text-amber-500">#{patientData.tokenNumber}</span>
                      {patientData.name}
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">{patientData.age} Yrs &bull; {patientData.gender} &bull; General Checkup</p>
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-200">
                    Status: {patientData.status}
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Record Fundamental Vitals</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Height (cm)</label>
                      <input 
                        type="number" 
                        name="height"
                        value={vitals.height}
                        onChange={handleVitalsChange}
                        className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all" 
                        placeholder="e.g. 175" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={vitals.weight}
                        onChange={handleVitalsChange}
                        className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all" 
                        placeholder="e.g. 70" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Blood Pressure (mmHg)</label>
                      <input 
                        type="text" 
                        name="bloodPressure"
                        value={vitals.bloodPressure}
                        onChange={handleVitalsChange}
                        className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all" 
                        placeholder="e.g. 120/80" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Pulse (bpm)</label>
                      <input 
                        type="number" 
                        name="pulse"
                        value={vitals.pulse}
                        onChange={handleVitalsChange}
                        className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all" 
                        placeholder="e.g. 72" 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveVitals}
                    disabled={isSaving}
                    className="w-full mt-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold tracking-wide text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.99] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save Vitals & Send to Doctor"}
                    {!isSaving && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {vitalsSaved && patientData && (
            <div className="max-w-2xl mx-auto text-center mt-12 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">Vitals Recorded Successfully</h3>
              <p className="text-slate-500 mb-8 font-medium text-lg">Patient #{patientData.tokenNumber} has been moved to the Doctor's Queue.</p>
              <button 
                onClick={() => { setPatientFound(false); setSearchToken(""); setVitals({height:"", weight:"", bloodPressure:"", pulse:""}); setPatientData(null); }}
                className="text-amber-600 font-bold hover:text-amber-700 hover:underline underline-offset-4"
              >
                Scan Next Patient
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
