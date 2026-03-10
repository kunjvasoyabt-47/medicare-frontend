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
} from "lucide-react";

const MAX_FILES = 5;

// ─── Shared helpers ───────────────────────────────────────────────────────────
function fileListIcon(status, Icon) {
  if (status === "done")
    return <CheckCircle size={13} className="text-emerald-500 shrink-0" />;
  if (status === "error")
    return <AlertCircle size={13} className="text-red-500 shrink-0" />;
  if (status === "processing")
    return (
      <Loader2 size={13} className="animate-spin text-amber-500 shrink-0" />
    );
  return <Icon size={13} className="text-slate-400 shrink-0" />;
}

// ─── Small file pill row ──────────────────────────────────────────────────────
function FilePill({ file, status, onRemove, disabled }) {
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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${base} transition-all duration-300`}
    >
      <FileText size={12} className="shrink-0 opacity-60" />
      <span className="truncate max-w-[130px]">{file.name}</span>
      {status === "done" && (
        <CheckCircle size={12} className="text-emerald-500 shrink-0" />
      )}
      {status === "error" && (
        <AlertCircle size={12} className="text-red-500 shrink-0" />
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

// ─── Multi-file Drop Zone ─────────────────────────────────────────────────────
function DropZone({
  type,
  label,
  icon: Icon,
  files,
  fileStatuses,
  onAdd,
  onRemove,
  disabled,
  processedCount,
}) {
  const inputId = `dropzone-${type}`;
  const remaining = MAX_FILES - files.length - processedCount;
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    onAdd(dropped);
  };

  const typeColors = {
    reports: {
      ring: "ring-blue-400",
      bg: "bg-blue-50",
      icon: "text-blue-600 bg-blue-100",
      label: "text-blue-700",
    },
    bills: {
      ring: "ring-violet-400",
      bg: "bg-violet-50",
      icon: "text-violet-600 bg-violet-100",
      label: "text-violet-700",
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
      {/* Zone header */}
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${c.icon}`}>
          <Icon size={14} />
        </div>
        <span
          className={`text-[13px] font-black uppercase tracking-wider ${c.label}`}
        >
          {label}
        </span>
        <span className="ml-auto text-[11px] text-slate-400 font-semibold">
          {files.length + processedCount}/{MAX_FILES} files
        </span>
      </div>

      {/* Drop target */}
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
        <input
          id={inputId}
          type="file"
          accept=".pdf"
          multiple
          disabled={disabled || remaining <= 0}
          className="hidden"
          onChange={(e) => onAdd(Array.from(e.target.files))}
        />

        {files.length === 0 && processedCount === 0 ? (
          <label
            htmlFor={inputId}
            className={`flex flex-col items-center justify-center py-6 gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Upload size={22} className="text-slate-300" />
            <p className="text-slate-400 text-[13px] font-semibold">
              Drop PDFs or click to browse
            </p>
            <p className="text-slate-300 text-[11px]">
              Up to {MAX_FILES} files
            </p>
          </label>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {/* Already processed files (greyed out done pills) */}
            {Array.from({ length: processedCount }).map((_, i) => (
              <div
                key={`proc-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-700 text-[12px] font-semibold"
              >
                <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                <span className="truncate">
                  File {i + 1} — already processed
                </span>
              </div>
            ))}
            {/* Queued / in-progress files */}
            {files.map((f, i) => (
              <FilePill
                key={i}
                file={f}
                status={fileStatuses?.[i] ?? "queued"}
                onRemove={() => onRemove(i)}
                disabled={disabled}
              />
            ))}
            {/* Add more button */}
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

