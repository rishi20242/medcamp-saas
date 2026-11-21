import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-['Outfit'] transition-colors">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-3xl mx-auto flex items-center justify-center mb-6 ring-8 ring-indigo-500/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
          The requested medical camp station or resource does not exist or has been archived.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Return to Portal
        </Link>
      </div>
    </div>
  );
}
