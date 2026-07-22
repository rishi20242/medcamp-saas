"use client";
import { useState, useEffect } from "react";
import { registerPatientAction, updatePatientAction, clearPatientCookieAction, fetchPatientByCampTokenAction } from "../../actions";

export default function RegisterClient({ campCode, initialPatient }: { campCode: string, initialPatient?: any }) {
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    contactName: "",
    contactPhone: "",
    height: "",
    weight: "",
    allergies: "",
    surgeries: "",
    medications: ""
  });

  const [hasAllergies, setHasAllergies] = useState<boolean | null>(null);
  const [hasSurgeries, setHasSurgeries] = useState<boolean | null>(null);
  const [hasMedications, setHasMedications] = useState<boolean | null>(null);

  // Submission State
  const [registeredPatient, setRegisteredPatient] = useState<any>(initialPatient || null);
  const [submittedToken, setSubmittedToken] = useState<number | null>(initialPatient ? initialPatient.tokenNumber : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(initialPatient ? initialPatient.id : null);

  const [retrieveTokenStr, setRetrieveTokenStr] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);

  useEffect(() => {
    // 1. Trap Back Button (prevent navigating away if user hits back)
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    // 2. BeforeUnload Warning (Confirm form resubmission / data loss)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = Object.values(formData).some(val => val.length > 0);
      if (isDirty && !registeredPatient) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, registeredPatient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [duplicateError, setDuplicateError] = useState<{message: string, patient: any} | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Restrict strictly to numbers and cap at 10 digits
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setFormData({ ...formData, contactPhone: val });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (hasAllergies === null || hasSurgeries === null || hasMedications === null) {
      alert("Please specify 'Yes' or 'No' for all Medical History questions before generating a token.");
      return;
    }

    setIsSubmitting(true);
    setDuplicateError(null);
    try {
      const data = new FormData(e.currentTarget);
      
      let result;
      if (isEditing && editingPatientId) {
        result = await updatePatientAction(editingPatientId, data);
      } else {
        result = await registerPatientAction(campCode, data);
      }
      
      if (result.success) {
        setSubmittedToken(result.tokenNumber as number);
        setRegisteredPatient(result.patient);
      } else if (result.patient) {
        setDuplicateError({ message: (result as any).error!, patient: result.patient });
      } else if ((result as any).error?.includes("initialized")) {
        alert("System not initialized! Redirecting to setup.");
        window.location.href = "/admin/setup";
      } else {
        alert((result as any).error || "Registration failed. Please check logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please check logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModifyInfo = () => {
    if (!duplicateError) return;
    const { patient } = duplicateError;
    const nameParts = patient.name.split(" ");
    
    setFormData({
      ...formData,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      age: patient.age.toString(),
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || "",
      phone: patient.phone || "",
      height: patient.height?.toString() || "",
      weight: patient.weight?.toString() || "",
      contactName: (patient as any).contactName || "",
      contactPhone: (patient as any).contactPhone || "",
    });
    setIsEditing(true);
    setEditingPatientId(patient.id);
    setDuplicateError(null);
  };

  const handleEditRegistered = () => {
    if (!registeredPatient) return;
    const nameParts = registeredPatient.name.split(" ");
    
    setFormData({
      ...formData,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      age: registeredPatient.age.toString(),
      gender: registeredPatient.gender,
      phone: registeredPatient.phone || "",
      height: registeredPatient.height?.toString() || "",
      weight: registeredPatient.weight?.toString() || "",
      contactName: (registeredPatient as any).contactName || "",
      contactPhone: (registeredPatient as any).contactPhone || "",
    });
    setIsEditing(true);
    setEditingPatientId(registeredPatient.id);
    setSubmittedToken(null);
  };

  if (submittedToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-4">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[2rem] p-10 border border-white relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Registration Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your camp token number is:</p>
          
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-indigo-800 drop-shadow-sm mb-10">
            {submittedToken}
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
            <p className="text-indigo-800 font-bold text-lg mb-1 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Live Status
            </p>
            <p className="text-indigo-600 font-medium">
              {registeredPatient?.status === "REGISTERED" && "Please proceed to the Nurse Counter for your fundamental vitals check."}
              {registeredPatient?.status === "DOCTOR" && "Vitals recorded. Please wait for your doctor consultation."}
              {registeredPatient?.status === "PHARMACIST" && "Consultation complete. Proceed to Pharmacy to collect medicines."}
              {registeredPatient?.status === "COMPLETED" && "Your medical camp journey is complete. Thank you!"}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 mt-8">
            <button 
              onClick={handleEditRegistered}
              className="text-amber-600 font-bold hover:text-amber-700 transition-colors bg-amber-50 py-3 px-6 rounded-xl border border-amber-200 shadow-sm"
            >
              Notice a mistake? Click here to edit your response
            </button>
            <button 
              onClick={async () => { 
                await clearPatientCookieAction();
                setSubmittedToken(null); 
                setIsEditing(false);
                setEditingPatientId(null);
                setRegisteredPatient(null);
                setFormData({firstName:"", lastName:"", age:"", gender:"", bloodGroup:"", phone:"", contactName:"", contactPhone:"", height:"", weight:"", allergies:"", surgeries:"", medications:""}); 
              }}
              className="text-slate-500 font-bold hover:text-slate-800 transition-colors py-2"
            >
              Register Another Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Patient Onboarding</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base">Complete your medical profile for faster consultation.</p>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-none rounded-[2rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {duplicateError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
            <p className="text-red-700 font-medium">{duplicateError.message}</p>
            <button 
              onClick={handleModifyInfo}
              className="mt-2 text-sm font-bold text-red-600 hover:text-red-800 underline transition-colors"
            >
              Click here to pre-fill your existing info
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 mt-2" autoComplete="off">
          
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-3">1</span>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="Rahul" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="Kumar" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Age <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="e.g. 34" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Gender <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Blood Group</label>
                <div className="flex flex-wrap gap-2">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${formData.bloodGroup === bg ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:border-indigo-200'}`}
                    >
                      {bg}
                    </button>
                  ))}
                  <input type="hidden" name="bloodGroup" value={formData.bloodGroup} />
                </div>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="10-digit number" 
                />
              </div>

              {/* Vitals Addition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Height (cm)</label>
                <input 
                  type="number" 
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="e.g. 175" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="e.g. 70" 
                />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-r-xl shadow-sm">
                  <p className="font-medium text-sm flex items-start gap-2">
                    <span className="text-lg">⚠️</span> 
                    <span>Don't know your height or weight? No worries! You can skip these fields and get a free check-up directly at our Camp Triage counter.</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

          {/* Section 2: Emergency Contact */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs mr-3">2</span>
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Name</label>
                <input 
                  type="text" 
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="Guardian / Relative Name" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Emergency Phone</label>
                <input 
                  type="tel" 
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleContactPhoneChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white transition-all duration-300 shadow-sm" 
                  placeholder="10-digit number" 
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

          {/* Section 3: Medical History (Toggle UX) */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs mr-3">3</span>
              Medical History
            </h3>
            <div className="space-y-6">
              
              {/* Allergies Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Any known allergies?</label>
                    <span className="text-xs text-slate-500">Food, medications, environmental</span>
                  </div>
                  <div className="flex bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-xl w-fit">
                    <button 
                      type="button"
                      onClick={() => setHasAllergies(true)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasAllergies === true ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setHasAllergies(false); setFormData({...formData, allergies: ""}); }}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasAllergies === false ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
                {hasAllergies && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-sm" 
                      placeholder="Please specify your allergies..." 
                    />
                  </div>
                )}
              </div>

              {/* Surgeries Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Any past surgeries?</label>
                    <span className="text-xs text-slate-500">Major procedures or operations</span>
                  </div>
                  <div className="flex bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-xl w-fit">
                    <button 
                      type="button"
                      onClick={() => setHasSurgeries(true)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasSurgeries === true ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setHasSurgeries(false); setFormData({...formData, surgeries: ""}); }}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasSurgeries === false ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
                {hasSurgeries && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      name="surgeries"
                      value={formData.surgeries}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm" 
                      placeholder="Please specify past surgeries..." 
                    />
                  </div>
                )}
              </div>

              {/* Medications Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Taking current medications?</label>
                    <span className="text-xs text-slate-500">Prescription or over-the-counter</span>
                  </div>
                  <div className="flex bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-xl w-fit">
                    <button 
                      type="button"
                      onClick={() => setHasMedications(true)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasMedications === true ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setHasMedications(false); setFormData({...formData, medications: ""}); }}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${hasMedications === false ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
                {hasMedications && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="text" 
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm" 
                      placeholder="Please list current medications..." 
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-10 bg-slate-900 text-white py-4 rounded-xl font-bold tracking-wide text-lg shadow-lg shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-[0.99] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? "Generating..." : (isEditing ? "Update Registered Info & Keep Token" : "Generate Camp Token")}
            {!isSubmitting && !isEditing && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </form>

        {!registeredPatient && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <p className="text-sm font-bold text-slate-500 mb-3">Wanna change the info? Please enter your token number</p>
            <div className="flex gap-2">
              <input 
                type="number"
                value={retrieveTokenStr}
                onChange={(e) => setRetrieveTokenStr(e.target.value)}
                placeholder="Token #"
                className="w-24 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-center focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-bold"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!retrieveTokenStr) return;
                  setIsRetrieving(true);
                  const res = await fetchPatientByCampTokenAction(campCode, parseInt(retrieveTokenStr));
                  if (res.success && res.patient) {
                     const patient = res.patient;
                     const nameParts = patient.name.split(" ");
                     setFormData({
                       firstName: nameParts[0] || "",
                       lastName: nameParts.slice(1).join(" ") || "",
                       age: patient.age.toString(),
                       gender: patient.gender,
                       bloodGroup: patient.bloodGroup || "",
                       phone: patient.phone || "",
                       contactName: (patient as any).contactName || "",
                       contactPhone: (patient as any).contactPhone || "",
                       height: patient.height?.toString() || "",
                       weight: patient.weight?.toString() || "",
                       allergies: patient.allergies || "",
                       surgeries: patient.pastSurgeries || "",
                       medications: patient.currentMedications || ""
                     });
                     setHasAllergies(!!patient.allergies);
                     setHasSurgeries(!!patient.pastSurgeries);
                     setHasMedications(!!patient.currentMedications);
                     setIsEditing(true);
                     setEditingPatientId(patient.id);
                     setRetrieveTokenStr("");
                  } else {
                     alert("Token not found for this camp.");
                  }
                  setIsRetrieving(false);
                }}
                disabled={isRetrieving}
                className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isRetrieving ? "..." : "Retrieve"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