// ─── Processing Timeline Row ──────────────────────────────────────────────────
function TimelineRow({
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
      {/* Leading dot */}
      <div
        className={`w-3 h-3 rounded-full shrink-0 ${s.dot} transition-all duration-500`}
      />

      {/* Icon + label */}
      <div
        className={`flex items-center gap-1.5 w-36 shrink-0 ${s.label} text-[13px]`}
      >
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

      {/* Bar */}
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${s.bar} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Count */}
      <span
        className={`text-[12px] font-black tabular-nums shrink-0 w-14 text-right ${s.pct}`}
      >
        {state === "skipped" ? "—" : `${processed}/${total}`}
      </span>

      {/* Per-file ticks */}
      {total > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i < processed
                  ? state === "failed" && i === processed - 1
                    ? "bg-red-400"
                    : "bg-emerald-400"
                  : i === processed && state === "active"
                    ? "bg-amber-300 animate-pulse"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Detail Item ──────────────────────────────────────────────────────────────
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 group hover:border-slate-300 transition-all">
      <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-all shrink-0">
        {React.cloneElement(icon, { size: 17 })}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 font-semibold text-[12px] uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-slate-800 font-bold text-[14px] truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Multi-file state per category
  const [files, setFiles] = useState({
    reports: [],
    bills: [],
    prescriptions: [],
  });
  // Per-file processing statuses: { reports: ["queued"|"processing"|"done"|"error"], ... }
  const [fileStatuses, setFileStatuses] = useState({
    reports: [],
    bills: [],
    prescriptions: [],
  });

  // discharge_id returned by /process or stored for retry
  const [dischargeId, setDischargeId] = useState(null);

  // Overall processing state
  const [processState, setProcessState] = useState("idle"); // idle | processing | completed | failed | retrying
  const [processedCounts, setProcessedCounts] = useState({
    reports: 0,
    bills: 0,
    prescriptions: 0,
  });
  const [totalCounts, setTotalCounts] = useState({
    reports: 0,
    bills: 0,
    prescriptions: 0,
  });
  const [activeType, setActiveType] = useState(null); // "reports"|"bills"|"prescriptions"
  const [failInfo, setFailInfo] = useState(null); // from 422 response detail
  const [submitError, setSubmitError] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  const pollingRef = useRef(null);
  const toastRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const resetUploadState = useCallback(() => {
    setFiles({ reports: [], bills: [], prescriptions: [] });
    setFileStatuses({ reports: [], bills: [], prescriptions: [] });
    setProcessState("idle");
    setProcessedCounts({ reports: 0, bills: 0, prescriptions: 0 });
    setTotalCounts({ reports: 0, bills: 0, prescriptions: 0 });
    setActiveType(null);
    setFailInfo(null);
    setSubmitError(null);
    setDischargeId(null);
  }, []);

  useEffect(
    () => () => {
      clearInterval(pollingRef.current);
      clearTimeout(toastRef.current);
    },
    [],
  );

  // Keep a ref to processedCounts for handleRetry closure
  const processedCountsRef = useRef(processedCounts);
  useEffect(() => {
    processedCountsRef.current = processedCounts;
  }, [processedCounts]);

  // ── Fetch patient ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/admin/patients/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  // ── Poll discharge status ─────────────────────────────────────────────────────
  const startPolling = useCallback(
    (dId) => {
      clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/api/discharge/${dId}/status`);
          const s = res.data;
          const p = s.processed ?? {};
          setProcessedCounts({
            reports: p.reports ?? 0,
            bills: p.bills ?? 0,
            prescriptions: p.prescriptions ?? 0,
          });
          // Determine which type is active based on progress vs totals
          setActiveType((prev) => {
            // We infer from counts — if reports not done → reports active, etc.
            return prev; // hold until queue finishes or fails
          });
          if (s.status === "completed" || s.status === "failed") {
            clearInterval(pollingRef.current);
            setProcessState(s.status);
            if (s.status === "completed") {
              // Refresh patient data to update discharge_date
              const pr = await api.get(`/admin/patients/${id}`);
              setData(pr.data);
            }
          }
        } catch {
          // keep polling
        }
      }, 1200);
    },
    [id],
  );

  useEffect(() => () => clearInterval(pollingRef.current), []);

  // ── File management ───────────────────────────────────────────────────────────
  const addFiles = (type, incoming) => {
    const pdfs = incoming.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    const nonPdfs = incoming.filter(
      (f) => !f.name.toLowerCase().endsWith(".pdf"),
    );
    if (nonPdfs.length)
      setSubmitError(
        `Only PDF files are allowed. Skipped: ${nonPdfs.map((f) => f.name).join(", ")}`,
      );
    else setSubmitError(null);

    setFiles((prev) => {
      const current = prev[type];
      const alreadyProcessed = processedCounts[type];
      const capacity = MAX_FILES - current.length - alreadyProcessed;
      const toAdd = pdfs.slice(0, capacity);
      return { ...prev, [type]: [...current, ...toAdd] };
    });
    setFileStatuses((prev) => {
      const toAdd = pdfs.slice(
        0,
        MAX_FILES - prev[type].length - processedCounts[type],
      );
      return { ...prev, [type]: [...prev[type], ...toAdd.map(() => "queued")] };
    });
  };

  const removeFile = (type, index) => {
    setFiles((prev) => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return { ...prev, [type]: updated };
    });
    setFileStatuses((prev) => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return { ...prev, [type]: updated };
    });
  };

  // ── Build FormData helper  ──────────────────────────────────────────────────
  const buildForm = (patientId, reportFiles, billFiles, prescriptionFiles) => {
    const form = new FormData();
    form.append("patient_id", String(patientId));
    reportFiles.forEach((f) => form.append("reports", f));
    billFiles.forEach((f) => form.append("bills", f));
    prescriptionFiles.forEach((f) => form.append("prescriptions", f));
    return form;
  };

  // ── Process (initial submit) ──────────────────────────────────────────────────
  const handleProcess = async () => {
    const totalR = files.reports.length;
    const totalB = files.bills.length;
    const totalP = files.prescriptions.length;

    if (totalR + totalB + totalP === 0) {
      setSubmitError("Please add at least one PDF to process.");
      return;
    }
    setSubmitError(null);
    setProcessState("processing");
    setTotalCounts({ reports: totalR, bills: totalB, prescriptions: totalP });
    setActiveType(
      totalR > 0 ? "reports" : totalB > 0 ? "bills" : "prescriptions",
    );

    // Mark all as processing
    setFileStatuses({
      reports: files.reports.map(() => "processing"),
      bills: files.bills.map(() => "processing"),
      prescriptions: files.prescriptions.map(() => "processing"),
    });

    try {
      const form = buildForm(
        id,
        files.reports,
        files.bills,
        files.prescriptions,
      );
      const res = await api.post("/api/discharge/process", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const dId = res.data.discharge_id;
      setDischargeId(dId);
      const p = res.data.processed ?? {};
      setProcessedCounts({
        reports: p.reports ?? 0,
        bills: p.bills ?? 0,
        prescriptions: p.prescriptions ?? 0,
      });
      setProcessState("completed");
      setActiveType(null);
      // Mark all as done, then clear the files list (processedCounts is ground truth)
      setFileStatuses({
        reports: files.reports.map(() => "done"),
        bills: files.bills.map(() => "done"),
        prescriptions: files.prescriptions.map(() => "done"),
      });
      setFiles({ reports: [], bills: [], prescriptions: [] });
      // Fetch discharge_date from the status endpoint
      try {
        const statusRes = await api.get(`/api/discharge/${dId}/status`);
        const dischargeDate = statusRes.data?.discharge_date;
        if (dischargeDate) {
          setData((prev) => ({ ...prev, discharge_date: dischargeDate }));
        }
      } catch {}
      // Refresh patient
      const pr = await api.get(`/admin/patients/${id}`);
      setData((prev) => ({ ...prev, ...pr.data }));
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 422 && detail) {
        const dId = detail.discharge_id ?? dischargeId;
        setDischargeId(dId);
        const p = detail.progress ?? {};
        const doneR = p.processed_reports ?? 0;
        const doneB = p.processed_bills ?? 0;
        const doneP = p.processed_prescriptions ?? 0;
        setProcessedCounts({
          reports: doneR,
          bills: doneB,
          prescriptions: doneP,
        });
        setFailInfo(detail);
        setProcessState("failed");
        setActiveType(null);
        // Mark statuses: done up to processed, error at failed index, rest queued
        const markStatuses = (
          fileArr,
          done,
          failedType,
          failedIndex,
          myType,
        ) => {
          return fileArr.map((_, i) => {
            if (i < done) return "done";
            if (myType === failedType && i === failedIndex) return "error";
            return "queued";
          });
        };
        const ft = detail?.failed_at?.type;
        const fi = detail?.failed_at?.index ?? 0;
        setFileStatuses({
          reports: markStatuses(files.reports, doneR, ft, fi, "report"),
          bills: markStatuses(files.bills, doneB, ft, fi, "bill"),
          prescriptions: markStatuses(
            files.prescriptions,
            doneP,
            ft,
            fi,
            "prescription",
          ),
        });
      } else {
        setSubmitError(
          err?.response?.data?.detail || "Processing failed. Please try again.",
        );
        setProcessState("idle");
        setFileStatuses({
          reports: files.reports.map(() => "queued"),
          bills: files.bills.map(() => "queued"),
          prescriptions: files.prescriptions.map(() => "queued"),
        });
      }
    }
  };

  // ── Retry ────────────────────────────────────────────────────────────────────
  const handleRetry = async () => {
    if (!dischargeId) return;
    // Only submit files that are not already done (status != "done")
    const pendingReports = files.reports.filter(
      (_, i) => fileStatuses.reports[i] !== "done",
    );
    const pendingBills = files.bills.filter(
      (_, i) => fileStatuses.bills[i] !== "done",
    );
    const pendingPrescriptions = files.prescriptions.filter(
      (_, i) => fileStatuses.prescriptions[i] !== "done",
    );

    if (
      pendingReports.length +
        pendingBills.length +
        pendingPrescriptions.length ===
      0
    ) {
      setSubmitError("Please upload the remaining/failed files for retry.");
      return;
    }
    setSubmitError(null);
    setProcessState("retrying");
    setFailInfo(null);
    // Update totalCounts properly for retry (already processed + new)
    const cur = processedCountsRef.current;
    setTotalCounts({
      reports: cur.reports + pendingReports.length,
      bills: cur.bills + pendingBills.length,
      prescriptions: cur.prescriptions + pendingPrescriptions.length,
    });
    setActiveType(
      pendingReports.length > 0
        ? "reports"
        : pendingBills.length > 0
          ? "bills"
          : "prescriptions",
    );

    // Mark pending as processing
    setFileStatuses((prev) => ({
      reports: prev.reports.map((s, i) => (s !== "done" ? "processing" : s)),
      bills: prev.bills.map((s, i) => (s !== "done" ? "processing" : s)),
      prescriptions: prev.prescriptions.map((s, i) =>
        s !== "done" ? "processing" : s,
      ),
    }));

    try {
      const form = new FormData();
      pendingReports.forEach((f) => form.append("reports", f));
      pendingBills.forEach((f) => form.append("bills", f));
      pendingPrescriptions.forEach((f) => form.append("prescriptions", f));

      const res = await api.post(`/api/discharge/${dischargeId}/retry`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const p = res.data.processed ?? {};
      setProcessedCounts({
        reports: p.reports ?? 0,
        bills: p.bills ?? 0,
        prescriptions: p.prescriptions ?? 0,
      });
      setProcessState("completed");
      setActiveType(null);
      setFileStatuses({
        reports: files.reports.map(() => "done"),
        bills: files.bills.map(() => "done"),
        prescriptions: files.prescriptions.map(() => "done"),
      });
      setFiles({ reports: [], bills: [], prescriptions: [] });
      // Fetch discharge_date from the status endpoint
      try {
        const statusRes = await api.get(`/api/discharge/${dischargeId}/status`);
        const dischargeDate = statusRes.data?.discharge_date;
        if (dischargeDate) {
          setData((prev) => ({ ...prev, discharge_date: dischargeDate }));
        }
      } catch {}
      const pr = await api.get(`/admin/patients/${id}`);
      setData((prev) => ({ ...prev, ...pr.data }));
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 422 && detail) {
        const p = detail.progress ?? {};
        const doneR = p.processed_reports ?? 0;
        const doneB = p.processed_bills ?? 0;
        const doneP = p.processed_prescriptions ?? 0;
        setProcessedCounts({
          reports: doneR,
          bills: doneB,
          prescriptions: doneP,
        });
        setFailInfo(detail);
        setProcessState("failed");
        setActiveType(null);
        const ft = detail?.failed_at?.type;
        const fi = detail?.failed_at?.index ?? 0;
        setFileStatuses((prev) => {
          const mark = (arr, done, myType) =>
            arr.map((_, i) => {
              if (i < done) return "done";
              if (myType === ft && i === fi) return "error";
              return "queued";
            });
          return {
            reports: mark(prev.reports, doneR, "report"),
            bills: mark(prev.bills, doneB, "bill"),
            prescriptions: mark(prev.prescriptions, doneP, "prescription"),
          };
        });
      } else {
        setSubmitError(err?.response?.data?.detail || "Retry failed.");
        setProcessState("failed");
      }
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const isProcessing =
    processState === "processing" || processState === "retrying";
  const isCompleted = processState === "completed";
  const isFailed = processState === "failed";
  const isIdle = processState === "idle";

  const anyFiles =
    files.reports.length + files.bills.length + files.prescriptions.length > 0;

  // For timeline: use totalCounts (set at start of process/retry)
  const timelineTotal = totalCounts;

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#f8fafc]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            Loading Records
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] p-4 md:p-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-[14px] font-bold transition-all duration-500 animate-in slide-in-from-top-3 ${
            toast.type === "error"
              ? "bg-red-600 text-white border-red-700 shadow-red-500/30"
              : "bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/30"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} className="shrink-0" />
          ) : (
            <CheckCircle size={16} className="shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* ── Back ─────────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-[14px]"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* ── Hero Header ──────────────────────────────────────────────────── */}
          <div className="bg-[#0f172a] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white border border-white/20 shadow-2xl backdrop-blur-md shrink-0">
                {data?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    {data?.full_name}
                  </h1>
                  <StatusBadge dischargeDate={data?.discharge_date} />
                </div>
                <p className="text-slate-400 text-[14px] font-medium">
                  {data?.email}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                  {data?.phone_number && (
                    <span className="flex items-center gap-1.5 text-slate-300 text-[13px]">
                      <Phone size={13} className="text-slate-500" />{" "}
                      {data.phone_number}
                    </span>
                  )}
                  {data?.dob && (
                    <span className="flex items-center gap-1.5 text-slate-300 text-[13px]">
                      <Calendar size={13} className="text-slate-500" />{" "}
                      {data.dob}
                    </span>
                  )}
                  {data?.gender && (
                    <span className="flex items-center gap-1.5 text-slate-300 text-[13px]">
                      <User size={13} className="text-slate-500" />{" "}
                      {data.gender}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right hidden md:block">
                <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">
                  Patient ID
                </p>
                <p className="text-white font-black text-2xl">
                  #{String(id).padStart(4, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Patient Details Grid ──────────────────────────────────────────── */}
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <Stethoscope size={18} className="text-slate-400" />
              <h2 className="text-slate-800 font-black text-[16px]">
                Patient Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailItem icon={<Mail />} label="Email" value={data?.email} />
              <DetailItem
                icon={<Phone />}
                label="Phone"
                value={data?.phone_number || "Not provided"}
              />
              <DetailItem
                icon={<Calendar />}
                label="Date of Birth"
                value={data?.dob}
              />
              <DetailItem
                icon={<Activity />}
                label="Gender"
                value={data?.gender}
              />
              <div className="md:col-span-2">
                <DetailItem
                  icon={<MapPin />}
                  label="Address"
                  value={data?.address || "No address on file"}
                />
              </div>
              <DetailItem
                icon={<Clock />}
                label="Discharge Date"
                value={data?.discharge_date || "Currently Admitted"}
              />
              <DetailItem
                icon={<ShieldCheck />}
                label="Status"
                value={data?.discharge_date ? "Discharged" : "Active Patient"}
              />
            </div>
          </div>

          {/* ── Discharge Management Panel ────────────────────────────────────── */}
          {isEditing && !data?.discharge_date && (
            <div className="px-6 md:px-10 pb-2">
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Panel header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0f172a] to-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Zap size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-[15px]">
                      Process Discharge Documents
                    </h3>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      Attach patient documents and submit for processing
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
                      <CheckCircle size={13} className="text-emerald-400" />
                      <span className="text-emerald-300 text-[12px] font-black">
                        All Processed
                      </span>
                    </div>
                  )}
                  {isFailed && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-xl">
                      <AlertCircle size={13} className="text-red-400" />
                      <span className="text-red-300 text-[12px] font-black">
                        Processing Failed
                      </span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
                      <Loader2
                        size={13}
                        className="text-amber-400 animate-spin"
                      />
                      <span className="text-amber-300 text-[12px] font-black">
                        Processing…
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6">
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* ── Left col: Drop zones (3/5 width) ─────────────────── */}
                    <div className="lg:col-span-3 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">
                        Attach Documents
                      </p>

                      <DropZone
                        type="reports"
                        label="Medical Reports"
                        icon={FlaskConical}
                        files={files.reports}
                        fileStatuses={fileStatuses.reports}
                        onAdd={(f) => addFiles("reports", f)}
                        onRemove={(i) => removeFile("reports", i)}
                        disabled={isProcessing}
                        processedCount={processedCounts.reports}
                      />
                      <DropZone
                        type="bills"
                        label="Bills"
                        icon={Receipt}
                        files={files.bills}
                        fileStatuses={fileStatuses.bills}
                        onAdd={(f) => addFiles("bills", f)}
                        onRemove={(i) => removeFile("bills", i)}
                        disabled={isProcessing}
                        processedCount={processedCounts.bills}
                      />
                      <DropZone
                        type="prescriptions"
                        label="Prescriptions"
                        icon={Pill}
                        files={files.prescriptions}
                        fileStatuses={fileStatuses.prescriptions}
                        onAdd={(f) => addFiles("prescriptions", f)}
                        onRemove={(i) => removeFile("prescriptions", i)}
                        disabled={isProcessing}
                        processedCount={processedCounts.prescriptions}
                      />

                      {/* Error banner */}
                      {submitError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle
                            size={15}
                            className="text-red-500 shrink-0 mt-0.5"
                          />
                          <p className="text-red-700 text-[13px] font-semibold">
                            {submitError}
                          </p>
                        </div>
                      )}

                      {/* Failure detail */}
                      {isFailed && failInfo?.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Ban size={14} className="text-red-500" />
                            <span className="text-red-700 font-black text-[13px]">
                              Processing stopped
                            </span>
                          </div>
                          <p className="text-red-600 text-[12px] font-medium leading-relaxed">
                            {failInfo.error}
                          </p>
                          {failInfo?.failed_at && (
                            <p className="text-red-500 text-[11px] mt-1 font-semibold">
                              Failed at: {failInfo.failed_at.type} file #
                              {failInfo.failed_at.index + 1}
                            </p>
                          )}
                          <p className="text-slate-500 text-[11px] mt-2 italic">
                            {failInfo?.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── Right col: Timeline + Actions (2/5 width) ─────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                      <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">
                        Status
                      </p>

                      {/* Queue order note */}
                      <div className="rounded-2xl bg-white border border-slate-200 p-4">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">
                          Document Progress
                        </p>
                        <div className="flex flex-col gap-3">
                          <TimelineRow
                            icon={FlaskConical}
                            label="Reports"
                            total={timelineTotal.reports}
                            processed={processedCounts.reports}
                            isActive={isProcessing && activeType === "reports"}
                            isFailed={
                              isFailed && failInfo?.failed_at?.type === "report"
                            }
                            isSkipped={timelineTotal.reports === 0}
                          />
                          {/* Connector */}
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <TimelineRow
                            icon={Receipt}
                            label="Bills"
                            total={timelineTotal.bills}
                            processed={processedCounts.bills}
                            isActive={isProcessing && activeType === "bills"}
                            isFailed={
                              isFailed && failInfo?.failed_at?.type === "bill"
                            }
                            isSkipped={timelineTotal.bills === 0}
                          />
                          <div className="ml-1.5 w-0.5 h-3 bg-slate-200 rounded-full" />
                          <TimelineRow
                            icon={Pill}
                            label="Prescriptions"
                            total={timelineTotal.prescriptions}
                            processed={processedCounts.prescriptions}
                            isActive={
                              isProcessing && activeType === "prescriptions"
                            }
                            isFailed={
                              isFailed &&
                              failInfo?.failed_at?.type === "prescription"
                            }
                            isSkipped={timelineTotal.prescriptions === 0}
                          />
                        </div>
                      </div>

                      {/* Summary counts */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: "Reports",
                            val: processedCounts.reports,
                            total: timelineTotal.reports,
                            color: "blue",
                          },
                          {
                            label: "Bills",
                            val: processedCounts.bills,
                            total: timelineTotal.bills,
                            color: "violet",
                          },
                          {
                            label: "Rx",
                            val: processedCounts.prescriptions,
                            total: timelineTotal.prescriptions,
                            color: "teal",
                          },
                        ].map(({ label, val, total, color }) => (
                          <div
                            key={label}
                            className="bg-white border border-slate-200 rounded-2xl p-3 text-center"
                          >
                            <p
                              className={`text-[20px] font-black text-${color}-600 tabular-nums leading-none`}
                            >
                              {val}
                            </p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                              {label}
                            </p>
                            {total > 0 && val === total && (
                              <CheckCircle
                                size={11}
                                className="text-emerald-500 mx-auto mt-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* All complete banner */}
                      {isCompleted && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                          <ShieldCheck
                            size={18}
                            className="text-emerald-600 shrink-0"
                          />
                          <div>
                            <p className="text-emerald-700 font-black text-[13px]">
                              All documents processed
                            </p>
                            <p className="text-emerald-600 text-[11px]">
                              Patient is ready for discharge
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 mt-auto">
                        {/* Process / Retry */}
                        {!isCompleted && (
                          <>
                            {isFailed ? (
                              <button
                                onClick={handleRetry}
                                disabled={isProcessing}
                                className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessing ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <RefreshCw size={15} />
                                )}
                                {isProcessing ? "Retrying…" : "Retry Upload"}
                              </button>
                            ) : (
                              <button
                                onClick={handleProcess}
                                disabled={isProcessing || !anyFiles}
                                className="w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 bg-[#0f172a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {isProcessing ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Zap size={15} />
                                )}
                                {isProcessing
                                  ? "Processing…"
                                  : "Process All Documents"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer Actions ─────────────────────────────────────────────────── */}
          <div className="p-8 md:p-10 pt-6 flex flex-col md:flex-row gap-3">
            {/* Toggle panel */}
            {!data?.discharge_date && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  isEditing
                    ? "bg-white text-slate-700 border border-slate-300 hover:border-slate-500"
                    : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                }`}
              >
                {isEditing ? (
                  <>
                    <ChevronUp size={16} /> Close Panel
                  </>
                ) : (
                  <>
                    <FileText size={16} /> Manage Discharge Documents
                  </>
                )}
              </button>
            )}

            {/* Discharge button — enabled only when all docs processed */}
            {!data?.discharge_date && (
              <button
                onClick={async () => {
                  if (!isCompleted) return;
                  // Get discharge_date from the status endpoint
                  let dischargeDate = null;
                  if (dischargeId) {
                    try {
                      const sr = await api.get(
                        `/api/discharge/${dischargeId}/status`,
                      );
                      dischargeDate = sr.data?.discharge_date;
                    } catch {}
                  }
                  // Set discharge date on local data (persisted via backend)
                  const today = new Date().toISOString().split("T")[0];
                  setData((prev) => ({
                    ...prev,
                    discharge_date: dischargeDate || today,
                  }));
                  // Reset ALL upload state
                  resetUploadState();
                  setIsEditing(false);
                  showToast("Patient discharged successfully!");
                }}
                disabled={!isCompleted}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  isCompleted
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                title={
                  !isCompleted
                    ? "Process all documents before discharge"
                    : "Mark patient as discharged"
                }
              >
                <LogOut size={16} />
                {isCompleted ? "Patient Discharged ✓" : "Discharge Patient"}
              </button>
            )}

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
