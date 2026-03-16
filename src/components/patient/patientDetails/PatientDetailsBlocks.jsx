import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  FileText,
  FlaskConical,
  Loader2,
  Lock,
  Plus,
  Pill,
  Receipt,
  Upload,
  X,
} from "lucide-react";
import api from "../../../lib/axios";
import { API_ROUTES } from "../../../lib/routes";
import { getMaxFiles } from "../../../lib/patientDetailsUtils";

function FilePill({ file, status, onRemove, disabled, errorMessage }) {
  const base =
    status === "done"
      ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
      : status === "error"
        ? "border-red-200 bg-red-50/60 text-red-700"
        : status === "processing"
          ? "border-amber-200 bg-amber-50/60 text-amber-800"
          : "border-slate-200 bg-white text-slate-700";

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${base} transition-all duration-300`}
    >
      <FileText size={12} className="shrink-0 opacity-60" />
      <span className="truncate max-w-[130px]">{file.name}</span>
      {status === "done" && (
        <CheckCircle size={12} className="text-emerald-500 shrink-0" />
      )}
      {status === "error" && (
        <div className="relative flex items-center">
          <AlertCircle
            size={12}
            className="text-red-500 shrink-0"
            title={errorMessage || ""}
          />
          {errorMessage && (
            <div className="pointer-events-none absolute left-1/2 -top-2 z-30 hidden w-64 -translate-x-1/2 -translate-y-full rounded-2xl border border-slate-900/40 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-50 shadow-xl shadow-slate-900/40 group-hover:block">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      {status === "processing" && (
        <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />
      )}
      {!disabled && status !== "done" && status !== "processing" && (
        <button
          onClick={onRemove}
          className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export function DropZone({
  type,
  label,
  icon: Icon,
  files,
  fileStatuses,
  fileErrors,
  onAdd,
  onRemove,
  disabled,
  processedCount,
}) {
  const inputId = `dropzone-${type}`;
  const remaining = getMaxFiles(type) - files.length - processedCount;
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    onAdd(Array.from(e.dataTransfer.files));
  };

  const typeColors = {
    reports: {
      ring: "ring-blue-400",
      bg: "bg-blue-50",
      icon: "text-blue-600 bg-blue-100",
      label: "text-blue-700",
    },
    bills: {
      ring: "ring-slate-400",
      bg: "bg-slate-50",
      icon: "text-slate-600 bg-slate-100",
      label: "text-slate-700",
    },
    prescriptions: {
      ring: "ring-teal-400",
      bg: "bg-teal-50",
      icon: "text-teal-600 bg-teal-100",
      label: "text-teal-700",
    },
  };
  const c = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${c.icon}`}>
          <Icon size={14} />
        </div>
        <span className={`text-[13px] font-black uppercase tracking-wider ${c.label}`}>
          {label}
        </span>
        <span className="ml-auto text-[11px] text-slate-400 font-semibold">
          {files.length}/{getMaxFiles(type)} files
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
          disabled
            ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
            : drag
              ? `${c.ring} ring-2 ${c.bg} border-transparent`
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
        <input
          id={inputId}
          type="file"
          accept=".pdf"
          multiple
          disabled={disabled || remaining <= 0}
          className="hidden"
          onChange={(e) => onAdd(Array.from(e.target.files))}
        />
        {files.length === 0 ? (
          <label
            htmlFor={inputId}
            className={`flex flex-col items-center justify-center py-6 gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Upload size={22} className="text-slate-300" />
            <p className="text-slate-400 text-[13px] font-semibold">Drop PDFs or click to browse</p>
            <p className="text-slate-300 text-[11px]">Up to {getMaxFiles(type)} files</p>
          </label>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {files.map((f, i) => (
              <FilePill
                key={i}
                file={f}
                status={fileStatuses?.[i] ?? "queued"}
                errorMessage={fileErrors?.[i] ?? null}
                onRemove={() => onRemove(i)}
                disabled={disabled}
              />
            ))}
            {remaining > 0 && !disabled && (
              <label
                htmlFor={inputId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-[12px] font-semibold cursor-pointer hover:border-slate-400 transition-all"
              >
                <Plus size={12} /> Add more ({remaining} left)
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineRow({
  icon: Icon,
  label,
  total,
  processed,
  isActive,
  isFailed,
  isSkipped,
}) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isDone = processed === total && total > 0;
  const state = isSkipped
    ? "skipped"
    : isFailed
      ? "failed"
      : isDone
        ? "done"
        : isActive
          ? "active"
          : "waiting";

  const stateStyles = {
    skipped: {
      dot: "bg-slate-200",
      bar: "bg-slate-200",
      label: "text-slate-400",
      pct: "text-slate-400",
    },
    failed: {
      dot: "bg-red-500 shadow-red-300 shadow-sm",
      bar: "bg-red-400",
      label: "text-red-600 font-black",
      pct: "text-red-500",
    },
    done: {
      dot: "bg-emerald-500 shadow-emerald-300 shadow-sm",
      bar: "bg-emerald-400",
      label: "text-emerald-700 font-black",
      pct: "text-emerald-600",
    },
    active: {
      dot: "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm",
      bar: "bg-amber-400",
      label: "text-amber-700 font-black",
      pct: "text-amber-600",
    },
    waiting: {
      dot: "bg-slate-300",
      bar: "bg-slate-200",
      label: "text-slate-500",
      pct: "text-slate-400",
    },
  };

  const s = stateStyles[state];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot} transition-all duration-500`} />
      <div className={`flex items-center gap-1.5 w-36 shrink-0 ${s.label} text-[13px]`}>
        {state === "done" ? (
          <CheckCircle size={14} className="text-emerald-500" />
        ) : state === "failed" ? (
          <AlertCircle size={14} className="text-red-500" />
        ) : state === "active" ? (
          <Loader2 size={14} className="animate-spin text-amber-500" />
        ) : (
          <Icon size={14} className="text-slate-400" />
        )}
        {label}
      </div>
      {total > 0 && (
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${s.bar} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <span className={`text-[12px] font-black tabular-nums shrink-0 w-14 text-right ${s.pct}`}>
        {state === "skipped" ? "—" : `${processed}/${total}`}
      </span>
    </div>
  );
}

function DocumentDropdown({ icon: Icon, label, documents, colorClass, type }) {
  const [isOpen, setIsOpen] = useState(false);
  const docs = Array.isArray(documents) ? documents : [];

  const getDocumentTitle = (doc) => {
    if (type === "reports") return doc.report_name || doc.name || "Report";
    if (type === "bills") {
      return doc.invoice_number ? `Invoice #${doc.invoice_number}` : doc.name || "Bill";
    }
    if (type === "prescriptions") {
      return doc.drug_name || doc.prescription_name || doc.name || "Prescription";
    }
    return doc.name || "Document";
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
    reports: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      hover: "hover:border-blue-300",
      badge: "bg-blue-100 text-blue-700",
    },
    bills: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      hover: "hover:border-slate-300",
      badge: "bg-slate-100 text-slate-700",
    },
    prescriptions: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      hover: "hover:border-teal-300",
      badge: "bg-teal-100 text-teal-700",
    },
  };

  const tc = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border ${tc.border} ${tc.bg} ${tc.hover} transition-all text-left`}
      >
        <Icon size={16} className={colorClass} />
        <span className="font-bold text-slate-800 text-[13px] flex-1">View Uploaded {label}</span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${tc.badge}`}>{docs.length}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 pl-1">
          {docs.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <AlertCircle size={14} className="text-slate-400 shrink-0" />
              <p className="text-slate-500 text-[12px] font-semibold">
                No {label.toLowerCase()} found. The documents may still be indexing - try refreshing the page.
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
                    {subtitle && <p className="text-slate-500 text-[11px] mt-0.5 truncate">{subtitle}</p>}
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

export function CompletedDocumentsSection({ patientId, dischargeId }) {
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
          const patientRes = await api.get(API_ROUTES.admin.patientById(patientId));
          dId = patientRes.data?.latest_discharge_id;
        }

        if (!dId) {
          setFetchError("No discharge record found for this patient.");
          return;
        }

        const docsRes = await api.get(API_ROUTES.admin.dischargeDocuments(dId));
        const d = docsRes.data;

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
        <p className="text-slate-500 text-[13px] font-semibold">Loading uploaded documents...</p>
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

export function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 group hover:border-slate-300 transition-all">
      <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-all shrink-0">
        {React.cloneElement(icon, { size: 17 })}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 font-semibold text-[12px] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-800 font-bold text-[14px] truncate">{value || "-"}</p>
      </div>
    </div>
  );
}

export function StatusBadge({ dischargeDate }) {
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
