import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

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
    setIsGeneratingPatientDoc(true); setSummaryError(null); setSummaryStatus("processing");
    try {
      const formData = new FormData();
      formData.append("file", summaryFile);
      const response = await api.post(API_ROUTES.patient.patientFriendlyReport(id), formData, { headers: { "Content-Type": "multipart/form-data" } });
      setPatientFriendlyUrl(response.data.patient_friendly_url);
      showToast("Patient-friendly document generated successfully!");
    } catch (err) {
      const errorMsg = typeof err?.response?.data?.detail === "string" ? err.response.data.detail
        : typeof err?.response?.data?.message === "string" ? err.response.data.message
        : "Failed to generate patient-friendly document";
      setSummaryError(errorMsg);
      showToast("Failed to generate patient-friendly document", "error");
    } finally {
      setIsGeneratingPatientDoc(false);
      setSummaryStatus(summaryFile ? "completed" : "idle");
    }
  };

  const handleGenerateInsuranceReady = async () => {
    setIsGeneratingInsuranceDoc(true); setSummaryError(null);
    try {
      const response = await api.post(API_ROUTES.patient.generateInsuranceReadyDoc(id));
      showToast("Insurance-ready document generated successfully!");
      setInsuranceReadyUrl(response.data.ird_url);
      const updatedPatient = await api.get(API_ROUTES.admin.patientById(id));
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
        const res = await api.get(API_ROUTES.admin.patientById(id));
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
        const res = await api.get(API_ROUTES.discharge.status(dId));
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
            const pr = await api.get(API_ROUTES.admin.patientById(id));
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
      const res = await api.post(API_ROUTES.discharge.process, form, { headers: { "Content-Type": "multipart/form-data" } });
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
      await api.post(API_ROUTES.discharge.retry(dischargeId), form, { headers: { "Content-Type": "multipart/form-data" } });
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
      <SystemLoader
        fullScreen
        label="Loading Patient Records"
        sublabel="Preparing discharge workflow and document status"
      />
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
                  {summaryStatus === "processing" && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
                      <Loader2 size={13} className="text-amber-400 animate-spin" />
                      <span className="text-amber-300 text-[12px] font-black">Please wait 2-3 minutes...</span>
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
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${summaryStatus === "completed" ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : summaryStatus === "failed" ? "border-red-200 bg-red-50/60 text-red-700" : summaryStatus === "uploading" || summaryStatus === "processing" ? "border-amber-200 bg-amber-50/60 text-amber-800" : "border-slate-200 bg-white text-slate-700"}`}>
                                <FileText size={12} className="shrink-0 opacity-60" />
                                <span className="truncate flex-1">{summaryFile.name}</span>
                                {summaryStatus === "completed" && <CheckCircle size={12} className="text-emerald-500 shrink-0" />}
                                {summaryStatus === "failed" && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                                {(summaryStatus === "uploading" || summaryStatus === "processing") && <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />}
                                {summaryStatus !== "uploading" && summaryStatus !== "processing" && <button onClick={removeSummaryFile} className="ml-auto text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>}
                              </div>
                            </div>
                          )}
                        </div>
                        {isGeneratingPatientDoc && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <Loader2 size={15} className="text-amber-600 shrink-0 mt-0.5 animate-spin" />
                            <p className="text-amber-700 text-[13px] font-semibold">Patient-friendly report is generating. Please wait 2-3 minutes and do not close this page.</p>
                          </div>
                        )}
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
                            <div className={`w-3 h-3 rounded-full shrink-0 ${summaryStatus === "completed" ? "bg-emerald-500 shadow-emerald-300 shadow-sm" : summaryStatus === "failed" ? "bg-red-500 shadow-red-300 shadow-sm" : summaryStatus === "uploading" || summaryStatus === "processing" ? "bg-amber-400 animate-pulse shadow-amber-300 shadow-sm" : "bg-slate-300"}`} />
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