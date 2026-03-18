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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "error"
        ? "border-red-200 bg-red-50 text-red-600"
        : status === "processing"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-white text-slate-600";

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[12px] font-medium ${base} transition-all duration-200`}
    >
      <FileText size={11} className="shrink-0 opacity-50" />
      <span className="truncate max-w-[140px]">{file.name}</span>
      {status === "done" && (
        <CheckCircle size={11} className="text-emerald-500 shrink-0 ml-auto" />
      )}
      {status === "error" && (
        <div className="relative flex items-center ml-auto">
          <AlertCircle
            size={11}
            className="text-red-400 shrink-0"
            title={errorMessage || ""}
          />
          {errorMessage && (
            <div className="pointer-events-none absolute left-1/2 -top-2 z-30 hidden w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-800/30 bg-slate-900 px-3 py-2 text-[11px] font-medium text-slate-100 shadow-xl group-hover:block">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      {status === "processing" && (
        <Loader2
          size={11}
          className="animate-spin text-amber-400 shrink-0 ml-auto"
        />
      )}
      {!disabled && status !== "done" && status !== "processing" && (
        <button
          onClick={onRemove}
          className="ml-auto text-slate-300 hover:text-red-400 transition-colors"
        >
          <X size={11} />
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
      accent: "text-blue-500",
      dragBorder: "border-blue-300 bg-blue-50/40",
      iconBg: "bg-blue-50 text-blue-500",
      label: "text-blue-600",
    },
    bills: {
      accent: "text-slate-500",
      dragBorder: "border-slate-400 bg-slate-50/60",
      iconBg: "bg-slate-100 text-slate-500",
      label: "text-slate-600",
    },
    prescriptions: {
      accent: "text-teal-500",
      dragBorder: "border-teal-300 bg-teal-50/40",
      iconBg: "bg-teal-50 text-teal-500",
      label: "text-teal-600",
    },
  };
  const c = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-md ${c.iconBg}`}>
          <Icon size={13} />
        </div>
        <span
          className={`text-[12px] font-semibold tracking-wide uppercase ${c.label}`}
        >
          {label}
        </span>
        <span className="ml-auto text-[11px] text-slate-400">
          {files.length} / {getMaxFiles(type)}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          disabled
            ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50"
            : drag
              ? `${c.dragBorder} border-solid`
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {disabled && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 shadow border border-slate-100">
              <Lock size={12} className="text-slate-400" />
              <span className="text-[11px] font-medium text-slate-500">
                Processing…
              </span>
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
            className={`flex flex-col items-center justify-center py-8 gap-1.5 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Upload size={18} className="text-slate-300" />
            <p className="text-slate-400 text-[12px] font-medium">
              Drop PDFs or click to browse
            </p>
            <p className="text-slate-300 text-[11px]">
              Up to {getMaxFiles(type)} files
            </p>
          </label>
        ) : (
          <div className="p-2.5 flex flex-col gap-1.5">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-200 text-slate-400 text-[11px] font-medium cursor-pointer hover:border-slate-300 transition-all"
              >
                <Plus size={11} /> Add more ({remaining} left)
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
      pct: "text-slate-300",
    },
    failed: {
      dot: "bg-red-400",
      bar: "bg-red-400",
      label: "text-red-500 font-semibold",
      pct: "text-red-400",
    },
    done: {
      dot: "bg-emerald-400",
      bar: "bg-emerald-400",
      label: "text-emerald-600 font-semibold",
      pct: "text-emerald-500",
    },
    active: {
      dot: "bg-amber-400 animate-pulse",
      bar: "bg-amber-400",
      label: "text-amber-600 font-semibold",
      pct: "text-amber-500",
    },
    waiting: {
      dot: "bg-slate-200",
      bar: "bg-slate-200",
      label: "text-slate-500",
      pct: "text-slate-300",
    },
  };

  const s = stateStyles[state];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${s.dot} transition-all duration-500`}
      />
      <div
        className={`flex items-center gap-2 w-32 shrink-0 ${s.label} text-[12px]`}
      >
        {state === "done" ? (
          <CheckCircle size={13} className="text-emerald-400" />
        ) : state === "failed" ? (
          <AlertCircle size={13} className="text-red-400" />
        ) : state === "active" ? (
          <Loader2 size={13} className="animate-spin text-amber-400" />
        ) : (
          <Icon size={13} className="text-slate-300" />
        )}
        {label}
      </div>
      {total > 0 && (
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${s.bar} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <span
        className={`text-[11px] tabular-nums shrink-0 w-12 text-right ${s.pct}`}
      >
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
      return doc.invoice_number
        ? `Invoice #${doc.invoice_number}`
        : doc.name || "Bill";
    }
    if (type === "prescriptions") {
      return (
        doc.drug_name || doc.prescription_name || doc.name || "Prescription"
      );
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
        doc.frequency_of_dose_per_day &&
          `${doc.frequency_of_dose_per_day}x/day`,
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
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      hover: "hover:border-blue-200",
      badge: "bg-blue-50 text-blue-500 border border-blue-100",
    },
    bills: {
      bg: "bg-slate-50/50",
      border: "border-slate-200",
      hover: "hover:border-slate-300",
      badge: "bg-slate-100 text-slate-500 border border-slate-200",
    },
    prescriptions: {
      bg: "bg-teal-50/50",
      border: "border-teal-100",
      hover: "hover:border-teal-200",
      badge: "bg-teal-50 text-teal-500 border border-teal-100",
    },
  };

  const tc = typeColors[type] || typeColors.reports;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border ${tc.border} ${tc.bg} ${tc.hover} transition-all text-left`}
      >
        <Icon size={14} className={colorClass} />
        <span className="font-medium text-slate-700 text-[13px] flex-1">
          {label}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tc.badge}`}
        >
          {docs.length}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1.5 pl-0.5">
          {docs.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <AlertCircle size={13} className="text-slate-300 shrink-0" />
              <p className="text-slate-400 text-[12px]">
                No {label.toLowerCase()} found. Documents may still be indexing.
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
                  className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all group"
                >
                  <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg shrink-0 group-hover:bg-slate-800 group-hover:border-transparent transition-all">
                    <FileText
                      size={13}
                      className="text-slate-400 group-hover:text-white transition-all"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-slate-700 text-[12px] truncate"
                      title={title}
                    >
                      {title}
                    </p>
                    {subtitle && (
                      <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {showOpenButton && url && (
                    <button
                      onClick={() =>
                        window.open(url, "_blank", "noopener,noreferrer")
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-[11px] font-medium hover:bg-slate-700 transition-all shrink-0"
                    >
                      <ExternalLink size={10} />
                      Open
                    </button>
                  )}
                  {showOpenButton && !url && (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-300 text-[11px] font-medium cursor-not-allowed shrink-0"
                    >
                      <ExternalLink size={10} />
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
          const patientRes = await api.get(
            API_ROUTES.admin.patientById(patientId),
          );
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
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <Loader2 size={14} className="animate-spin text-slate-300 shrink-0" />
        <p className="text-slate-400 text-[12px]">
          Loading uploaded documents…
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-600 text-[13px] font-medium">
            Could not load documents
          </p>
          <p className="text-amber-500 text-[12px] mt-0.5">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DocumentDropdown
        icon={FlaskConical}
        label="Reports"
        documents={reports}
        colorClass="text-blue-400"
        type="reports"
      />
      <DocumentDropdown
        icon={Receipt}
        label="Bills"
        documents={bills}
        colorClass="text-slate-400"
        type="bills"
      />
      <DocumentDropdown
        icon={Pill}
        label="Prescriptions"
        documents={prescriptions}
        colorClass="text-teal-400"
        type="prescriptions"
      />
    </div>
  );
}

export function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/60 border border-slate-100 group hover:border-slate-200 hover:bg-slate-50 transition-all">
      <div className="p-2 bg-white text-slate-400 rounded-lg border border-slate-100 group-hover:bg-slate-800 group-hover:text-white group-hover:border-transparent transition-all shrink-0 mt-0.5">
        {React.cloneElement(icon, { size: 14 })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-slate-700 text-[13px] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export function StatusBadge({ dischargeDate }) {
  if (dischargeDate) {
    return (
      <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-full text-[10px] font-medium uppercase tracking-widest border border-white/10">
        Discharged
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-medium uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      Active
    </span>
  );
}
