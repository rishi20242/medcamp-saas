"use client";
import { useState } from "react";
import { provisionMidCampStaffAction } from "./actions";
import { useParams } from "next/navigation";

export default function DynamicStaffForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const campCode = params.campCode as string;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("campCode", campCode);
      const password = formData.get("password") as string;
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
      
      if (password.length < 8 || !passwordRegex.test(password)) {
        alert("Password must be at least 8 characters long and contain both letters and numbers.");
        setIsSubmitting(false);
        return;
      }

      const res = await provisionMidCampStaffAction(formData);
      if (!res.success) {
        alert(res.error || "Failed to provision staff");
      } else {
        alert("Staff successfully provisioned!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to provision staff.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col p-6 mt-8">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Dynamic Staff Provisioning (Mid-Camp)
        </h2>
        <p className="text-slate-500 text-sm mt-1">Quickly onboard replacement or extra personnel without disrupting the active camp session.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
            <select name="role" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="PHARMACIST">Pharmacist</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" name="name" required placeholder="Dr. Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Designation</label>
            <input type="text" name="designation" required placeholder="Senior Specialist" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Staff ID (Login ID)</label>
            <input type="text" name="staffId" required placeholder="e.g. DOC-999" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" name="password" required placeholder="Min 8 chars, Letters & Numbers" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all active:scale-95 disabled:opacity-70 mt-2"
        >
          {isSubmitting ? "Provisioning..." : "Provision Staff Member"}
        </button>
      </form>
    </div>
  );
}
