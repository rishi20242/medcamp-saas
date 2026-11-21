"use client";
import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-['Outfit'] transition-colors">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl mx-auto flex items-center justify-center mb-6 ring-8 ring-rose-500/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Service Interruption</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
          The requested operation encountered an unexpected condition. Your session and patient data remain secure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            Retry Action
          </button>
          <Link
            href="/"
            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
