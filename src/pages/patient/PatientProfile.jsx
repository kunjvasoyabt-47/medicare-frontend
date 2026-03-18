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
  const baseInputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 400,
    color: "#1e293b",
    outline: "none",
    backgroundColor: "white",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
      <div className="p-2 bg-white text-slate-400 rounded-lg border border-slate-100 shrink-0 mt-0.5">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-slate-500 text-[11px] uppercase tracking-wider mb-1.5"
          style={{ fontWeight: 500 }}
        >
          {label}
        </p>
        {isEditing && name ? (
          <>
            {options ? (
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                style={{
                  ...baseInputStyle,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  paddingRight: "30px",
                  appearance: "none",
                }}
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
                style={baseInputStyle}
              />
            )}
            {error && (
              <p
                className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5"
                style={{ fontWeight: 500 }}
              >
                <AlertCircle size={10} className="shrink-0" /> {error}
              </p>
            )}
          </>
        ) : (
          <p
            className="text-slate-800 text-[13px] truncate"
            style={{ fontWeight: 500 }}
          >
            {value || (
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>—</span>
            )}
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
    if (fieldErrors[name])
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
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
      showToast("Profile updated successfully.");
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
        <SystemLoader
          label="Loading Profile"
          sublabel="Retrieving your personal details"
        />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-[13px] ${
            toast.type === "error"
              ? "bg-red-600 text-white border-red-700"
              : "bg-emerald-600 text-white border-emerald-700"
          }`}
          style={{ fontWeight: 500 }}
        >
          {toast.type === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle size={14} />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 px-3.5 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-[13px]"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Hero */}
          <div className="bg-slate-900 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-2xl text-white border border-white/15 shrink-0"
                style={{ fontWeight: 700 }}
              >
                {profile?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1
                  className="text-white text-[20px] truncate"
                  style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {isEditing
                    ? form.full_name || profile?.full_name
                    : profile?.full_name}
                </h1>
                <p
                  className="text-slate-400 text-[13px] mt-0.5 truncate"
                  style={{ fontWeight: 400 }}
                >
                  {isEditing ? form.email || profile?.email : profile?.email}
                </p>
                {profile?.created_at && (
                  <p
                    className="text-slate-600 text-[11px] mt-1.5"
                    style={{ fontWeight: 400 }}
                  >
                    Member since{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-[12px] hover:bg-white/20 transition-all disabled:opacity-50 border border-white/10"
                      style={{ fontWeight: 500 }}
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[12px] hover:bg-emerald-600 transition-all disabled:opacity-60"
                      style={{ fontWeight: 500 }}
                    >
                      {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-[12px] hover:bg-white/20 transition-all border border-white/10"
                    style={{ fontWeight: 500 }}
                  >
                    <Edit3 size={13} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-slate-400" />
              <h2
                className="text-slate-700 text-[13px]"
                style={{ fontWeight: 600 }}
              >
                Profile Information
              </h2>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p
                  className="text-red-700 text-[13px]"
                  style={{ fontWeight: 500 }}
                >
                  {error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
