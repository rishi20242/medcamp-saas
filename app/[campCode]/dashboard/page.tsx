import { getOrganizationOverviewAction, closeAndWipeCampAction } from "../../actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import DynamicStaffForm from "../../DynamicStaffForm";

export default async function OrganizationDashboard({ params }: { params: { campCode: string } }) {
  const org = await getOrganizationOverviewAction(params.campCode);

  if (!org) {
    redirect("/admin/setup");
  }

  const totalPatients = org.campaigns.reduce((acc: number, camp: any) => acc + camp._count.patients, 0);
  const activeCampaign = org.campaigns.find((c: any) => c.status === "ACTIVE");

  const handleCloseCamp = async () => {
    "use server";
    await closeAndWipeCampAction(params.campCode);
    redirect("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit'] pb-20">
      
      {/* Premium Header */}
      <div className="bg-slate-900 pb-24 pt-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center mb-10 gap-3">
              <Link href="/admin/setup" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20 transition-all backdrop-blur-md">
                Configure New Camp
              </Link>
              {activeCampaign && (
                <form action={handleCloseCamp}>
                  <button type="submit" className="bg-red-500/20 hover:bg-red-500/80 text-red-100 hover:text-white px-4 py-2 rounded-xl text-sm font-bold border border-red-500/30 transition-all backdrop-blur-md">
                    End Camp & Wipe Staff
                  </button>
                </form>
              )}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                {org.name}
              </h1>
              <p className="text-slate-400 text-lg font-medium">Master Administrative Dashboard</p>
            </div>
            {activeCampaign && (
              <div className="hidden md:flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-0.5">Active Deployment</p>
                  <p className="text-white font-bold text-sm">{activeCampaign.campCode} &bull; {activeCampaign.department}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Deployments</p>
              <h3 className="text-3xl font-black text-slate-800">{org.campaigns.length}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Personnel</p>
              <h3 className="text-3xl font-black text-slate-800">{org.staff.length}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Patients Treated</p>
              <h3 className="text-3xl font-black text-slate-800">{totalPatients}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Campaigns Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Deployment History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <th className="p-4 pl-6">Code / Dept</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Patients</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {org.campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No campaigns deployed yet.</td>
                    </tr>
                  ) : (
                    org.campaigns.map((camp: any) => (
                      <tr key={camp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-800 mb-0.5">{camp.campCode}</p>
                          <p className="text-xs text-slate-500 font-medium">{camp.department}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">
                          {new Date(camp.date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-bold">
                            {camp._count.patients}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {camp.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Directory & Provisioning */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Registered Personnel
                </h2>
              </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <th className="p-4 pl-6">Name / Designation</th>
                    <th className="p-4">Staff ID</th>
                    <th className="p-4 pr-6 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {org.staff.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 font-medium">No personnel registered yet.</td>
                    </tr>
                  ) : (
                    org.staff.map((member: any) => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-800 mb-0.5">{member.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{member.designation}</p>
                        </td>
                        <td className="p-4 text-sm font-bold text-indigo-600 font-mono">
                          {member.staffId}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                            ${member.role === 'DOCTOR' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                            ${member.role === 'NURSE' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                            ${member.role === 'PHARMACIST' ? 'bg-violet-50 text-violet-600 border-violet-100' : ''}
                          `}>
                            {member.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <DynamicStaffForm />
        </div>
        </div>

        {activeCampaign && (
          <div className="mt-12">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Terminals & Portals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Link href={`/${params.campCode}/register`} target="_blank" className="group">
                <div className="h-full bg-white dark:bg-neutral-900/60 p-8 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] dark:hover:shadow-[0_8px_30px_rgba(79,70,229,0.2)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Registration Gateway</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Frictionless QR-based registration tailored for mobile access at the entrance.</p>
                </div>
              </Link>

              <Link href={`/${params.campCode}/login`} target="_blank" className="group">
                <div className="h-full bg-white dark:bg-neutral-900/60 p-8 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Staff Portal Login</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Secure authentication gateway for Doctors, Nurses, and Pharmacists.</p>
                </div>
              </Link>

              <Link href={`/${params.campCode}/display`} target="_blank" className="group">
                <div className="h-full bg-white dark:bg-neutral-900/60 p-8 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] dark:hover:shadow-[0_8px_30px_rgba(249,115,22,0.2)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Live Public Queue</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Dynamic, high-visibility public token monitor designed for large screens.</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
