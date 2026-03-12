import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FlaskConical,
  Receipt,
  Pill,
  FileText,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import PatientLayout from "../../components/patient/PatientLayout";
import api from "../../lib/axios";

function SectionHeader({ icon: Icon, title, count, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl ${bgClass}`}>
        <Icon size={18} className={colorClass} />
      </div>
      <h2 className="font-black text-slate-900 text-[16px]">{title}</h2>
      <span
        className={`ml-auto px-2.5 py-1 rounded-xl text-[12px] font-black ${bgClass} ${colorClass}`}
      >
        {count}
      </span>
    </div>
  );
}

function PdfCard({ title, subtitle, url }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-100 transition-all group">
      <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 shrink-0 group-hover:bg-[#0f172a] group-hover:text-white transition-all">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800 text-[13px] truncate">{title}</p>
        {subtitle && (
          <p className="text-slate-500 text-[12px] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] text-white rounded-xl text-[12px] font-bold hover:bg-slate-700 transition-all"
        >
          <ExternalLink size={12} /> Open PDF
        </a>
      ) : (
        <span className="shrink-0 text-[11px] text-slate-400 font-semibold">
          No PDF
        </span>
      )}
    </div>
  );
}

function MedCard({ med }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-900 text-[14px]">
            {med.drug_name}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            {med.strength && (
              <span className="text-[12px] text-slate-600 font-semibold">
                {med.strength}
              </span>
            )}
            {med.dosage && (
              <span className="text-[12px] text-slate-500 font-semibold">
                Dose: {med.dosage}
              </span>
            )}
            {med.frequency_of_dose_per_day && (
              <span className="text-[12px] text-slate-500 font-semibold">
                {med.frequency_of_dose_per_day}x daily
              </span>
            )}
            {med.form_of_medicine && (
              <span className="text-[12px] text-slate-500 font-semibold capitalize">
                {med.form_of_medicine}
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-black ${med.is_active
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-500"
            }`}
        >
          {med.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}

function PatientDischargeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/patient/discharge/${id}/documents`)
      .then((r) => {
        setData(r.data);

        // Now fetch the PDF URLs
        api
          .get(`/patient/discharge/${id}/pdfs`)
          .then((pdfResponse) => {
            // Merge the new document URLs with existing data
            setData((prevData) => ({
              ...prevData,
              discharge_summary_url: pdfResponse.data.discharge_summary_url,
              patient_friendly_summary_url: pdfResponse.data.patient_friendly_summary_url,
              insurance_ready_url: pdfResponse.data.insurance_ready_url
            }));
          })
          .catch((err) => {
            console.error("Failed to fetch additional documents:", err);
          });
      })
      .catch((err) => {
        if (err?.response?.status === 404)
          setError("Discharge record not found.");
        else setError("Failed to load discharge details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={36} className="animate-spin text-slate-300" />
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-slate-600 font-bold text-[16px]">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl font-bold text-[14px] hover:bg-slate-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-[14px]"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        {/* Header */}
        <div className="bg-[#0f172a] rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 grid-pattern" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-white font-black text-[20px]">
                Discharge #{String(data.discharge_id).padStart(4, "0")}
              </h1>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[13px] font-semibold">
              <Calendar size={13} />
              {data.discharge_date || "Date not recorded"}
            </div>
          </div>

          {/* Doc summary */}
          <div className="relative flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
              <FlaskConical size={14} className="text-blue-300" />
              <span className="text-white text-[13px] font-bold">
                {data.reports?.length || 0} Reports
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
              <Receipt size={14} className="text-violet-300" />
              <span className="text-white text-[13px] font-bold">
                {data.bills?.length || 0} Bills
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
              <Pill size={14} className="text-teal-300" />
              <span className="text-white text-[13px] font-bold">
                {data.medications?.length || 0} Medications
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
              <FileText size={14} className="text-emerald-300" />
              <span className="text-white text-[13px] font-bold">
                {data.discharge_summary_url ? "1" : "0"} Discharge Summary
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
              <FileText size={14} className="text-amber-300" />
              <span className="text-white text-[13px] font-bold">
                {data.patient_friendly_summary_url ? "1" : "0"} Patient-Friendly
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <SectionHeader
              icon={FlaskConical}
              title="Medical Reports"
              count={data.reports?.length || 0}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
            {data.reports?.length === 0 ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-semibold">
                No reports available
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.reports.map((r) => (
                  <PdfCard
                    key={r.id}
                    title={r.report_name}
                    subtitle={
                      r.report_date
                        ? `Date: ${r.report_date.split("T")[0]}`
                        : r.specimen_type
                    }
                    url={r.report_url}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bills */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <SectionHeader
              icon={Receipt}
              title="Bills"
              count={data.bills?.length || 0}
              colorClass="text-violet-600"
              bgClass="bg-violet-50"
            />
            {data.bills?.length === 0 ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-semibold">
                No bills available
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.bills.map((b) => (
                  <PdfCard
                    key={b.id}
                    title={`Invoice #${b.invoice_number}`}
                    subtitle={`Total: ${b.total_amount?.toFixed(2)} · ${b.invoice_date || ""}`}
                    url={b.bill_url}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Discharge Summary */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <SectionHeader
              icon={FileText}
              title="Discharge Summary"
              count={data.discharge_summary_url ? 1 : 0}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            {!data.discharge_summary_url ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-semibold">
                No discharge summary available
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <PdfCard
                  title="Discharge Summary"
                  subtitle="Complete discharge documentation"
                  url={data.discharge_summary_url}
                />
              </div>
            )}
          </div>

          {/* Patient-Friendly Report */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <SectionHeader
              icon={FileText}
              title="Patient-Friendly Report"
              count={data.patient_friendly_summary_url ? 1 : 0}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
            />
            {!data.patient_friendly_summary_url ? (
              <p className="text-slate-400 text-[13px] text-center py-6 font-semibold">
                No patient-friendly report available
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <PdfCard
                  title="Patient-Friendly Report"
                  subtitle="Easy-to-understand discharge information"
                  url={data.patient_friendly_summary_url}
                />
              </div>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mt-6">
          <SectionHeader
            icon={Pill}
            title="Medications"
            count={data.medications?.length || 0}
            colorClass="text-teal-600"
            bgClass="bg-teal-50"
          />
          {data.medications?.length === 0 ? (
            <p className="text-slate-400 text-[13px] text-center py-6 font-semibold">
              No medications recorded
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.medications.map((m) => (
                <MedCard key={m.id} med={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}

export default PatientDischargeDetails;
