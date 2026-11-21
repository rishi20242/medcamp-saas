import { getSessionStaff, getActiveCampaignAction } from "../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({ 
  children, 
  requiredRole,
  campCode 
}: { 
  children: React.ReactNode, 
  requiredRole?: string,
  campCode?: string 
}) {
  const staff = await getSessionStaff();
  const campaign = await getActiveCampaignAction(campCode);

  if (!staff) {
    redirect(campCode ? `/${campCode}/login` : "/");
  }

  if (requiredRole && staff.role !== requiredRole) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors p-4">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            You are signed in as a <strong className="uppercase">{staff.role}</strong>, but this terminal requires <strong className="uppercase">{requiredRole}</strong> clearance.
          </p>
          <Link href={campCode ? `/${campCode}/login` : "/"} className="inline-block bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-md">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      {/* Workspace Subheader Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
              {campaign?.organizingInstitution || "Medical Camp Deployment"}
            </span>
            {campaign && (
              <span className="hidden sm:inline-block text-[11px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                {campaign.campCode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{staff.name}</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{staff.designation || staff.role}</p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
