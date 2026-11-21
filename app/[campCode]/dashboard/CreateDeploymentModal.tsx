"use client";

import { useState } from "react";
import { createDeploymentAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function CreateDeploymentModal({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.append("orgId", orgId);
    
    try {
      const result = await createDeploymentAction(formData);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMessage(result.error || "Failed to create deployment. Please check inputs.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to create deployment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20 transition-all backdrop-blur-md flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        + New Deployment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Create New Deployment</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-medium flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deployment-name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deployment Name</label>
                  <input id="deployment-name" type="text" name="name" required placeholder="e.g. Birla Mobile Eye Camp" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="deployment-campCode" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Camp Code (Unique)</label>
                  <input id="deployment-campCode" type="text" name="campCode" required placeholder="e.g. BIRLA-EYE-01" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 uppercase" />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Initial Staff Provisioning</h3>
                
                {/* DOCTOR */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 mb-4">
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Doctor Credentials
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="docId" defaultValue="DOC01" required placeholder="Staff ID" aria-label="Doctor Staff ID" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 uppercase" />
                    <input type="text" name="docName" required placeholder="Name" aria-label="Doctor Name" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <input type="password" name="docPassword" required minLength={8} placeholder="Password" aria-label="Doctor Password" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* NURSE */}
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 mb-4">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Nurse Credentials
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="nurId" defaultValue="NUR01" required placeholder="Staff ID" aria-label="Nurse Staff ID" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 uppercase" />
                    <input type="text" name="nurName" required placeholder="Name" aria-label="Nurse Name" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                    <input type="password" name="nurPassword" required minLength={8} placeholder="Password" aria-label="Nurse Password" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {/* PHARMACIST */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    Pharmacist Credentials
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="phaId" defaultValue="PHA01" required placeholder="Staff ID" aria-label="Pharmacist Staff ID" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 uppercase" />
                    <input type="text" name="phaName" required placeholder="Name" aria-label="Pharmacist Name" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
                    <input type="password" name="phaPassword" required minLength={8} placeholder="Password" aria-label="Pharmacist Password" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                  {isLoading ? "Provisioning..." : "Provision Deployment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
