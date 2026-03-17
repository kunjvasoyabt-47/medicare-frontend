import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import PatientLayout from "../../components/patient/PatientLayout";
import api from "../../lib/axios";
import { profileUpdateSchema } from "../../lib/validation";
import { API_ROUTES } from "../../lib/routes";
import SystemLoader from "../../components/SystemLoader";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

function Field({
  label,
  icon: Icon,
  value,
  isEditing,
  inputType = "text",
  name,
  onChange,
  options,
  error,
}) {
  const inputCls = `w-full bg-white border rounded-xl px-3 py-2 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 transition-all ${error
      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
      : "border-slate-200 focus:ring-slate-200 focus:border-slate-400"
    }`;

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 group hover:border-slate-200 transition-all">
      <div className="p-2.5 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-all shrink-0">
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-slate-500 font-semibold text-[12px] uppercase tracking-wider mb-1">
          {label}
        </p>
        {isEditing && name ? (
          <>
            {options ? (
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className={inputCls}
              >
                <option value="">— Not specified —</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={inputType}
                name={name}
                value={value || ""}
                onChange={onChange}
                className={inputCls}
              />
            )}
            {error && (
              <p className="flex items-center gap-1 text-red-500 text-[11px] font-semibold mt-1">
                <AlertCircle size={11} className="shrink-0" /> {error}
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-800 font-bold text-[14px] truncate">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api
      .get(API_ROUTES.patient.profile)
      .then((r) => {
        setProfile(r.data);
        setForm({
          full_name: r.data.full_name || "",
          email: r.data.email || "",
          phone_number: r.data.phone_number || "",
          gender: r.data.gender || "",
          dob: r.data.dob || "",
          address: r.data.address || "",
        });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    setError(null);
    setFieldErrors({});
    try {
      await profileUpdateSchema.validate(form, { abortEarly: false });
    } catch (validationErr) {
      const errs = {};
      validationErr.inner.forEach((e) => {
        errs[e.path] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {};
      if (form.full_name !== (profile.full_name || ""))
        payload.full_name = form.full_name || null;
      if (form.email !== (profile.email || ""))
        payload.email = form.email || null;
      if (form.phone_number !== (profile.phone_number || ""))
        payload.phone_number = form.phone_number || null;
      if (form.gender !== (profile.gender || ""))
        payload.gender = form.gender || null;
      if (form.dob !== (profile.dob || "")) payload.dob = form.dob || null;
      if (form.address !== (profile.address || ""))
        payload.address = form.address || null;

      const r = await api.patch(API_ROUTES.patient.profile, payload);
      setProfile((prev) => ({ ...prev, ...r.data }));
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone_number: profile.phone_number || "",
      gender: profile.gender || "",
      dob: profile.dob || "",
      address: profile.address || "",
    });
    setIsEditing(false);
    setError(null);
    setFieldErrors({});
  };

  if (loading) {
    return (
      <PatientLayout>
        <SystemLoader label="Loading Profile" sublabel="Retrieving your personal details" />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-[14px] font-bold animate-in slide-in-from-top-3 duration-300 ${toast.type === "error"
              ? "bg-red-600 text-white border-red-700"
              : "bg-emerald-600 text-white border-emerald-700"
            }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-[14px]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Hero header */}
          <div className="bg-[#0f172a] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 grid-pattern" />
            <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white border border-white/20 shadow-2xl backdrop-blur-md shrink-0">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-[24px] font-black text-white tracking-tight truncate">
                  {isEditing
                    ? form.full_name || profile?.full_name
                    : profile?.full_name}
                </h1>
                <p className="text-slate-400 text-[14px] mt-1 truncate">
                  {isEditing ? form.email || profile?.email : profile?.email}
                </p>
                {profile?.created_at && (
                  <p className="text-slate-600 text-[12px] mt-2">
                    Member since{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>
              {/* Edit / Save / Cancel */}
              <div className="flex gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-[13px] hover:bg-white/20 transition-all disabled:opacity-50 border border-white/10"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[13px] hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-[13px] hover:bg-white/20 transition-all border border-white/10"
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-slate-400" />
              <h2 className="font-black text-slate-800 text-[15px]">
                Profile Information
              </h2>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-[13px] font-semibold">
                  {error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Editable name & email */}
              <Field
                label="Full Name"
                icon={User}
                value={isEditing ? form.full_name : profile?.full_name}
                isEditing={isEditing}
                name="full_name"
                onChange={handleChange}
                error={fieldErrors.full_name}
              />
              <Field
                label="Email"
                icon={Mail}
                value={isEditing ? form.email : profile?.email}
                isEditing={isEditing}
                name="email"
                inputType="email"
                onChange={handleChange}
                error={fieldErrors.email}
              />

              {/* Editable fields */}
              <Field
                label="Phone Number"
                icon={Phone}
                value={isEditing ? form.phone_number : profile?.phone_number}
                isEditing={isEditing}
                name="phone_number"
                inputType="tel"
                onChange={handleChange}
                error={fieldErrors.phone_number}
              />
              <Field
                label="Date of Birth"
                icon={Calendar}
                value={isEditing ? form.dob : profile?.dob}
                isEditing={isEditing}
                name="dob"
                inputType="date"
                onChange={handleChange}
                error={fieldErrors.dob}
              />
              <Field
                label="Gender"
                icon={Activity}
                value={isEditing ? form.gender : profile?.gender}
                isEditing={isEditing}
                name="gender"
                onChange={handleChange}
                options={GENDER_OPTIONS}
                error={fieldErrors.gender}
              />
              <div className="md:col-span-2">
                <Field
                  label="Address"
                  icon={MapPin}
                  value={isEditing ? form.address : profile?.address}
                  isEditing={isEditing}
                  name="address"
                  onChange={handleChange}
                  error={fieldErrors.address}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
