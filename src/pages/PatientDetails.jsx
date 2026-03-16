import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Activity,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Stethoscope,
  Receipt,
  FlaskConical,
  Pill,
  ShieldCheck,
  LogOut,
  X,
  RefreshCw,
  Zap,
  Plus,
  Ban,
  Lock,
  ExternalLink,
} from "lucide-react";

const MAX_FILES_REPORTS = 15;
const MAX_FILES_BILLS = 5;
const MAX_FILES_PRESCRIPTIONS = 5;
const MAX_SUMMARY_FILES = 1;

function getMaxFiles(type) {
  const limits = {
    reports: MAX_FILES_REPORTS,
    bills: MAX_FILES_BILLS,
    prescriptions: MAX_FILES_PRESCRIPTIONS,
  };
  return limits[type] || 5;
}

const GENERIC_PROCESSING_ERROR =
  "This document could not be processed. Please review the file and try again.";

function parseStructuredError(response) {
  if (response?.failure?.error_code) {
    return {
      error_code: response.failure.error_code,
      message: response.failure.reason || response.failure.error_title || GENERIC_PROCESSING_ERROR,
      error_type: response.failure.error_type,
      title: response.failure.error_title,
      context: response.failure.context,
      action: response.failure.action,
    };
  }
  return null;
}

function extractStatusFailureMessage(statusPayload) {
  if (statusPayload?.failure?.reason) return statusPayload.failure.reason;
  if (statusPayload?.failure?.error_title) return statusPayload.failure.error_title;
  const directMessage =
    typeof statusPayload?.error === "string" ? statusPayload.error
    : typeof statusPayload?.detail === "string" ? statusPayload.detail
    : typeof statusPayload?.message === "string" ? statusPayload.message
    : null;
  if (directMessage) return directMessage;
  const nestedCandidates = [
    statusPayload?.failed_file?.error,
    statusPayload?.failed_file?.detail,
    statusPayload?.failure?.error,
    statusPayload?.failure?.detail,
    statusPayload?.error_detail,
  ];
  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return GENERIC_PROCESSING_ERROR;
}

function fileListIcon(status, Icon) {
  if (status === "done") return <CheckCircle size={13} className="text-emerald-500 shrink-0" />;
  if (status === "error") return <AlertCircle size={13} className="text-red-500 shrink-0" />;
  if (status === "processing") return <Loader2 size={13} className="animate-spin text-amber-500 shrink-0" />;
  return <Icon size={13} className="text-slate-400 shrink-0" />;
}

