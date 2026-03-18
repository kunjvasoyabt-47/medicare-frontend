import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FlaskConical,
  Receipt,
  Pill,
  FileText,
  ExternalLink,
  Calendar,
  AlertCircle,
} from "lucide-react";
import PatientLayout from "../../components/patient/PatientLayout";
import api from "../../lib/axios";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

function SectionHeader({ icon: Icon, title, count, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
      <div className={`p-1.5 rounded-lg ${bgClass}`}>
        <Icon size={15} className={colorClass} />
      </div>
      <h2
        className="text-slate-900 text-[14px] flex-1"
        style={{ fontWeight: 600 }}
      >
        {title}
      </h2>
      <span
        className={`px-2 py-0.5 rounded-md text-[11px] ${bgClass} ${colorClass}`}
        style={{ fontWeight: 500 }}
      >
        {count}
      </span>
    </div>
  );
}

function PdfCard({ title, subtitle, url }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-all group">
      <div className="p-2 bg-white text-slate-400 rounded-lg border border-slate-200 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
        <FileText size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-slate-800 text-[13px] truncate"
          style={{ fontWeight: 500 }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            className="text-slate-500 text-[12px] mt-0.5 truncate"
            style={{ fontWeight: 400 }}
          >
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
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[12px] hover:bg-slate-700 transition-all"
          style={{ fontWeight: 500 }}
        >
          <ExternalLink size={11} /> Open PDF
        </a>
      ) : (
        <span
          className="shrink-0 text-[11px] text-slate-400"
          style={{ fontWeight: 400 }}
        >
          No PDF
        </span>
      )}
    </div>
  );
}

function MedCard({ med }) {
  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-slate-900 text-[13px]" style={{ fontWeight: 600 }}>
            {med.drug_name}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            {med.strength && (
              <span
                className="text-[12px] text-slate-500"
                style={{ fontWeight: 400 }}
              >
                {med.strength}
              </span>
            )}
            {med.dosage && (
              <span
                className="text-[12px] text-slate-500"
                style={{ fontWeight: 400 }}
              >
                Dose: {med.dosage}
              </span>
            )}
            {med.frequency_of_dose_per_day && (
              <span
                className="text-[12px] text-slate-500"
                style={{ fontWeight: 400 }}
              >
                {med.frequency_of_dose_per_day}×/day
              </span>
            )}
            {med.form_of_medicine && (
              <span
                className="text-[12px] text-slate-500 capitalize"
                style={{ fontWeight: 400 }}
              >
                {med.form_of_medicine}
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] ${med.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
          style={{ fontWeight: 500 }}
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
      .get(API_ROUTES.patient.dischargeDocuments(id))
      .then((r) => {
        setData(r.data);
        api
          .get(API_ROUTES.patient.dischargePdfs(id))
          .then((pdfResponse) => {
            setData((prevData) => ({
              ...prevData,
              discharge_summary_url: pdfResponse.data.discharge_summary_url,
              patient_friendly_summary_url:
                pdfResponse.data.patient_friendly_summary_url,
              insurance_ready_url: pdfResponse.data.insurance_ready_url,
            }));
          })
          .catch(console.error);
      })
      .catch((err) => {
        setError(
          err?.response?.status === 404
            ? "Discharge record not found."
            : "Failed to load discharge details.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PatientLayout>
        <SystemLoader
          label="Loading Discharge Details"
          sublabel="Gathering your document timeline"
        />
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle size={36} className="text-red-400 mx-auto mb-4" />
          <p className="text-slate-600 text-[15px]" style={{ fontWeight: 500 }}>
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[13px] hover:bg-slate-700 transition-all"
            style={{ fontWeight: 500 }}
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 px-3.5 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-[13px]"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back to History
        </button>

        {/* Header */}
        <div className="bg-slate-900 rounded-xl p-5 mb-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-white text-[18px]" style={{ fontWeight: 600 }}>
              Discharge #{String(data.discharge_id).padStart(4, "0")}
            </h1>
            <span
              className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] border border-emerald-500/30"
              style={{
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Completed
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 text-slate-400 text-[13px] mb-4"
            style={{ fontWeight: 400 }}
          >
            <Calendar size={12} />
            {data.discharge_date || "Date not recorded"}
          </div>

          <div
            className="flex flex-wrap gap-2 pt-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {[
              {
                icon: FlaskConical,
                count: data.reports?.length || 0,
                label: "Reports",
                color: "text-blue-300",
              },
              {
                icon: Receipt,
                count: data.bills?.length || 0,
                label: "Bills",
                color: "text-violet-300",
              },
              {
                icon: Pill,
                count: data.medications?.length || 0,
                label: "Medications",
                color: "text-teal-300",
              },
              {
                icon: FileText,
                count: data.discharge_summary_url ? 1 : 0,
                label: "Summary",
                color: "text-emerald-300",
              },
              {
                icon: FileText,
                count: data.patient_friendly_summary_url ? 1 : 0,
                label: "Patient Report",
                color: "text-amber-300",
              },
            ].map(({ icon: Icon, count, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 rounded-lg border"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <Icon size={12} className={color} />
                <span
                  className="text-white text-[12px]"
                  style={{ fontWeight: 500 }}
                >
                  {count} {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeader
              icon={FlaskConical}
              title="Medical Reports"
              count={data.reports?.length || 0}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
            {data.reports?.length === 0 ? (
              <p
                className="text-slate-400 text-[13px] text-center py-5"
                style={{ fontWeight: 400 }}
              >
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

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeader
              icon={Receipt}
              title="Bills"
              count={data.bills?.length || 0}
              colorClass="text-violet-600"
              bgClass="bg-violet-50"
            />
            {data.bills?.length === 0 ? (
              <p
                className="text-slate-400 text-[13px] text-center py-5"
                style={{ fontWeight: 400 }}
              >
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

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeader
              icon={FileText}
              title="Discharge Summary"
              count={data.discharge_summary_url ? 1 : 0}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            {!data.discharge_summary_url ? (
              <p
                className="text-slate-400 text-[13px] text-center py-5"
                style={{ fontWeight: 400 }}
              >
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

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <SectionHeader
              icon={FileText}
              title="Patient-Friendly Report"
              count={data.patient_friendly_summary_url ? 1 : 0}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
            />
            {!data.patient_friendly_summary_url ? (
              <p
                className="text-slate-400 text-[13px] text-center py-5"
                style={{ fontWeight: 400 }}
              >
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <SectionHeader
            icon={Pill}
            title="Medications"
            count={data.medications?.length || 0}
            colorClass="text-teal-600"
            bgClass="bg-teal-50"
          />
          {data.medications?.length === 0 ? (
            <p
              className="text-slate-400 text-[13px] text-center py-5"
              style={{ fontWeight: 400 }}
            >
              No medications recorded
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
