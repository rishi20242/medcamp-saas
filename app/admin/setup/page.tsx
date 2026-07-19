"use client";
import { useState } from "react";
import { initializeCampAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deployedCamp, setDeployedCamp] = useState<{campCode: string} | null>(null);
  const router = useRouter();

  const [staffList, setStaffList] = useState([
    { name: "", role: "DOCTOR", staffId: "", password: "", designation: "" },
    { name: "", role: "NURSE", staffId: "", password: "", designation: "" },
    { name: "", role: "PHARMACIST", staffId: "", password: "", designation: "" }
  ]);

  const handleStaffChange = (index: number, field: string, value: string) => {
    const updated = [...staffList];
    if (field === "role") {
      updated[index] = { ...updated[index], [field]: value, designation: "" };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setStaffList(updated);
  };

  const addStaffRow = () => {
    setStaffList([...staffList, { name: "", role: "DOCTOR", staffId: "", password: "", designation: "" }]);
  };

  const removeStaffRow = (index: number) => {
    const updated = [...staffList];
    updated.splice(index, 1);
    setStaffList(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    for (const staff of staffList) {
      if (staff.password.length < 8) {
        alert(`Password for ${staff.name || "staff"} must be at least 8 characters long.`);
        return;
      }
      if (!passwordRegex.test(staff.password)) {
        alert(`Password for ${staff.name || "staff"} must contain both letters and numbers.`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("staffData", JSON.stringify(staffList));
      const result = await initializeCampAction(formData);
      setDeployedCamp(result);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize camp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (deployedCamp) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative text-center font-['Outfit']">
        <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-12 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Camp Deployed!</h2>
          <p className="text-slate-400 font-medium mb-8 text-lg">Your medical camp infrastructure is now live.</p>
          
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 mb-10 shadow-inner">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-violet-400 tracking-tighter drop-shadow-sm">
                {deployedCamp.campCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(deployedCamp.campCode);
                  alert("Camp Code copied to clipboard!");
                }}
                className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-indigo-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Code
              </button>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Important: Distribute this code to your staff and patients.
            </p>
          </div>
          
          <button 
            onClick={() => router.push(`/${deployedCamp.campCode}/dashboard`)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-xl font-black text-lg transition-all shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.4)] w-full flex items-center justify-center gap-3 hover:-translate-y-1"
          >
            Enter Organization Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 py-12 relative font-['Outfit']">
      <div className="max-w-4xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome to MedCamp Organizer</h1>
          <p className="text-slate-400 mt-2 font-medium">Configure active camp parameters & personnel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Institution Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Organizing Hospital / Medical College <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="organizingInstitution"
                  required
                  placeholder="e.g. Apollo Medical College"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chief Organizer Name & Title <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="chiefOrganizer"
                  required
                  placeholder="e.g. Dr. A. Sharma, Dean"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Camp Department <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select 
                    name="department"
                    required
                    defaultValue="General Medicine"
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Dental">Dental</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h2 className="text-xl font-bold text-white">Staff Onboarding</h2>
              <button 
                type="button" 
                onClick={addStaffRow}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Staff Member
              </button>
            </div>
            
            <div className="space-y-4">
              {staffList.map((staff, idx) => (
                <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 relative">
                  {staffList.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeStaffRow(idx)}
                      className="absolute -top-3 -right-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full p-1.5 transition-colors border border-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
                      <select 
                        value={staff.role}
                        onChange={(e) => handleStaffChange(idx, "role", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="DOCTOR">Doctor</option>
                        <option value="NURSE">Nurse</option>
                        <option value="PHARMACIST">Pharmacist</option>
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={staff.name}
                        onChange={(e) => handleStaffChange(idx, "name", e.target.value)}
                        placeholder="Dr. John Doe"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Designation</label>
                      <select 
                        required
                        value={staff.designation}
                        onChange={(e) => handleStaffChange(idx, "designation", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="" disabled>Select</option>
                        {staff.role === "DOCTOR" && (
                          <>
                            <option value="General Physician">General Physician</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="Surgeon">Surgeon</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Specialist">Specialist</option>
                          </>
                        )}
                        {staff.role === "NURSE" && (
                          <>
                            <option value="Head Triage Nurse">Head Triage Nurse</option>
                            <option value="Assisting Nurse">Assisting Nurse</option>
                            <option value="Staff Nurse">Staff Nurse</option>
                          </>
                        )}
                        {staff.role === "PHARMACIST" && (
                          <>
                            <option value="Lead Pharmacist">Lead Pharmacist</option>
                            <option value="Assistant Pharmacist">Assistant Pharmacist</option>
                            <option value="Dispenser">Dispenser</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Staff ID</label>
                      <input 
                        type="text" 
                        required
                        value={staff.staffId}
                        onChange={(e) => handleStaffChange(idx, "staffId", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="DOC01"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                      <input 
                        type="password" 
                        required
                        value={staff.password}
                        onChange={(e) => handleStaffChange(idx, "password", e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 text-lg"
          >
            {isSubmitting ? "Provisioning System & Staff..." : "Initialize Camp System"}
            {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          </button>
        </form>
      </div>
    </div>
  );
}