function FilePill({ file, status, onRemove, disabled, errorMessage }) {
  const base =
    status === "done" ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
    : status === "error" ? "border-red-200 bg-red-50/60 text-red-700"
    : status === "processing" ? "border-amber-200 bg-amber-50/60 text-amber-800"
    : "border-slate-200 bg-white text-slate-700";

  return (
    <div className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${base} transition-all duration-300`}>
      <FileText size={12} className="shrink-0 opacity-60" />
      <span className="truncate max-w-[130px]">{file.name}</span>
      {status === "done" && <CheckCircle size={12} className="text-emerald-500 shrink-0" />}
      {status === "error" && (
        <div className="relative flex items-center">
          <AlertCircle size={12} className="text-red-500 shrink-0" title={errorMessage || ""} />
          {errorMessage && (
            <div className="pointer-events-none absolute left-1/2 -top-2 z-30 hidden w-64 -translate-x-1/2 -translate-y-full rounded-2xl border border-slate-900/40 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-50 shadow-xl shadow-slate-900/40 group-hover:block">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      {status === "processing" && <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />}
      {!disabled && status !== "done" && status !== "processing" && (
        <button onClick={onRemove} className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── FileListDropdown ─────────────────────────────────────────────────────
// Shows uploaded filenames in a collapsible dropdown with Open buttons for 
// Reports and Bills (when URLs are available)
function FileListDropdown({ label, files, dropdownLabel, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (files.length === 0) return null;

  const typeColors = {
    reports: { bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-300", badge: "bg-blue-100 text-blue-700", icon: "text-blue-600" },
    bills: { bg: "bg-slate-50", border: "border-slate-200", hover: "hover:border-slate-300", badge: "bg-slate-100 text-slate-700", icon: "text-slate-600" },
    prescriptions: { bg: "bg-teal-50", border: "border-teal-200", hover: "hover:border-teal-300", badge: "bg-teal-100 text-teal-700", icon: "text-teal-600" },
  };
  const tc = typeColors[label] || typeColors.reports;
  const showOpenButton = label === "reports" || label === "bills";

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border ${tc.border} ${tc.bg} ${tc.hover} transition-all text-left`}
      >
        <span className="font-bold text-slate-800 text-[13px] flex-1">
          {dropdownLabel}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${tc.badge}`}>
          {files.length}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 pl-3 bg-white/40 rounded-lg px-3 py-2 border border-slate-200 max-h-48 overflow-y-auto">
          {files.map((file, idx) => {
            const fileName = typeof file === "string" ? file : file.name || "Document";
            const fileUrl = typeof file === "object" ? file.url : undefined;

            return (
              <div
                key={idx}
                className="flex items-center gap-2 py-2 px-2 text-slate-700 text-[12px] font-medium border-b border-slate-100 last:border-b-0 hover:bg-slate-50 rounded transition-colors group"
              >
                <FileText size={12} className="text-slate-400 shrink-0" />
                <span className="flex-1 truncate">{fileName}</span>
                {showOpenButton && fileUrl && (
                  <button
                    onClick={() => window.open(fileUrl, "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0f172a] text-white text-[10px] font-black hover:bg-slate-700 transition-all shrink-0 shadow-sm"
                  >
                    <ExternalLink size={10} />
                    Open
                  </button>
                )}
                {showOpenButton && !fileUrl && (
                  <button
                    disabled
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black cursor-not-allowed shrink-0"
                  >
                    <ExternalLink size={10} />
                    Open
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DropZone({ type, label, icon: Icon, files, fileStatuses, fileErrors, onAdd, onRemove, disabled, processedCount }) {
  const inputId = `dropzone-${type}`;
  const maxForType = getMaxFiles(type);
  const remaining = maxForType - files.length - processedCount;
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    onAdd(Array.from(e.dataTransfer.files));
  };

  const typeColors = {
    reports: { ring: "ring-blue-400", bg: "bg-blue-50", icon: "text-blue-600 bg-blue-100", label: "text-blue-700" },
    bills: { ring: "ring-slate-400", bg: "bg-slate-50", icon: "text-slate-600 bg-slate-100", label: "text-slate-700" },
    prescriptions: { ring: "ring-teal-400", bg: "bg-teal-50", icon: "text-teal-600 bg-teal-100", label: "text-teal-700" },
  };
  const c = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${c.icon}`}><Icon size={14} /></div>
        <span className={`text-[13px] font-black uppercase tracking-wider ${c.label}`}>{label}</span>
        <span className="ml-auto text-[11px] text-slate-400 font-semibold">{files.length}/{getMaxFiles(type)} files</span>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
          : drag ? `${c.ring} ring-2 ${c.bg} border-transparent`
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        {disabled && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 shadow-lg">
              <Lock size={14} className="text-slate-600" />
              <span className="text-[12px] font-bold text-slate-700">Processing…</span>
            </div>
          </div>
        )}
        <input id={inputId} type="file" accept=".pdf" multiple disabled={disabled || remaining <= 0} className="hidden" onChange={(e) => onAdd(Array.from(e.target.files))} />
        {files.length === 0 ? (
          <label htmlFor={inputId} className={`flex flex-col items-center justify-center py-6 gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <Upload size={22} className="text-slate-300" />
            <p className="text-slate-400 text-[13px] font-semibold">Drop PDFs or click to browse</p>
            <p className="text-slate-300 text-[11px]">Up to {getMaxFiles(type)} files</p>
          </label>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {files.map((f, i) => (
              <FilePill key={i} file={f} status={fileStatuses?.[i] ?? "queued"} errorMessage={fileErrors?.[i] ?? null} onRemove={() => onRemove(i)} disabled={disabled} />
            ))}
            {remaining > 0 && !disabled && (
              <label htmlFor={inputId} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-[12px] font-semibold cursor-pointer hover:border-slate-400 transition-all">
                <Plus size={12} /> Add more ({remaining} left)
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineRow({ icon: Icon, label, total, processed, isActive, isFailed, isSkipped }) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isDone = processed === total && total > 0;
  const state = isSkipped ? "skipped" : isFailed ? "failed" : isDone ? "done" : isActive ? "active" : "waiting";
  const stateStyles = {
    skipped: { dot: "bg-slate-200", bar: "bg-slate-200", label: "text-slate-400", pct: "text-slate-400" },
    failed: { dot: "bg-red-500 shadow-red-300 shadow-sm", bar: "bg-red-400", label: "text-red-600 font-black", pct: "text-red-500" },
    done: { dot: "bg-emerald-500 shadow-emerald-300 shadow-sm", bar: "bg-emerald-400", label: "text-emerald-700 font-black", pct: "text-emerald-600" },
    active: { dot: "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm", bar: "bg-amber-400", label: "text-amber-700 font-black", pct: "text-amber-600" },
    waiting: { dot: "bg-slate-300", bar: "bg-slate-200", label: "text-slate-500", pct: "text-slate-400" },
  };
  const s = stateStyles[state];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot} transition-all duration-500`} />
      <div className={`flex items-center gap-1.5 w-36 shrink-0 ${s.label} text-[13px]`}>
        {state === "done" ? <CheckCircle size={14} className="text-emerald-500" />
        : state === "failed" ? <AlertCircle size={14} className="text-red-500" />
        : state === "active" ? <Loader2 size={14} className="animate-spin text-amber-500" />
        : <Icon size={14} className="text-slate-400" />}
        {label}
      </div>
      {total > 0 && (
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${s.bar} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
        </div>
      )}
      <span className={`text-[12px] font-black tabular-nums shrink-0 w-14 text-right ${s.pct}`}>
        {state === "skipped" ? "—" : `${processed}/${total}`}
      </span>
    </div>
  );
}

