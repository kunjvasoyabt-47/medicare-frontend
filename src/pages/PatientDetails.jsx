import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { API_ROUTES } from "../lib/routes";
import SystemLoader from "../components/SystemLoader";
import {
  CompletedDocumentsSection,
  DetailItem,
  DropZone,
  StatusBadge,
  TimelineRow,
} from "../components/patient/patientDetails/PatientDetailsBlocks";
import {
  extractStatusFailureMessage,
  GENERIC_PROCESSING_ERROR,
  getMaxFiles,
  parseStructuredError,
} from "../lib/patientDetailsUtils";
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
  ChevronUp,
  User,
  Stethoscope,
  Receipt,
  FlaskConical,
  Pill,
  ShieldCheck,
  X,
  RefreshCw,
  Zap,
  Ban,
  ChevronDown,
  Lock,
} from "lucide-react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showProcessConfirm, setShowProcessConfirm] = useState(false);
  const [isConfirmingProcess, setIsConfirmingProcess] = useState(false);

  const [files, setFiles] = useState({
    reports: [],
    bills: [],
    prescriptions: [],
  });
  const [fileStatuses, setFileStatuses] = useState({
    reports: [],
    bills: [],
    prescriptions: [],
  });
  const [fileErrors, setFileErrors] = useState({
    reports: [],
    bills: [],
    prescriptions: [],
  });

  const [dischargeId, setDischargeId] = useState(null);
  const [processState, setProcessState] = useState("idle");
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
  const [isGeneratingInsuranceDoc, setIsGeneratingInsuranceDoc] =
    useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);

  const [submittedFiles, setSubmittedFiles] = useState(null);
  const [apiSucceeded, setApiSucceeded] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

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
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setSummaryError("Only PDF files are allowed");
      return;
    }
    setSummaryFile(file);
    setSummaryError(null);
    setSummaryStatus("uploading");
    setSummaryProgress(0);
    try {
      setSummaryStatus("completed");
      setSummaryProgress(100);
      showToast("Discharge summary ready for processing!");
    } catch (err) {
      setSummaryStatus("failed");
      const errorMsg =
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "Upload failed. Please try again.";
      setSummaryError(errorMsg);
      showToast("Failed to upload discharge summary", "error");
    }
  };

  const handleGeneratePatientFriendly = async () => {
    if (!summaryFile) {
      setSummaryError("Please upload a discharge summary first");
      return;
    }
    setIsGeneratingPatientDoc(true);
    setSummaryError(null);
    setSummaryStatus("processing");
    try {
      const formData = new FormData();
      formData.append("file", summaryFile);
      const response = await api.post(
        API_ROUTES.patient.patientFriendlyReport(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setPatientFriendlyUrl(response.data.patient_friendly_url);
      showToast("Patient-friendly document generated successfully!");
    } catch (err) {
      const errorMsg =
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "Failed to generate patient-friendly document";
      setSummaryError(errorMsg);
      showToast("Failed to generate patient-friendly document", "error");
    } finally {
      setIsGeneratingPatientDoc(false);
      setSummaryStatus(summaryFile ? "completed" : "idle");
    }
  };

  const handleGenerateInsuranceReady = async () => {
    setIsGeneratingInsuranceDoc(true);
    setSummaryError(null);
    try {
      const response = await api.post(
        API_ROUTES.patient.generateInsuranceReadyDoc(id),
      );
      showToast("Insurance-ready document generated successfully!");
      setInsuranceReadyUrl(response.data.ird_url);
      const updatedPatient = await api.get(API_ROUTES.admin.patientById(id));
      setData(updatedPatient.data);
    } catch (err) {
      const errorMsg =
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "Failed to generate insurance-ready document";
      setSummaryError(errorMsg);
      showToast("Failed to generate insurance-ready document", "error");
    } finally {
      setIsGeneratingInsuranceDoc(false);
    }
  };

  const handleAdmitPatient = async () => {
    if (isAdmitting) return;
    setIsAdmitting(true);
    try {
      await api.patch(API_ROUTES.admin.admitPatient(id));
      const updatedPatient = await api.get(API_ROUTES.admin.patientById(id));
      setData(updatedPatient.data);
      resetUploadState();
      setSummaryFile(null);
      setSummaryStatus("idle");
      setSummaryProgress(0);
      setSummaryError(null);
      setPatientFriendlyUrl(null);
      setInsuranceReadyUrl(null);
      showToast("Patient admitted and ready for fresh document processing.");
      setIsEditing(true);
    } catch (err) {
      const errorMsg =
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to admit patient";
      showToast(errorMsg, "error");
    } finally {
      setIsAdmitting(false);
    }
  };

  const removeSummaryFile = () => {
    setSummaryFile(null);
    setSummaryStatus("idle");
    setSummaryProgress(0);
    setSummaryError(null);
  };

  useEffect(
    () => () => {
      clearInterval(pollingRef.current);
      clearTimeout(toastRef.current);
    },
    [],
  );

  const processedCountsRef = useRef(processedCounts);
  useEffect(() => {
    processedCountsRef.current = processedCounts;
  }, [processedCounts]);

  const totalCountsRef = useRef(totalCounts);
  useEffect(() => {
    totalCountsRef.current = totalCounts;
  }, [totalCounts]);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(API_ROUTES.admin.patientById(id));
        setData(res.data);
        if (res.data.is_discharged && res.data.patient_friendly_url)
          setPatientFriendlyUrl(res.data.patient_friendly_url);
        if (res.data.is_discharged && res.data.ird_url)
          setInsuranceReadyUrl(res.data.ird_url);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const startPolling = useCallback(
    (dId) => {
      clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(API_ROUTES.discharge.status(dId));
          const s = res.data;
          const p = s.processed ?? {};
          const newCounts = {
            reports: p.reports ?? 0,
            bills: p.bills ?? 0,
            prescriptions: p.prescriptions ?? 0,
          };
          setProcessedCounts(newCounts);

          const totals = totalCountsRef.current;
          const currentFiles = filesRef.current;

          setFileStatuses({
            reports: currentFiles.reports.map((_, i) =>
              i < newCounts.reports ? "done" : "processing",
            ),
            bills: currentFiles.bills.map((_, i) =>
              i < newCounts.bills ? "done" : "processing",
            ),
            prescriptions: currentFiles.prescriptions.map((_, i) =>
              i < newCounts.prescriptions ? "done" : "processing",
            ),
          });

          if (newCounts.reports < totals.reports) setActiveType("reports");
          else if (newCounts.bills < totals.bills) setActiveType("bills");
          else if (newCounts.prescriptions < totals.prescriptions)
            setActiveType("prescriptions");

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
            if (s.discharge_date)
              setData((prev) => ({
                ...prev,
                discharge_date: s.discharge_date,
              }));
            try {
              const pr = await api.get(API_ROUTES.admin.patientById(id));
              setData(pr.data);
            } catch (e) {
              console.warn("[polling] could not refresh patient data:", e);
            }
            showToast("All documents processed successfully!");
          } else if (s.status === "failed") {
            clearInterval(pollingRef.current);
            setProcessState("failed");
            setApiSucceeded(false);
            setActiveType(null);

            let failedType = null;
            let failedIndex = 0;
            if (newCounts.reports < totals.reports) {
              failedType = "report";
              failedIndex = newCounts.reports;
            } else if (newCounts.bills < totals.bills) {
              failedType = "bill";
              failedIndex = newCounts.bills;
            } else if (newCounts.prescriptions < totals.prescriptions) {
              failedType = "prescription";
              failedIndex = newCounts.prescriptions;
            }

            const backendErrorMessage = extractStatusFailureMessage(s);
            setFailInfo({
              discharge_id: dId,
              status: "failed",
              progress: {
                processed_reports: newCounts.reports,
                processed_bills: newCounts.bills,
                processed_prescriptions: newCounts.prescriptions,
              },
              failed_at: failedType
                ? { type: failedType, index: failedIndex }
                : null,
              error: GENERIC_PROCESSING_ERROR,
              message:
                "Processing stopped at a failed file. Already-stored documents will NOT be re-processed on retry.",
            });

            const structuredError = parseStructuredError(s);
            if (structuredError) setErrorDetails(structuredError);

            setFileStatuses({
              reports: currentFiles.reports.map((_, i) => {
                if (i < newCounts.reports) return "done";
                if (failedType === "report" && i === failedIndex)
                  return "error";
                return "queued";
              }),
              bills: currentFiles.bills.map((_, i) => {
                if (i < newCounts.bills) return "done";
                if (failedType === "bill" && i === failedIndex) return "error";
                return "queued";
              }),
              prescriptions: currentFiles.prescriptions.map((_, i) => {
                if (i < newCounts.prescriptions) return "done";
                if (failedType === "prescription" && i === failedIndex)
                  return "error";
                return "queued";
              }),
            });
            setFileErrors({
              reports: currentFiles.reports.map(() => null),
              bills: currentFiles.bills.map(() => null),
              prescriptions: currentFiles.prescriptions.map(() => null),
            });
          }
        } catch {
          // keep polling on transient errors
        }
      }, 1200);
    },
    [id, showToast],
  );

  useEffect(() => () => clearInterval(pollingRef.current), []);

  const TYPE_LABELS = {
    reports: "Medical Reports",
    bills: "Bills",
    prescriptions: "Prescriptions",
  };

  const addFiles = (type, incoming) => {
    const pdfs = incoming.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    const nonPdfs = incoming.filter(
      (f) => !f.name.toLowerCase().endsWith(".pdf"),
    );
    if (nonPdfs.length) {
      showToast(
        `Only PDF files are allowed. Skipped: ${nonPdfs.map((f) => f.name).join(", ")}`,
        "error",
      );
      setSubmitError(null);
    } else {
      setSubmitError(null);
    }

    const maxForType = getMaxFiles(type);
    const currentCount = files[type].length;
    const capacity = maxForType - currentCount;
    const label = TYPE_LABELS[type] ?? type;

    if (capacity <= 0) {
      showToast(
        `${label} limit reached. Maximum ${maxForType} file${maxForType !== 1 ? "s" : ""} allowed.`,
        "error",
      );
      return;
    }

    if (pdfs.length > capacity) {
      const accepted = pdfs.slice(0, capacity);
      const rejected = pdfs.slice(capacity);
      showToast(
        `Only ${capacity} more ${label.toLowerCase()} file${capacity !== 1 ? "s" : ""} allowed (max ${maxForType}). ${rejected.length} file${rejected.length !== 1 ? "s were" : " was"} not added.`,
        "error",
      );
      setFiles((prev) => ({ ...prev, [type]: [...prev[type], ...accepted] }));
      setFileStatuses((prev) => ({
        ...prev,
        [type]: [...prev[type], ...accepted.map(() => "queued")],
      }));
      setFileErrors((prev) => ({
        ...prev,
        [type]: [...prev[type], ...accepted.map(() => null)],
      }));
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: [...prev[type], ...pdfs] }));
    setFileStatuses((prev) => ({
      ...prev,
      [type]: [...prev[type], ...pdfs.map(() => "queued")],
    }));
    setFileErrors((prev) => ({
      ...prev,
      [type]: [...prev[type], ...pdfs.map(() => null)],
    }));
  };

  const removeFile = (type, index) => {
    setFiles((prev) => {
      const u = [...prev[type]];
      u.splice(index, 1);
      return { ...prev, [type]: u };
    });
    setFileStatuses((prev) => {
      const u = [...prev[type]];
      u.splice(index, 1);
      return { ...prev, [type]: u };
    });
    setFileErrors((prev) => {
      const u = [...prev[type]];
      u.splice(index, 1);
      return { ...prev, [type]: u };
    });
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
    if (totalR + totalB + totalP === 0) {
      setSubmitError("Please add at least one PDF to process.");
      return;
    }
    setSubmitError(null);
    setFileErrors({
      reports: files.reports.map(() => null),
      bills: files.bills.map(() => null),
      prescriptions: files.prescriptions.map(() => null),
    });
    setProcessState("processing");
    setTotalCounts({ reports: totalR, bills: totalB, prescriptions: totalP });
    setActiveType(
      totalR > 0 ? "reports" : totalB > 0 ? "bills" : "prescriptions",
    );
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
      const res = await api.post(API_ROUTES.discharge.process, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const dId = res.data.discharge_id;
      setDischargeId(dId);
      setSubmittedFiles(files);
      setApiSucceeded(true);
      startPolling(dId);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.detail || "Upload failed. Please try again.",
      );
      setProcessState("idle");
      setApiSucceeded(false);
      setFileStatuses({
        reports: files.reports.map(() => "queued"),
        bills: files.bills.map(() => "queued"),
        prescriptions: files.prescriptions.map(() => "queued"),
      });
    }
  };

  const handleRetry = async () => {
    if (!dischargeId) return;
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
    setFileStatuses((prev) => ({
      reports: prev.reports.map((s) => (s !== "done" ? "processing" : s)),
      bills: prev.bills.map((s) => (s !== "done" ? "processing" : s)),
      prescriptions: prev.prescriptions.map((s) =>
        s !== "done" ? "processing" : s,
      ),
    }));
    setFileErrors((prev) => ({
      reports: prev.reports.map((err, i) =>
        fileStatuses.reports[i] !== "done" ? null : err,
      ),
      bills: prev.bills.map((err, i) =>
        fileStatuses.bills[i] !== "done" ? null : err,
      ),
      prescriptions: prev.prescriptions.map((err, i) =>
        fileStatuses.prescriptions[i] !== "done" ? null : err,
      ),
    }));
    try {
      const form = new FormData();
      pendingReports.forEach((f) => form.append("reports", f));
      pendingBills.forEach((f) => form.append("bills", f));
      pendingPrescriptions.forEach((f) => form.append("prescriptions", f));
      await api.post(API_ROUTES.discharge.retry(dischargeId), form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      startPolling(dischargeId);
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || "Retry failed.");
      setProcessState("failed");
    }
  };

  const isProcessing =
    processState === "processing" || processState === "retrying";
  const isCompleted = processState === "completed";
  const isFailed = processState === "failed";
  const isIdle = processState === "idle";
  const isCurrentlyDischarged = Boolean(data?.is_discharged);
  const showCompletedDocuments = isCompleted || isCurrentlyDischarged;
  const anyFiles =
    files.reports.length + files.bills.length + files.prescriptions.length > 0;
  const isDocumentProcessingCompleted = isCompleted || isCurrentlyDischarged;

  // Warn user before refresh/close if processing is active or files are staged
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasActivity = isProcessing || anyFiles || processState === "failed";
      if (!hasActivity) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing, anyFiles, processState]);

  const selectedCounts = {
    reports: files.reports.length,
    bills: files.bills.length,
    prescriptions: files.prescriptions.length,
  };
  const missingTypes = [
    selectedCounts.reports === 0 ? "Medical Reports" : null,
    selectedCounts.bills === 0 ? "Bills" : null,
    selectedCounts.prescriptions === 0 ? "Prescriptions" : null,
  ].filter(Boolean);

  const timelineTotal = totalCounts;

  if (loading) {
    return (
      <SystemLoader
        fullScreen
        label="Loading Patient Records"
        sublabel="Preparing discharge workflow and document status"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 md:p-8 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-md border text-[13px] font-medium transition-all duration-300 animate-in slide-in-from-top-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-700 border-red-200 shadow-red-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={14} className="shrink-0 text-red-400" />
          ) : (
            <CheckCircle size={14} className="shrink-0 text-emerald-400" />
          )}
          {toast.message}
        </div>
      )}

      {/* Process Confirm Modal */}
      {showProcessConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              if (isConfirmingProcess) return;
              setShowProcessConfirm(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-slate-800 text-[15px] font-semibold mb-1">
                Review before processing
              </h3>
              <p className="text-slate-500 text-[13px] mb-5">
                All uploaded documents will be processed in a single run.
              </p>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-3">
                  Selected files
                </p>
                <div className="flex flex-col gap-2.5">
                  {[
                    {
                      label: "Medical Reports",
                      value: selectedCounts.reports,
                      color: "text-blue-600",
                    },
                    {
                      label: "Bills",
                      value: selectedCounts.bills,
                      color: "text-slate-600",
                    },
                    {
                      label: "Prescriptions",
                      value: selectedCounts.prescriptions,
                      color: "text-teal-600",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-slate-600 text-[13px]">
                        {row.label}
                      </span>
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${row.color}`}
                      >
                        {row.value} file{row.value !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {missingTypes.length > 0 && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                  <AlertCircle
                    size={14}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <p className="text-amber-700 text-[12px]">
                    No {missingTypes.join(", ")} uploaded. You can still
                    proceed.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                <Ban size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-600 text-[12px]">
                  Additional files cannot be added after processing starts.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowProcessConfirm(false)}
                disabled={isConfirmingProcess}
                className="px-4 py-2 rounded-xl text-[13px] font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConfirmingProcess}
                onClick={async () => {
                  if (isConfirmingProcess) return;
                  setIsConfirmingProcess(true);
                  try {
                    setShowProcessConfirm(false);
                    await handleProcess();
                  } finally {
                    setIsConfirmingProcess(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-medium bg-slate-800 text-white hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isConfirmingProcess ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Confirm & Process"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mb-5 text-slate-500 hover:text-slate-700 transition-colors text-[13px] font-medium"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 relative overflow-hidden">
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-2xl font-semibold text-white border border-white/10 shrink-0">
                {data?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-semibold text-white tracking-tight">
                    {data?.full_name}
                  </h1>
                  <StatusBadge dischargeDate={data?.discharge_date} />
                </div>
                <p className="text-slate-400 text-[13px] mb-3">{data?.email}</p>
                <div className="flex flex-wrap gap-4">
                  {data?.phone_number && (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[12px]">
                      <Phone size={12} className="text-slate-500" />{" "}
                      {data.phone_number}
                    </span>
                  )}
                  {data?.dob && (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[12px]">
                      <Calendar size={12} className="text-slate-500" />{" "}
                      {data.dob}
                    </span>
                  )}
                  {data?.gender && (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[12px]">
                      <User size={12} className="text-slate-500" />{" "}
                      {data.gender}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 hidden md:block text-right">
                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-widest">
                  Patient ID
                </p>
                <p className="text-white text-xl font-semibold mt-0.5">
                  #{String(id).padStart(4, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="p-8 md:p-10 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <Stethoscope size={15} className="text-slate-400" />
              <h2 className="text-slate-600 text-[13px] font-medium uppercase tracking-wider">
                Patient Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
                value={isCurrentlyDischarged ? "Discharged" : "Active Patient"}
              />
            </div>
          </div>

          {/* Discharge Documents Panel */}
          {isEditing && (
            <div className="p-8 md:p-10 border-b border-slate-100">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-slate-800 text-[15px] font-semibold">
                    {showCompletedDocuments
                      ? "Latest Discharge Documents"
                      : "Process Discharge Documents"}
                  </h2>
                  <p className="text-slate-400 text-[12px] mt-0.5">
                    {showCompletedDocuments
                      ? "Showing latest completed discharge documents"
                      : "Attach patient documents and submit for processing"}
                  </p>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle size={13} className="text-emerald-500" />
                    <span className="text-emerald-600 text-[12px] font-medium">
                      All Processed
                    </span>
                  </div>
                )}
                {isFailed && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={13} className="text-red-400" />
                    <span className="text-red-500 text-[12px] font-medium">
                      Processing Failed
                    </span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <Loader2
                      size={13}
                      className="text-amber-500 animate-spin"
                    />
                    <span className="text-amber-600 text-[12px] font-medium">
                      Processing…
                    </span>
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-5 gap-8">
                {/* Left — dropzones */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    {showCompletedDocuments
                      ? "Submitted Documents"
                      : "Attach Documents"}
                  </p>

                  {showCompletedDocuments ? (
                    <CompletedDocumentsSection
                      patientId={id}
                      data={data}
                      dischargeId={dischargeId || data?.latest_discharge_id}
                    />
                  ) : (
                    <>
                      <DropZone
                        type="reports"
                        label="Medical Reports"
                        icon={FlaskConical}
                        files={files.reports}
                        fileStatuses={fileStatuses.reports}
                        fileErrors={fileErrors.reports}
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
                        fileErrors={fileErrors.bills}
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
                        fileErrors={fileErrors.prescriptions}
                        onAdd={(f) => addFiles("prescriptions", f)}
                        onRemove={(i) => removeFile("prescriptions", i)}
                        disabled={isProcessing}
                        processedCount={processedCounts.prescriptions}
                      />
                    </>
                  )}

                  {submitError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle
                        size={13}
                        className="text-red-400 shrink-0 mt-0.5"
                      />
                      <p className="text-red-600 text-[12px]">{submitError}</p>
                    </div>
                  )}

                  {isFailed && failInfo?.error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Ban size={13} className="text-red-400" />
                        <span className="text-red-600 text-[13px] font-medium">
                          Processing stopped
                        </span>
                      </div>
                      <p className="text-red-500 text-[12px] leading-relaxed">
                        {failInfo.error}
                      </p>
                      {errorDetails?.error_code && (
                        <div className="mt-3 pt-3 border-t border-red-100 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-[11px] uppercase tracking-wider">
                              Error Code:
                            </span>
                            <code className="text-red-500 text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-red-100">
                              {errorDetails.error_code}
                            </code>
                          </div>
                          {errorDetails.message && (
                            <p className="text-red-500 text-[11px]">
                              {errorDetails.message}
                            </p>
                          )}
                          {errorDetails.context && (
                            <div className="text-[10px] bg-white p-2 rounded border border-red-100 text-red-500 font-mono whitespace-pre-wrap max-h-28 overflow-auto">
                              {Object.entries(errorDetails.context)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join("\n")}
                            </div>
                          )}
                          {errorDetails.action && (
                            <div className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-100">
                              <Zap
                                size={11}
                                className="text-amber-500 shrink-0 mt-0.5"
                              />
                              <p className="text-amber-600 text-[11px]">
                                {errorDetails.action}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {failInfo?.failed_at && (
                        <p className="text-slate-400 text-[11px] mt-2">
                          Failed at: {failInfo.failed_at.type} file #
                          {failInfo.failed_at.index + 1}
                        </p>
                      )}
                      <p className="text-slate-400 text-[11px] mt-1.5 italic">
                        {failInfo?.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right — timeline + actions */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    Status
                  </p>

                  {showCompletedDocuments && !isProcessing && !isFailed && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <p className="text-emerald-700 text-[13px] font-medium">
                          Latest discharge is already processed
                        </p>
                      </div>
                      <p className="text-emerald-600 text-[11px] mt-2">
                        Click Admit to start a fresh upload and processing
                        cycle.
                      </p>
                    </div>
                  )}

                  {!showCompletedDocuments && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-4">
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
                        <div className="ml-1 w-px h-3 bg-slate-200 rounded-full" />
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
                        <div className="ml-1 w-px h-3 bg-slate-200 rounded-full" />
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
                  )}

                  {!showCompletedDocuments && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Reports",
                          val: processedCounts.reports,
                          total: timelineTotal.reports,
                          color: "text-blue-500",
                        },
                        {
                          label: "Bills",
                          val: processedCounts.bills,
                          total: timelineTotal.bills,
                          color: "text-slate-500",
                        },
                        {
                          label: "Rx",
                          val: processedCounts.prescriptions,
                          total: timelineTotal.prescriptions,
                          color: "text-teal-500",
                        },
                      ].map(({ label, val, total, color }) => (
                        <div
                          key={label}
                          className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center"
                        >
                          <p
                            className={`text-[22px] font-semibold ${color} tabular-nums leading-none`}
                          >
                            {val}
                          </p>
                          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">
                            {label}
                          </p>
                          {total > 0 && val === total && (
                            <CheckCircle
                              size={10}
                              className="text-emerald-400 mx-auto mt-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!showCompletedDocuments && !isFailed && (
                    <button
                      onClick={() => {
                        if (isProcessing) return;
                        setShowProcessConfirm(true);
                      }}
                      disabled={isProcessing || !anyFiles}
                      className="w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Zap size={13} />
                      )}
                      {isProcessing ? "Processing…" : "Process All Documents"}
                    </button>
                  )}

                  {!isCompleted && isFailed && (
                    <button
                      onClick={handleRetry}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      {isProcessing ? "Retrying…" : "Retry Upload"}
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <ShieldCheck
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                      <div>
                        <p className="text-emerald-700 text-[13px] font-medium">
                          All documents processed
                        </p>
                        <p className="text-emerald-500 text-[11px] mt-0.5">
                          Patient is ready for discharge
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Generate Documents Panel */}
          {isEditing && (
            <div className="p-8 md:p-10 border-b border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-slate-800 text-[15px] font-semibold">
                    Generate Patient Documents
                  </h2>
                  <p className="text-slate-400 text-[12px] mt-0.5">
                    Upload discharge summary and generate shareable documents
                  </p>
                </div>
                {summaryStatus === "completed" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle size={13} className="text-emerald-500" />
                    <span className="text-emerald-600 text-[12px] font-medium">
                      Summary Uploaded
                    </span>
                  </div>
                )}
                {(summaryStatus === "uploading" ||
                  summaryStatus === "processing") && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <Loader2
                      size={13}
                      className="text-amber-500 animate-spin"
                    />
                    <span className="text-amber-600 text-[12px] font-medium">
                      {summaryStatus === "processing"
                        ? "Please wait 2–3 minutes…"
                        : "Uploading…"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-5 gap-8">
                {/* Left */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    Upload Discharge Summary
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-indigo-50 text-indigo-500">
                        <FileText size={13} />
                      </div>
                      <span className="text-[12px] font-semibold tracking-wide uppercase text-indigo-600">
                        Discharge Summary
                      </span>
                      <span className="ml-auto text-[11px] text-slate-400">
                        {summaryFile ? "1 / 1" : "0 / 1"}
                      </span>
                    </div>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (
                          summaryStatus === "uploading" ||
                          summaryStatus === "processing"
                        )
                          return;
                        e.currentTarget.classList.add("border-slate-400");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-slate-400");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-slate-400");
                        if (
                          summaryStatus === "uploading" ||
                          summaryStatus === "processing"
                        )
                          return;
                        const file = e.dataTransfer.files[0];
                        if (file && file.name.toLowerCase().endsWith(".pdf")) {
                          handleSummaryUpload(file);
                        } else {
                          setSummaryError("Only PDF files are allowed");
                        }
                      }}
                      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${summaryStatus === "uploading" || summaryStatus === "processing" ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <input
                        id="summary-upload"
                        type="file"
                        accept=".pdf"
                        disabled={
                          summaryStatus === "uploading" ||
                          summaryStatus === "processing"
                        }
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleSummaryUpload(file);
                        }}
                      />
                      {!summaryFile ? (
                        <label
                          htmlFor="summary-upload"
                          className="flex flex-col items-center justify-center py-8 gap-1.5 cursor-pointer"
                        >
                          <Upload size={18} className="text-slate-300" />
                          <p className="text-slate-400 text-[12px] font-medium">
                            Drop PDF or click to browse
                          </p>
                          <p className="text-slate-300 text-[11px]">
                            Single discharge summary file
                          </p>
                        </label>
                      ) : (
                        <div className="p-2.5">
                          <div
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[12px] font-medium ${summaryStatus === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : summaryStatus === "failed" ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                          >
                            <FileText
                              size={11}
                              className="shrink-0 opacity-50"
                            />
                            <span className="truncate flex-1">
                              {summaryFile.name}
                            </span>
                            {summaryStatus === "completed" && (
                              <CheckCircle
                                size={11}
                                className="text-emerald-500 shrink-0"
                              />
                            )}
                            {summaryStatus === "failed" && (
                              <AlertCircle
                                size={11}
                                className="text-red-400 shrink-0"
                              />
                            )}
                            {(summaryStatus === "uploading" ||
                              summaryStatus === "processing") && (
                              <Loader2
                                size={11}
                                className="animate-spin text-amber-400 shrink-0"
                              />
                            )}
                            {summaryStatus !== "uploading" &&
                              summaryStatus !== "processing" && (
                                <button
                                  onClick={removeSummaryFile}
                                  className="ml-auto text-slate-300 hover:text-red-400 transition-colors"
                                >
                                  <X size={11} />
                                </button>
                              )}
                          </div>
                        </div>
                      )}
                    </div>

                    {isGeneratingPatientDoc && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <Loader2
                          size={13}
                          className="text-amber-500 shrink-0 mt-0.5 animate-spin"
                        />
                        <p className="text-amber-700 text-[12px]">
                          Patient-friendly report is generating. Please wait 2–3
                          minutes.
                        </p>
                      </div>
                    )}
                    {summaryStatus === "uploading" && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Uploading…</span>
                          <span className="text-amber-500">
                            {summaryProgress}%
                          </span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${summaryProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {summaryError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle
                          size={13}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                        <p className="text-red-600 text-[12px]">
                          {summaryError}
                        </p>
                      </div>
                    )}
                  </div>

                  {(patientFriendlyUrl || insuranceReadyUrl) && (
                    <div className="flex flex-col gap-2.5 pt-2">
                      <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                        Generated Documents
                      </p>
                      {patientFriendlyUrl && (
                        <a
                          href={patientFriendlyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group"
                        >
                          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:bg-emerald-100 transition-all">
                            <FileText size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 text-[13px] font-medium">
                              Patient-Friendly Document
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              Click to view or download
                            </p>
                          </div>
                          <CheckCircle
                            size={14}
                            className="text-emerald-400 shrink-0"
                          />
                        </a>
                      )}
                      {insuranceReadyUrl && (
                        <a
                          href={insuranceReadyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
                        >
                          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-all">
                            <Receipt size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 text-[13px] font-medium">
                              Insurance-Ready Document
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              Click to view or download
                            </p>
                          </div>
                          <CheckCircle
                            size={14}
                            className="text-blue-400 shrink-0"
                          />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    Generate Documents
                  </p>

                  {!isDocumentProcessingCompleted && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertCircle
                        size={13}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <p className="text-amber-700 text-[12px]">
                        Process all documents first to unlock document
                        generation.
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-4">
                      Document Status
                    </p>
                    <div className="flex flex-col gap-3">
                      {[
                        {
                          label: "Discharge Summary",
                          active:
                            summaryStatus === "uploading" ||
                            summaryStatus === "processing",
                          done: summaryStatus === "completed",
                        },
                        {
                          label: "Patient-Friendly",
                          active: isGeneratingPatientDoc,
                          done: Boolean(patientFriendlyUrl),
                        },
                        {
                          label: "Insurance-Ready",
                          active: isGeneratingInsuranceDoc,
                          done: Boolean(insuranceReadyUrl),
                        },
                      ].map((item, idx) => (
                        <div key={item.label}>
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${item.done ? "bg-emerald-400" : item.active ? "bg-amber-400 animate-pulse" : "bg-slate-200"}`}
                            />
                            <span className="text-[12px] text-slate-600 flex-1">
                              {item.label}
                            </span>
                            {item.done && (
                              <CheckCircle
                                size={12}
                                className="text-emerald-400"
                              />
                            )}
                            {item.active && (
                              <Loader2
                                size={12}
                                className="text-amber-400 animate-spin"
                              />
                            )}
                          </div>
                          {idx < 2 && (
                            <div className="ml-1 w-px h-3 bg-slate-200 rounded-full mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-auto">
                    {/* Patient-Friendly button */}
                    <div className="relative group/btn">
                      <button
                        onClick={handleGeneratePatientFriendly}
                        disabled={
                          !isDocumentProcessingCompleted ||
                          isGeneratingPatientDoc ||
                          isGeneratingInsuranceDoc
                        }
                        className={`w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all
                          ${
                            !isDocumentProcessingCompleted
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          }`}
                      >
                        {isGeneratingPatientDoc ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Generating…
                          </>
                        ) : !isDocumentProcessingCompleted ? (
                          <>
                            <Lock size={13} />
                            {patientFriendlyUrl
                              ? "Regenerate"
                              : "Generate"}{" "}
                            Patient-Friendly
                          </>
                        ) : (
                          <>
                            <FileText size={13} />
                            {patientFriendlyUrl
                              ? "Regenerate"
                              : "Generate"}{" "}
                            Patient-Friendly
                          </>
                        )}
                      </button>
                      {!isDocumentProcessingCompleted && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[11px] rounded-lg whitespace-nowrap shadow-lg z-20">
                          <Lock size={10} />
                          Process all documents first
                        </div>
                      )}
                    </div>

                    {/* Insurance-Ready button */}
                    <div className="relative group/btn2">
                      <button
                        onClick={handleGenerateInsuranceReady}
                        disabled={
                          !isDocumentProcessingCompleted ||
                          isGeneratingPatientDoc ||
                          isGeneratingInsuranceDoc
                        }
                        className={`w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all
                          ${
                            !isDocumentProcessingCompleted
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          }`}
                      >
                        {isGeneratingInsuranceDoc ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Generating…
                          </>
                        ) : !isDocumentProcessingCompleted ? (
                          <>
                            <Lock size={13} />
                            Generate Insurance-Ready Doc
                          </>
                        ) : (
                          <>
                            <Receipt size={13} />
                            Generate Insurance-Ready Doc
                          </>
                        )}
                      </button>
                      {!isDocumentProcessingCompleted && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn2:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[11px] rounded-lg whitespace-nowrap shadow-lg z-20">
                          <Lock size={10} />
                          Process all documents first
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-6 md:px-10 flex flex-col md:flex-row gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-1 py-3 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
                isEditing
                  ? "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300"
                  : "bg-slate-800 text-white hover:bg-slate-700 shadow-sm"
              }`}
            >
              {isEditing ? (
                <>
                  <ChevronUp size={14} /> Close Panel
                </>
              ) : (
                <>
                  <FileText size={14} />
                  {isCurrentlyDischarged
                    ? "View Latest Discharge Documents"
                    : "Manage Discharge Documents"}
                </>
              )}
            </button>
            {isCurrentlyDischarged && (
              <button
                onClick={handleAdmitPatient}
                disabled={isAdmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-[13px] font-medium text-center flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Admitting...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Admit Patient
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
