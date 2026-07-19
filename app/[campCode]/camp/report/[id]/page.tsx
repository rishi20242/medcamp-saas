"use client";

import { useEffect, useState } from "react";
import { getPatientReportAction } from "../../../../actions";

export default function ReportPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getPatientReportAction(params.id);
        if (data && data.status === "COMPLETED") {
          setPatient(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-500 animate-pulse">Loading Report...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-red-500">Report not found or incomplete.</div>
      </div>
    );
  }

  const consultation = patient.consultations?.[0];
  const prescriptions = consultation?.prescriptions ? JSON.parse(consultation.prescriptions) : [];
  const campaign = patient.campaign;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-10 shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:p-0">
        
        {/* Header - Organizing Institution */}
        <div className="text-center border-b-2 border-indigo-600 pb-6 mb-8 relative">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            {campaign.organizingInstitution}
          </h1>
          <p className="text-slate-600 font-bold mt-1 uppercase tracking-widest text-sm">
            {campaign.department} Medical Camp
          </p>
          <p className="text-slate-500 font-medium mt-3 text-xs">
            Chief Organizer: {campaign.chiefOrganizer}
          </p>
          <div className="absolute -top-6 -left-6 hidden print:block">
            {/* Logo placeholder for print */}
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">LOGO</div>
          </div>
        </div>

        {/* Sub Header */}
        <div className="flex justify-between items-center mb-10 bg-indigo-50/50 p-6 rounded-2xl print:bg-transparent print:p-0 print:mb-6 border border-indigo-100 print:border-none">
          <div>
            <h2 className="text-2xl font-black text-indigo-700 uppercase tracking-wide">Patient Medical Report</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">Token #{patient.tokenNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
            <p className="font-bold text-slate-800 text-lg">{new Date(campaign.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-2">Patient Information</h3>
            <p className="text-2xl font-bold text-slate-900 mb-1">{patient.name}</p>
            <p className="text-slate-600 font-medium">{patient.age} Years &bull; {patient.gender}</p>
            <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {patient.phone || "Not Provided"}
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 print:border-slate-300 print:bg-transparent">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-b border-indigo-100 pb-2">Recorded Vitals</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Height / Weight</p>
                <p className="font-bold text-slate-800">{patient.height || "--"} cm / {patient.weight || "--"} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BP / Pulse</p>
                <p className="font-bold text-slate-800">{patient.bloodPressure || "--"} / {patient.pulse || "--"} bpm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Info */}
        {consultation && (
          <div className="mb-10">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-b border-indigo-100 pb-2">Clinical Details</h3>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl print:bg-transparent print:p-0 print:border-none border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Screening Notes / Symptoms</p>
                <p className="text-slate-800 font-medium leading-relaxed">{consultation.symptoms || "None recorded"}</p>
              </div>
              <div className="bg-indigo-50/50 p-5 rounded-2xl print:bg-transparent print:p-0 print:border-none border border-indigo-100">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Final Diagnosis</p>
                <p className="text-xl font-bold text-indigo-900">{consultation.diagnosis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions */}
        <div className="mb-12">
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-b border-indigo-100 pb-2">Prescription & Dispensation</h3>
          {prescriptions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 print:border-none">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 print:bg-transparent">
                  <tr>
                    <th className="py-4 px-5 font-black text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">Medicine</th>
                    <th className="py-4 px-5 font-black text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">Dosage</th>
                    <th className="py-4 px-5 font-black text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((med: any, idx: number) => (
                    <tr key={idx} className="print:border-b print:border-slate-200">
                      <td className="py-4 px-5 font-bold text-slate-800">{med.name}</td>
                      <td className="py-4 px-5 text-slate-600 font-bold bg-slate-50/50 print:bg-transparent">{med.dosage}</td>
                      <td className="py-4 px-5 text-slate-600 font-medium">{med.days} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl">No medicines prescribed during this consultation.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-slate-800 grid grid-cols-2 items-end">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Treating Physician</p>
            <p className="text-lg font-black text-slate-900">{consultation?.doctor?.name || consultation?.doctorName}</p>
            <p className="text-sm font-bold text-slate-500">{consultation?.doctor?.designation || "Medical Officer"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">MedCamp<span className="text-indigo-600">OS</span></p>
          </div>
        </div>

        {/* Print Button (Hidden in Print View) */}
        <div className="mt-12 text-center print:hidden flex justify-center pb-8">
          <button 
            onClick={() => window.print()}
            className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-xl hover:shadow-indigo-500/30 active:scale-95 w-full sm:w-auto"
          >
            <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Official Report
          </button>
        </div>
      </div>
    </div>
  );
}
