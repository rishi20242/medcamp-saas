import { getSessionStaff, getActiveCampaignAction } from "../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const staff = await getSessionStaff();
  const campaign = await getActiveCampaignAction();

  if (!staff) {
    redirect("/login");
  }

  if (!campaign) {
    redirect("/admin/setup");
  }

  if (requiredRole && staff.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You do not have the required role ({requiredRole}) to view this page.</p>
          <Link href="/login" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Global Dashboard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-xl">MedCamp <span className="text-indigo-600">OS</span></h1>
            {campaign && (
              <span className="hidden md:inline-block ml-4 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
                {campaign.organizingInstitution}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">{staff.name}</p>
              <p className="text-xs font-medium text-slate-500">{staff.designation}</p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