// ─── FIXED: Document Dropdown — robust field name resolution ─────────────────
function DocumentDropdown({ icon: Icon, label, documents, colorClass, type }) {
  const [isOpen, setIsOpen] = useState(false);

  const docs = Array.isArray(documents) ? documents : [];

  const getDocumentTitle = (doc) => {
    if (type === "reports") {
      return doc.report_name || doc.name || "Report";
    }
    if (type === "bills") {
      return doc.invoice_number ? `Invoice #${doc.invoice_number}` : doc.name || "Bill";
    }
    if (type === "prescriptions") {
      return doc.drug_name || doc.prescription_name || doc.name || "Prescription";
    }
    return doc.name || "Document";
  };

  const getDocumentDate = (doc) => {
    const raw =
      (type === "reports" && doc.report_date) ||
      (type === "bills" && doc.invoice_date) ||
      doc.date || null;
    if (!raw) return null;
    try { return new Date(raw).toLocaleDateString(); } catch { return null; }
  };

  const getDocumentSubtitle = (doc) => {
    if (type === "bills" && doc.total_amount != null) {
      return `Total: $${Number(doc.total_amount).toFixed(2)}${doc.invoice_date ? " · " + doc.invoice_date : ""}`;
    }
    if (type === "prescriptions") {
      const parts = [
        doc.strength && `Strength: ${doc.strength}`,
        doc.dosage && `Dosage: ${doc.dosage}`,
        doc.frequency_of_dose_per_day && `${doc.frequency_of_dose_per_day}x/day`,
      ].filter(Boolean);
      return parts.join(" · ") || null;
    }
    if (type === "reports" && doc.report_date) {
      return `Date: ${doc.report_date.split("T")[0]}`;
    }
    return null;
  };

  const getDocumentUrl = (doc) => {
    return (
      doc.report_url ||
      doc.bill_url ||
      doc.prescription_url ||
      doc.cloudinary_url ||
      doc.file_url ||
      doc.url ||
      null
    );
  };

  const typeColors = {
    reports: { bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-300", badge: "bg-blue-100 text-blue-700" },
    bills: { bg: "bg-slate-50", border: "border-slate-200", hover: "hover:border-slate-300", badge: "bg-slate-100 text-slate-700" },
    prescriptions: { bg: "bg-teal-50", border: "border-teal-200", hover: "hover:border-teal-300", badge: "bg-teal-100 text-teal-700" },
  };
  const tc = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border ${tc.border} ${tc.bg} ${tc.hover} transition-all text-left`}
      >
        <Icon size={16} className={colorClass} />
        <span className="font-bold text-slate-800 text-[13px] flex-1">
          View Uploaded {label}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${tc.badge}`}>
          {docs.length}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 pl-1">
          {docs.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <AlertCircle size={14} className="text-slate-400 shrink-0" />
              <p className="text-slate-500 text-[12px] font-semibold">
                No {label.toLowerCase()} found. The documents may still be indexing — try refreshing the page.
              </p>
            </div>
          ) : (
            docs.map((doc, idx) => {
              const title = getDocumentTitle(doc);
              const subtitle = getDocumentSubtitle(doc);
              const url = getDocumentUrl(doc);
              const showOpenButton = type === "reports" || type === "bills";
              return (
                <div
                  key={doc.id || idx}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0 group-hover:bg-[#0f172a] group-hover:border-transparent transition-all">
                    <FileText size={14} className="text-slate-400 group-hover:text-white transition-all" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-[12px] truncate" title={title}>
                      {title}
                    </p>
                    {subtitle && (
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">{subtitle}</p>
                    )}
                  </div>
                  {showOpenButton && url && (
                    <button
                      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] text-white text-[11px] font-black hover:bg-slate-700 transition-all shrink-0 shadow-sm"
                    >
                      <ExternalLink size={11} />
                      Open
                    </button>
                  )}
                  {showOpenButton && !url && (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-black cursor-not-allowed shrink-0"
                    >
                      <ExternalLink size={11} />
                      Open
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── CompletedDocumentsSection ───────────────────────────────────────────────
function CompletedDocumentsSection({ patientId, data, dischargeId }) {
  const [reports, setReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoadingDocs(true);
      setFetchError(null);
      try {
        let dId = dischargeId;
        if (!dId) {
          const patientRes = await api.get(`/admin/patients/${patientId}`);
          dId = patientRes.data?.latest_discharge_id;
        }
        if (!dId) {
          setFetchError("No discharge record found for this patient.");
          return;
        }

        const docsRes = await api.get(`/admin/discharge/${dId}/documents`);
        const d = docsRes.data;
        console.log("[CompletedDocumentsSection] documents response:", d);

        setReports(d.reports || []);
        setBills(d.bills || []);
        setPrescriptions(d.medications || []);
      } catch (err) {
        console.error("[CompletedDocumentsSection] fetch failed:", err);
        setFetchError("Could not load documents. Please refresh the page.");
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [patientId, dischargeId]);

  if (loadingDocs) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <Loader2 size={16} className="animate-spin text-slate-400 shrink-0" />
        <p className="text-slate-500 text-[13px] font-semibold">Loading uploaded documents…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-700 text-[13px] font-bold">Could not load documents</p>
          <p className="text-amber-600 text-[12px] mt-0.5">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DocumentDropdown
        icon={FlaskConical}
        label="Reports"
        documents={reports}
        colorClass="text-blue-600"
        type="reports"
      />
      <DocumentDropdown
        icon={Receipt}
        label="Bills"
        documents={bills}
        colorClass="text-slate-600"
        type="bills"
      />
      <DocumentDropdown
        icon={Pill}
        label="Prescriptions"
        documents={prescriptions}
        colorClass="text-teal-600"
        type="prescriptions"
      />
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 group hover:border-slate-300 transition-all">
      <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-all shrink-0">
        {React.cloneElement(icon, { size: 17 })}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 font-semibold text-[12px] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-800 font-bold text-[14px] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatusBadge({ dischargeDate }) {
  if (dischargeDate) {
    return (
      <span className="px-3 py-1.5 bg-slate-500/20 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-500/30">
        Discharged
      </span>
    );
  }
  return (
    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      Active Case
    </span>
  );
}

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessConfirm, setShowProcessConfirm] = useState(false);
  const [isConfirmingProcess, setIsConfirmingProcess] = useState(false);

  const [files, setFiles] = useState({ reports: [], bills: [], prescriptions: [] });
  const [fileStatuses, setFileStatuses] = useState({ reports: [], bills: [], prescriptions: [] });
  const [fileErrors, setFileErrors] = useState({ reports: [], bills: [], prescriptions: [] });

  const [dischargeId, setDischargeId] = useState(null);
  const [processState, setProcessState] = useState("idle");
  const [processedCounts, setProcessedCounts] = useState({ reports: 0, bills: 0, prescriptions: 0 });
  const [totalCounts, setTotalCounts] = useState({ reports: 0, bills: 0, prescriptions: 0 });
  const [activeType, setActiveType] = useState(null);
  const [failInfo, setFailInfo] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [toast, setToast] = useState(null);

  const pollingRef = useRef(null);
  const toastRef = useRef(null);

  const [summaryFile, setSummaryFile] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState("idle");
  const [summaryProgress, setSummaryProgress] = useState(0);
  const [summaryError, setSummaryError] = useState(null);
  const [patientFriendlyUrl, setPatientFriendlyUrl] = useState(null);
  const [insuranceReadyUrl, setInsuranceReadyUrl] = useState(null);
  const [isGeneratingPatientDoc, setIsGeneratingPatientDoc] = useState(false);
  const [isGeneratingInsuranceDoc, setIsGeneratingInsuranceDoc] = useState(false);

  const [submittedFiles, setSubmittedFiles] = useState(null);
  const [apiSucceeded, setApiSucceeded] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const [errorDetails, setErrorDetails] = useState(null);

  const resetUploadState = useCallback(() => {
    setFiles({ reports: [], bills: [], prescriptions: [] });
    setFileStatuses({ reports: [], bills: [], prescriptions: [] });
    setFileErrors({ reports: [], bills: [], prescriptions: [] });
    setProcessState("idle");
    setProcessedCounts({ reports: 0, bills: 0, prescriptions: 0 });
    setTotalCounts({ reports: 0, bills: 0, prescriptions: 0 });
    setActiveType(null);
    setFailInfo(null);
    setErrorDetails(null);
    setSubmitError(null);
    setDischargeId(null);
    setSubmittedFiles(null);
    setApiSucceeded(false);
  }, []);

  const handleSummaryUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { setSummaryError("Only PDF files are allowed"); return; }
    setSummaryFile(file); setSummaryError(null); setSummaryStatus("uploading"); setSummaryProgress(0);
    try {
      setSummaryStatus("completed"); setSummaryProgress(100);
      showToast("Discharge summary ready for processing!");
    } catch (err) {
      setSummaryStatus("failed");
      const errorMsg = typeof err?.response?.data?.detail === "string" ? err.response.data.detail
        : typeof err?.response?.data?.message === "string" ? err.response.data.message
        : "Upload failed. Please try again.";
      setSummaryError(errorMsg);
      showToast("Failed to upload discharge summary", "error");
    }
  };

  const handleGeneratePatientFriendly = async () => {
    if (!summaryFile) { setSummaryError("Please upload a discharge summary first"); return; }
    setIsGeneratingPatientDoc(true); setSummaryError(null);
    try {
      const formData = new FormData();
      formData.append("file", summaryFile);
      const response = await api.post(`/api/patient-friendly-report/convert-pdf/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setPatientFriendlyUrl(response.data.patient_friendly_url);
      showToast("Patient-friendly document generated successfully!");
    } catch (err) {
      const errorMsg = typeof err?.response?.data?.detail === "string" ? err.response.data.detail
        : typeof err?.response?.data?.message === "string" ? err.response.data.message
        : "Failed to generate patient-friendly document";
      setSummaryError(errorMsg);
      showToast("Failed to generate patient-friendly document", "error");
    } finally { setIsGeneratingPatientDoc(false); }
  };

  const handleGenerateInsuranceReady = async () => {
    setIsGeneratingInsuranceDoc(true); setSummaryError(null);
    try {
      const response = await api.post(`/api/patient/${id}/generate-ird`);
      showToast("Insurance-ready document generated successfully!");
      setInsuranceReadyUrl(response.data.ird_url);
      const updatedPatient = await api.get(`/admin/patients/${id}`);
      setData(updatedPatient.data);
    } catch (err) {
      const errorMsg = typeof err?.response?.data?.detail === "string" ? err.response.data.detail
        : typeof err?.response?.data?.message === "string" ? err.response.data.message
        : "Failed to generate insurance-ready document";
      setSummaryError(errorMsg);
      showToast("Failed to generate insurance-ready document", "error");
    } finally { setIsGeneratingInsuranceDoc(false); }
  };

  const removeSummaryFile = () => { setSummaryFile(null); setSummaryStatus("idle"); setSummaryProgress(0); setSummaryError(null); };

  useEffect(() => () => { clearInterval(pollingRef.current); clearTimeout(toastRef.current); }, []);

  const processedCountsRef = useRef(processedCounts);
  useEffect(() => { processedCountsRef.current = processedCounts; }, [processedCounts]);

  const totalCountsRef = useRef(totalCounts);
  useEffect(() => { totalCountsRef.current = totalCounts; }, [totalCounts]);

  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/admin/patients/${id}`);
        setData(res.data);
        if (res.data.patient_friendly_url) setPatientFriendlyUrl(res.data.patient_friendly_url);
        if (res.data.ird_url) setInsuranceReadyUrl(res.data.ird_url);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const startPolling = useCallback((dId) => {
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/discharge/${dId}/status`);
        const s = res.data;
        const p = s.processed ?? {};
        const newCounts = { reports: p.reports ?? 0, bills: p.bills ?? 0, prescriptions: p.prescriptions ?? 0 };
        setProcessedCounts(newCounts);

        const totals = totalCountsRef.current;
        const currentFiles = filesRef.current;

        setFileStatuses({
          reports: currentFiles.reports.map((_, i) => i < newCounts.reports ? "done" : "processing"),
          bills: currentFiles.bills.map((_, i) => i < newCounts.bills ? "done" : "processing"),
          prescriptions: currentFiles.prescriptions.map((_, i) => i < newCounts.prescriptions ? "done" : "processing"),
        });

        if (newCounts.reports < totals.reports) setActiveType("reports");
        else if (newCounts.bills < totals.bills) setActiveType("bills");
        else if (newCounts.prescriptions < totals.prescriptions) setActiveType("prescriptions");

        if (s.status === "completed") {
          clearInterval(pollingRef.current);
          setProcessState("completed");
          setActiveType(null);
          setFileStatuses({
            reports: currentFiles.reports.map(() => "done"),
            bills: currentFiles.bills.map(() => "done"),
            prescriptions: currentFiles.prescriptions.map(() => "done"),
          });
          setFileErrors({ reports: [], bills: [], prescriptions: [] });
          if (s.discharge_date) setData((prev) => ({ ...prev, discharge_date: s.discharge_date }));
          try {
            const pr = await api.get(`/admin/patients/${id}`);
            setData(pr.data);
            console.log("[polling] completed — patient data refreshed:", pr.data);
          } catch (e) {
            console.warn("[polling] could not refresh patient data after completion:", e);
          }
          showToast("All documents processed successfully!");
        } else if (s.status === "failed") {
          clearInterval(pollingRef.current);
          setProcessState("failed");
          setApiSucceeded(false);
          setActiveType(null);

          let failedType = null;
          let failedIndex = 0;
          if (newCounts.reports < totals.reports) { failedType = "report"; failedIndex = newCounts.reports; }
          else if (newCounts.bills < totals.bills) { failedType = "bill"; failedIndex = newCounts.bills; }
          else if (newCounts.prescriptions < totals.prescriptions) { failedType = "prescription"; failedIndex = newCounts.prescriptions; }

          const backendErrorMessage = extractStatusFailureMessage(s);
          setFailInfo({
            discharge_id: dId,
            status: "failed",
            progress: { processed_reports: newCounts.reports, processed_bills: newCounts.bills, processed_prescriptions: newCounts.prescriptions },
            failed_at: failedType ? { type: failedType, index: failedIndex } : null,
            error: GENERIC_PROCESSING_ERROR,
            message: "Processing stopped at a failed file. Already-stored documents will NOT be re-processed on retry.",
          });

          const structuredError = parseStructuredError(s);
          if (structuredError) setErrorDetails(structuredError);

          setFileStatuses({
            reports: currentFiles.reports.map((_, i) => { if (i < newCounts.reports) return "done"; if (failedType === "report" && i === failedIndex) return "error"; return "queued"; }),
            bills: currentFiles.bills.map((_, i) => { if (i < newCounts.bills) return "done"; if (failedType === "bill" && i === failedIndex) return "error"; return "queued"; }),
            prescriptions: currentFiles.prescriptions.map((_, i) => { if (i < newCounts.prescriptions) return "done"; if (failedType === "prescription" && i === failedIndex) return "error"; return "queued"; }),
          });
          setFileErrors({ reports: currentFiles.reports.map(() => null), bills: currentFiles.bills.map(() => null), prescriptions: currentFiles.prescriptions.map(() => null) });
        }
      } catch {
        // keep polling on transient network errors
      }
    }, 1200);
  }, [id, showToast]);

  useEffect(() => () => clearInterval(pollingRef.current), []);

  const addFiles = (type, incoming) => {
    const pdfs = incoming.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    const nonPdfs = incoming.filter((f) => !f.name.toLowerCase().endsWith(".pdf"));
    if (nonPdfs.length) setSubmitError(`Only PDF files are allowed. Skipped: ${nonPdfs.map((f) => f.name).join(", ")}`);
    else setSubmitError(null);
    const maxForType = getMaxFiles(type);
    setFiles((prev) => { const current = prev[type]; const capacity = maxForType - current.length; const toAdd = pdfs.slice(0, capacity); return { ...prev, [type]: [...current, ...toAdd] }; });
    setFileStatuses((prev) => { const toAdd = pdfs.slice(0, maxForType - prev[type].length); return { ...prev, [type]: [...prev[type], ...toAdd.map(() => "queued")] }; });
    setFileErrors((prev) => { const toAdd = pdfs.slice(0, maxForType - prev[type].length); return { ...prev, [type]: [...prev[type], ...toAdd.map(() => null)] }; });
  };

  const removeFile = (type, index) => {
    setFiles((prev) => { const updated = [...prev[type]]; updated.splice(index, 1); return { ...prev, [type]: updated }; });
    setFileStatuses((prev) => { const updated = [...prev[type]]; updated.splice(index, 1); return { ...prev, [type]: updated }; });
    setFileErrors((prev) => { const updated = [...prev[type]]; updated.splice(index, 1); return { ...prev, [type]: updated }; });
  };

  const buildForm = (patientId, reportFiles, billFiles, prescriptionFiles) => {
    const form = new FormData();
    form.append("patient_id", String(patientId));
    reportFiles.forEach((f) => form.append("reports", f));
    billFiles.forEach((f) => form.append("bills", f));
    prescriptionFiles.forEach((f) => form.append("prescriptions", f));
    return form;
  };

  const handleProcess = async () => {
    const totalR = files.reports.length;
    const totalB = files.bills.length;
    const totalP = files.prescriptions.length;
    if (totalR + totalB + totalP === 0) { setSubmitError("Please add at least one PDF to process."); return; }
    setSubmitError(null);
    setFileErrors({ reports: files.reports.map(() => null), bills: files.bills.map(() => null), prescriptions: files.prescriptions.map(() => null) });
    setProcessState("processing");
    setTotalCounts({ reports: totalR, bills: totalB, prescriptions: totalP });
    setActiveType(totalR > 0 ? "reports" : totalB > 0 ? "bills" : "prescriptions");
    setFileStatuses({ reports: files.reports.map(() => "processing"), bills: files.bills.map(() => "processing"), prescriptions: files.prescriptions.map(() => "processing") });
    try {
      const form = buildForm(id, files.reports, files.bills, files.prescriptions);
      const res = await api.post("/api/discharge/process", form, { headers: { "Content-Type": "multipart/form-data" } });
      const dId = res.data.discharge_id;
      setDischargeId(dId);
      setSubmittedFiles(files);
      setApiSucceeded(true);
      startPolling(dId);
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || "Upload failed. Please try again.");
      setProcessState("idle");
      setApiSucceeded(false);
      setFileStatuses({ reports: files.reports.map(() => "queued"), bills: files.bills.map(() => "queued"), prescriptions: files.prescriptions.map(() => "queued") });
    }
  };

  const handleRetry = async () => {
    if (!dischargeId) return;
    const pendingReports = files.reports.filter((_, i) => fileStatuses.reports[i] !== "done");
    const pendingBills = files.bills.filter((_, i) => fileStatuses.bills[i] !== "done");
    const pendingPrescriptions = files.prescriptions.filter((_, i) => fileStatuses.prescriptions[i] !== "done");
    if (pendingReports.length + pendingBills.length + pendingPrescriptions.length === 0) { setSubmitError("Please upload the remaining/failed files for retry."); return; }
    setSubmitError(null); setProcessState("retrying"); setFailInfo(null);
    const cur = processedCountsRef.current;
    setTotalCounts({ reports: cur.reports + pendingReports.length, bills: cur.bills + pendingBills.length, prescriptions: cur.prescriptions + pendingPrescriptions.length });
    setActiveType(pendingReports.length > 0 ? "reports" : pendingBills.length > 0 ? "bills" : "prescriptions");
    setFileStatuses((prev) => ({ reports: prev.reports.map((s) => s !== "done" ? "processing" : s), bills: prev.bills.map((s) => s !== "done" ? "processing" : s), prescriptions: prev.prescriptions.map((s) => s !== "done" ? "processing" : s) }));
    setFileErrors((prev) => ({ reports: prev.reports.map((err, i) => fileStatuses.reports[i] !== "done" ? null : err), bills: prev.bills.map((err, i) => fileStatuses.bills[i] !== "done" ? null : err), prescriptions: prev.prescriptions.map((err, i) => fileStatuses.prescriptions[i] !== "done" ? null : err) }));
    try {
      const form = new FormData();
      pendingReports.forEach((f) => form.append("reports", f));
      pendingBills.forEach((f) => form.append("bills", f));
      pendingPrescriptions.forEach((f) => form.append("prescriptions", f));
      await api.post(`/api/discharge/${dischargeId}/retry`, form, { headers: { "Content-Type": "multipart/form-data" } });
      startPolling(dischargeId);
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || "Retry failed.");
      setProcessState("failed");
    }
  };

  const isProcessing = processState === "processing" || processState === "retrying";
  const isCompleted = processState === "completed";
  const isFailed = processState === "failed";
  const isIdle = processState === "idle";
  const anyFiles = files.reports.length + files.bills.length + files.prescriptions.length > 0;

  const selectedCounts = { reports: files.reports.length, bills: files.bills.length, prescriptions: files.prescriptions.length };
  const missingTypes = [
    selectedCounts.reports === 0 ? "Medical Reports" : null,
    selectedCounts.bills === 0 ? "Bills" : null,
    selectedCounts.prescriptions === 0 ? "Prescriptions" : null,
  ].filter(Boolean);

  const timelineTotal = totalCounts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-[14px] font-bold transition-all duration-500 animate-in slide-in-from-top-3 ${toast.type === "error" ? "bg-red-600 text-white border-red-700 shadow-red-500/30" : "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/30"}`}>
          {toast.type === "error" ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle size={16} className="shrink-0" />}
          {toast.message}
        </div>
      )}

      {showProcessConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close confirmation dialog" className="absolute inset-0 bg-black/40" onClick={() => { if (isConfirmingProcess) return; setShowProcessConfirm(false); }} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0"><AlertCircle size={18} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 font-black text-[15px]">Review documents before processing</p>
                  <p className="text-slate-600 text-[13px] mt-1 leading-relaxed font-semibold">This will process all uploaded documents in one run.</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-3">Selected files</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: "Medical Reports", value: selectedCounts.reports, accent: "text-blue-700 bg-blue-50 border-blue-200" },
                        { label: "Bills", value: selectedCounts.bills, accent: "text-slate-700 bg-white border-slate-200" },
                        { label: "Prescriptions", value: selectedCounts.prescriptions, accent: "text-teal-700 bg-teal-50 border-teal-200" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-slate-700 text-[13px] font-bold">{row.label}</span>
                          <span className={`px-2.5 py-1 rounded-xl text-[12px] font-black border tabular-nums ${row.accent}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {missingTypes.length > 0 && (
                    <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                      <AlertCircle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-amber-800 text-[13px] font-black">Missing uploads detected</p>
                        <p className="text-amber-800/90 text-[12px] font-semibold leading-relaxed mt-0.5">You have not uploaded any {missingTypes.join(", ")}.</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                    <Ban size={15} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-red-700 text-[13px] font-black">Important</p>
                      <p className="text-red-700/90 text-[12px] font-semibold leading-relaxed mt-0.5">After you start processing, uploading additional files for this run will not be allowed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={() => setShowProcessConfirm(false)} disabled={isConfirmingProcess} className="px-4 py-2.5 rounded-2xl font-black text-[14px] bg-white text-slate-700 border border-slate-300 hover:border-slate-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">Cancel (Upload More)</button>
              <button type="button" disabled={isConfirmingProcess} onClick={async () => { if (isConfirmingProcess) return; setIsConfirmingProcess(true); try { setShowProcessConfirm(false); await handleProcess(); } finally { setIsConfirmingProcess(false); } }} className="px-4 py-2.5 rounded-2xl font-black text-[14px] bg-[#0f172a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isConfirmingProcess ? <><Loader2 size={15} className="animate-spin" />Confirming…</> : "Confirm & Process"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-[14px]">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-[#0f172a] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 grid-pattern" />
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white border border-white/20 shadow-2xl backdrop-blur-md shrink-0">
                {data?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">{data?.full_name}</h1>
                  <StatusBadge dischargeDate={data?.discharge_date} />
                </div>
                <p className="text-slate-400 text-[14px] font-medium">{data?.email}</p>
                <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                  {data?.phone_number && <span className="flex items-center gap-1.5 text-slate-300 text-[13px]"><Phone size={13} className="text-slate-500" /> {data.phone_number}</span>}
                  {data?.dob && <span className="flex items-center gap-1.5 text-slate-300 text-[13px]"><Calendar size={13} className="text-slate-500" /> {data.dob}</span>}
                  {data?.gender && <span className="flex items-center gap-1.5 text-slate-300 text-[13px]"><User size={13} className="text-slate-500" /> {data.gender}</span>}
                </div>
              </div>
              <div className="shrink-0 text-right hidden md:block">
                <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">Patient ID</p>
                <p className="text-white font-black text-2xl">#{String(id).padStart(4, "0")}</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <Stethoscope size={18} className="text-slate-400" />
              <h2 className="text-slate-800 font-black text-[16px]">Patient Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailItem icon={<Mail />} label="Email" value={data?.email} />
              <DetailItem icon={<Phone />} label="Phone" value={data?.phone_number || "Not provided"} />
              <DetailItem icon={<Calendar />} label="Date of Birth" value={data?.dob} />
              <DetailItem icon={<Activity />} label="Gender" value={data?.gender} />
              <div className="md:col-span-2"><DetailItem icon={<MapPin />} label="Address" value={data?.address || "No address on file"} /></div>
              <DetailItem icon={<Clock />} label="Discharge Date" value={data?.discharge_date || "Currently Admitted"} />
              <DetailItem icon={<ShieldCheck />} label="Status" value={data?.discharge_date ? "Discharged" : "Active Patient"} />
            </div>
          </div>

          {isEditing && (
            <div className="px-6 md:px-10 pb-2">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gradient-to-r from-[#0f172a] to-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl"><Zap size={16} className="text-white" /></div>
                  <div>
                    <h3 className="text-white font-black text-[15px]">Process Discharge Documents</h3>
                    <p className="text-white/60 text-[11px] mt-0.5">Attach patient documents and submit for processing</p>
                  </div>
                  {isCompleted && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
                      <CheckCircle size={13} className="text-emerald-400" />
                      <span className="text-emerald-300 text-[12px] font-black">All Processed</span>
                    </div>
                  )}
                  {isFailed && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-xl">
                      <AlertCircle size={13} className="text-red-400" />
                      <span className="text-red-300 text-[12px] font-black">Processing Failed</span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
                      <Loader2 size={13} className="text-amber-400 animate-spin" />
                      <span className="text-amber-300 text-[12px] font-black">Processing…</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6">
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* ── Left col: Drop zones OR completed dropdowns ─────── */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">
                        {isCompleted ? "Submitted Documents" : "Attach Documents"}
                      </p>

                      {/*
                        ─────────────────────────────────────────────────────
                        BUG FIX: The "View Uploaded" dropdowns now ONLY appear
                        after processState === "completed" (isCompleted).

                        Previously the condition was:
                          (apiSucceeded && !isFailed)
                        which evaluated to true the moment the upload API call
                        returned a discharge_id — i.e. immediately at the START
                        of processing — causing the dropdowns to show during
                        the "Processing..." state.

                        The fix removes that middle branch entirely.
                        During processing the user sees the normal DropZones
                        (locked/dimmed). Only on completion do we swap to
                        CompletedDocumentsSection which fetches and shows the
                        processed docs with Open buttons for reports & bills.
                        ─────────────────────────────────────────────────────
                      */}
                      {isCompleted ? (
                        <CompletedDocumentsSection patientId={id} data={data} dischargeId={dischargeId} />
                      ) : (
                        <>
                          <DropZone
                            type="reports" label="Medical Reports" icon={FlaskConical}
                            files={files.reports} fileStatuses={fileStatuses.reports} fileErrors={fileErrors.reports}
                            onAdd={(f) => addFiles("reports", f)} onRemove={(i) => removeFile("reports", i)}
                            disabled={isProcessing} processedCount={processedCounts.reports}
                          />
                          <DropZone
                            type="bills" label="Bills" icon={Receipt}
                            files={files.bills} fileStatuses={fileStatuses.bills} fileErrors={fileErrors.bills}
                            onAdd={(f) => addFiles("bills", f)} onRemove={(i) => removeFile("bills", i)}
                            disabled={isProcessing} processedCount={processedCounts.bills}
                          />
                          <DropZone
                            type="prescriptions" label="Prescriptions" icon={Pill}
                            files={files.prescriptions} fileStatuses={fileStatuses.prescriptions} fileErrors={fileErrors.prescriptions}
                            onAdd={(f) => addFiles("prescriptions", f)} onRemove={(i) => removeFile("prescriptions", i)}
                            disabled={isProcessing} processedCount={processedCounts.prescriptions}
                          />
                        </>
                      )}

                      {submitError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-red-700 text-[13px] font-semibold">{submitError}</p>
                        </div>
                      )}

                      {isFailed && failInfo?.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Ban size={14} className="text-red-500" />
                            <span className="text-red-700 font-black text-[13px]">Processing stopped</span>
                          </div>
                          <p className="text-red-600 text-[12px] font-medium leading-relaxed">{failInfo.error}</p>
                          {errorDetails?.error_code && (
                            <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-red-700 font-bold text-[11px] uppercase tracking-widest">Error Code:</span>
                                <code className="text-red-600 text-[11px] font-mono bg-white px-2 py-1 rounded border border-red-200">{errorDetails.error_code}</code>
                              </div>
                              {errorDetails.message && <p className="text-red-700 text-[11px] font-semibold">{errorDetails.message}</p>}
                              {errorDetails.context && (
                                <div className="mt-2 text-[10px] bg-white p-2 rounded border border-red-200 text-red-700 font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                                  {Object.entries(errorDetails.context).map(([key, val]) => `${key}: ${val}`).join("\n")}
                                </div>
                              )}
                              {errorDetails.action && (
                                <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                                  <Zap size={12} className="text-amber-600 shrink-0 mt-0.5" />
                                  <p className="text-amber-700 text-[11px] font-semibold">{errorDetails.action}</p>
                                </div>
                              )}
                            </div>
                          )}
                          {failInfo?.failed_at && <p className="text-red-500 text-[11px] mt-1 font-semibold">Failed at: {failInfo.failed_at.type} file #{failInfo.failed_at.index + 1}</p>}
                          <p className="text-slate-500 text-[11px] mt-2 italic">{failInfo?.message}</p>
                        </div>
                      )}
                    </div>

                    {/* ── Right col: Timeline + Actions ─────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">Status</p>

                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">Document Progress</p>
                        <div className="flex flex-col gap-3">
                          <TimelineRow icon={FlaskConical} label="Reports" total={timelineTotal.reports} processed={processedCounts.reports} isActive={isProcessing && activeType === "reports"} isFailed={isFailed && failInfo?.failed_at?.type === "report"} isSkipped={timelineTotal.reports === 0} />
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <TimelineRow icon={Receipt} label="Bills" total={timelineTotal.bills} processed={processedCounts.bills} isActive={isProcessing && activeType === "bills"} isFailed={isFailed && failInfo?.failed_at?.type === "bill"} isSkipped={timelineTotal.bills === 0} />
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <TimelineRow icon={Pill} label="Prescriptions" total={timelineTotal.prescriptions} processed={processedCounts.prescriptions} isActive={isProcessing && activeType === "prescriptions"} isFailed={isFailed && failInfo?.failed_at?.type === "prescription"} isSkipped={timelineTotal.prescriptions === 0} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Reports", val: processedCounts.reports, total: timelineTotal.reports, color: "blue" },
                          { label: "Bills", val: processedCounts.bills, total: timelineTotal.bills, color: "slate" },
                          { label: "Rx", val: processedCounts.prescriptions, total: timelineTotal.prescriptions, color: "teal" },
                        ].map(({ label, val, total, color }) => (
                          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
                            <p className={`text-[20px] font-black text-${color}-600 tabular-nums leading-none`}>{val}</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">{label}</p>
                            {total > 0 && val === total && <CheckCircle size={11} className="text-emerald-500 mx-auto mt-1" />}
                          </div>
                        ))}
                      </div>

                      {!isCompleted && !isFailed && (
                        <button onClick={() => { if (isProcessing) return; setShowProcessConfirm(true); }} disabled={isProcessing || !anyFiles} className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-[#0f172a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                          {isProcessing ? "Processing…" : "Process All Documents"}
                        </button>
                      )}

                      {!isCompleted && isFailed && (
                        <button onClick={handleRetry} disabled={isProcessing} className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                          {isProcessing ? "Retrying…" : "Retry Upload"}
                        </button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-emerald-700 font-black text-[13px]">All documents processed</p>
                            <p className="text-emerald-600 text-[11px]">Patient is ready for discharge</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="px-6 md:px-10 pb-8">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl"><FileText size={16} className="text-white" /></div>
                  <div>
                    <h3 className="text-white font-black text-[15px]">Generate Patient Documents</h3>
                    <p className="text-white/60 text-[11px] mt-0.5">Upload discharge summary and generate patient-friendly & insurance-ready documents</p>
                  </div>
                  {summaryStatus === "completed" && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
                      <CheckCircle size={13} className="text-emerald-400" />
                      <span className="text-emerald-300 text-[12px] font-black">Summary Uploaded</span>
                    </div>
                  )}
                  {summaryStatus === "uploading" && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
                      <Loader2 size={13} className="text-amber-400 animate-spin" />
                      <span className="text-amber-300 text-[12px] font-black">Uploading…</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6">
                  <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">Upload Discharge Summary</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg text-indigo-600 bg-indigo-100"><FileText size={14} /></div>
                          <span className="text-[13px] font-black uppercase tracking-wider text-indigo-700">Discharge Summary</span>
                          <span className="ml-auto text-[11px] text-slate-400 font-semibold">{summaryFile ? "1/1 file" : "0/1 file"}</span>
                        </div>
                        <div
                          onDragOver={(e) => { e.preventDefault(); if (summaryStatus === "uploading" || summaryStatus === "processing") return; e.currentTarget.classList.add("border-slate-400", "bg-slate-100"); }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-slate-400", "bg-slate-100"); }}
                          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-slate-400", "bg-slate-100"); if (summaryStatus === "uploading" || summaryStatus === "processing") return; const file = e.dataTransfer.files[0]; if (file && file.name.toLowerCase().endsWith(".pdf")) { handleSummaryUpload(file); } else { setSummaryError("Only PDF files are allowed"); } }}
                          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${summaryStatus === "uploading" || summaryStatus === "processing" ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                        >
                          <input id="summary-upload" type="file" accept=".pdf" disabled={summaryStatus === "uploading" || summaryStatus === "processing"} className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) handleSummaryUpload(file); }} />
                          {!summaryFile ? (
                            <label htmlFor="summary-upload" className="flex flex-col items-center justify-center py-6 gap-2 cursor-pointer">
                              <Upload size={22} className="text-slate-300" />
                              <p className="text-slate-400 text-[13px] font-semibold">Drop PDF or click to browse</p>
                              <p className="text-slate-300 text-[11px]">Single discharge summary file</p>
                            </label>
                          ) : (
                            <div className="p-3">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${summaryStatus === "completed" ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : summaryStatus === "failed" ? "border-red-200 bg-red-50/60 text-red-700" : summaryStatus === "uploading" ? "border-amber-200 bg-amber-50/60 text-amber-800" : "border-slate-200 bg-white text-slate-700"}`}>
                                <FileText size={12} className="shrink-0 opacity-60" />
                                <span className="truncate flex-1">{summaryFile.name}</span>
                                {summaryStatus === "completed" && <CheckCircle size={12} className="text-emerald-500 shrink-0" />}
                                {summaryStatus === "failed" && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                                {summaryStatus === "uploading" && <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />}
                                {summaryStatus !== "uploading" && summaryStatus !== "processing" && <button onClick={removeSummaryFile} className="ml-auto text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>}
                              </div>
                            </div>
                          )}
                        </div>
                        {summaryStatus === "uploading" && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-slate-500">Uploading...</span>
                              <span className="text-amber-600">{summaryProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${summaryProgress}%` }} />
                            </div>
                          </div>
                        )}
                        {summaryError && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-700 text-[13px] font-semibold">{summaryError}</p>
                          </div>
                        )}
                      </div>

                      {(patientFriendlyUrl || insuranceReadyUrl) && (
                        <div className="flex flex-col gap-3 mt-4">
                          <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">Generated Documents</p>
                          {patientFriendlyUrl && (
                            <a href={patientFriendlyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-emerald-200 rounded-2xl hover:border-emerald-400 transition-all group">
                              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-all"><FileText size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-800 font-bold text-[14px]">Patient-Friendly Document</p>
                                <p className="text-slate-500 text-[12px] truncate">Click to view or download</p>
                              </div>
                              <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                            </a>
                          )}
                          {insuranceReadyUrl && (
                            <a href={insuranceReadyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-2xl hover:border-blue-400 transition-all group">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-all"><Receipt size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-800 font-bold text-[14px]">Insurance-Ready Document</p>
                                <p className="text-slate-500 text-[12px] truncate">Click to view or download</p>
                              </div>
                              <CheckCircle size={18} className="text-blue-500 shrink-0" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">Generate Documents</p>
                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">Document Status</p>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${summaryStatus === "completed" ? "bg-emerald-500 shadow-emerald-300 shadow-sm" : summaryStatus === "failed" ? "bg-red-500 shadow-red-300 shadow-sm" : summaryStatus === "uploading" ? "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm" : "bg-slate-300"}`} />
                            <span className="text-[13px] text-slate-600 font-semibold">Discharge Summary</span>
                            {summaryStatus === "completed" && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
                          </div>
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${patientFriendlyUrl ? "bg-emerald-500 shadow-emerald-300 shadow-sm" : isGeneratingPatientDoc ? "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm" : "bg-slate-300"}`} />
                            <span className="text-[13px] text-slate-600 font-semibold">Patient-Friendly</span>
                            {patientFriendlyUrl && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
                          </div>
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${insuranceReadyUrl ? "bg-emerald-500 shadow-emerald-300 shadow-sm" : isGeneratingInsuranceDoc ? "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm" : "bg-slate-300"}`} />
                            <span className="text-[13px] text-slate-600 font-semibold">Insurance-Ready</span>
                            {insuranceReadyUrl && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mt-auto">
                        <button onClick={handleGeneratePatientFriendly} disabled={isGeneratingPatientDoc || isGeneratingInsuranceDoc} className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          {isGeneratingPatientDoc ? <><Loader2 size={15} className="animate-spin" />Generating...</> : <><FileText size={15} />{patientFriendlyUrl ? "Regenerate" : "Generate"} Patient-Friendly</>}
                        </button>
                        <button onClick={handleGenerateInsuranceReady} disabled={isGeneratingPatientDoc || isGeneratingInsuranceDoc} className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          {isGeneratingInsuranceDoc ? <><Loader2 size={15} className="animate-spin" />Generating...</> : <><Receipt size={15} />Generate Insurance-Ready Doc</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 md:p-10 pt-6 flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${isEditing ? "bg-white text-slate-700 border border-slate-300 hover:border-slate-500" : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"}`}
            >
              {isEditing ? <><ChevronUp size={16} /> Close Panel</> : <><FileText size={16} /> Manage Discharge Documents</>}
            </button>
            {data?.discharge_date && (
              <div className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-400 font-bold text-[15px] text-center flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" />
                Discharged on {data.discharge_date}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}