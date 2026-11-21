"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CampError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const campCode = params?.campCode as string;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-['Outfit'] transition-colors">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-3xl mx-auto flex items-center justify-center mb-6 ring-8 ring-amber-500/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Camp Station Notice</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
          Unable to synchronize with deployment station <span className="font-bold text-indigo-500 uppercase">{campCode || "CAMP"}</span>. Please retry or return to the main station dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            Reconnect Station
          </button>
          <Link
            href={campCode ? `/${campCode}/dashboard` : "/"}
            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Station Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
