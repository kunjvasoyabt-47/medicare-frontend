import { useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  UserPlus,
  Eye,
  EyeOff,
  Activity,
  Heart,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { registerSchema } from "../lib/validation";
import { PasswordStrengthField } from "../components/PasswordStrengthField";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: Heart, text: "All your health records in one place" },
  { icon: FileText, text: "View discharge notes anytime" },
  { icon: Lock, text: "Your data is always private and secure" },
];

export default function Register({ togglePage }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [regError, setRegError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (togglePage) togglePage();
    navigate(path);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .reg-root { min-height:100vh; display:flex; font-family:'Sora',sans-serif; background:#ffffff; }

        /* Left Panel */
        .reg-panel { display:none; width:42%; background:#111111; position:relative; overflow:hidden; flex-direction:column; justify-content:space-between; padding:52px 48px; flex-shrink:0; }
        @media (min-width:1024px) { .reg-panel { display:flex; } }

        /* Subtle grid lines */
        .reg-panel::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px); background-size:48px 48px; }
        .reg-panel::after { content:''; position:absolute; top:0; right:0; width:280px; height:280px; background:radial-gradient(circle at top right,rgba(255,255,255,0.06) 0%,transparent 65%); }

        .r-orb1,.r-orb2,.r-orb3 { display:none; }

        .r-brand { display:flex; align-items:center; gap:12px; position:relative; z-index:10; }
        .r-logo { width:44px; height:44px; background:white; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.5); }
        .r-brand-name { color:white; font-weight:800; font-size:20px; letter-spacing:-0.5px; }

        .r-hero { position:relative; z-index:10; }
        .r-divider { width:40px; height:2px; background:white; opacity:0.15; margin-bottom:20px; }
        .r-heading { color:white; font-size:36px; font-weight:800; line-height:1.2; letter-spacing:-0.8px; margin-bottom:14px; }
        .r-heading span { display:inline-block; background:transparent; -webkit-text-stroke:1.5px rgba(255,255,255,0.4); color:transparent; }
        .r-sub { color:rgba(255,255,255,0.45); font-size:14px; line-height:1.75; max-width:260px; }

        .r-features { margin-top:32px; display:flex; flex-direction:column; gap:14px; }
        .r-feature { display:flex; align-items:center; gap:12px; }
        .r-feature-icon { width:32px; height:32px; border-radius:10px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .r-feature-text { color:rgba(255,255,255,0.6); font-size:13px; }

        .r-footer { color:rgba(255,255,255,0.2); font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; position:relative; z-index:10; }

        /* Right Form */
        .reg-form-side { flex:1; overflow-y:auto; background:#ffffff; }
        .reg-form-inner { min-height:100%; display:flex; justify-content:center; padding:40px 24px 60px; }
        @media (min-width:640px) { .reg-form-inner { padding:48px 40px 60px; } }
        .reg-card { width:100%; max-width:520px; }

        /* Mobile brand */
        .r-mobile-brand { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
        @media (min-width:1024px) { .r-mobile-brand { display:none; } }
        .r-mobile-logo { width:38px; height:38px; background:#111111; border-radius:12px; display:flex; align-items:center; justify-content:center; }
        .r-mobile-name { font-weight:800; font-size:18px; color:#111111; letter-spacing:-0.5px; }

        .reg-heading { font-size:26px; font-weight:800; color:#111111; letter-spacing:-0.6px; margin-bottom:4px; }
        .reg-sub { font-size:14px; color:#64748b; font-weight:400; margin-bottom:28px; line-height:1.6; }

        /* Error */
        .error-box { display:flex; align-items:flex-start; gap:10px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px 16px; color:#dc2626; font-size:13px; font-weight:500; margin-bottom:22px; line-height:1.5; }

        /* Fields */
        .field-wrap { margin-bottom:4px; }
        .field-label { display:block; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
        .field-block { margin-bottom:16px; }

        .form-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-family:'Sora',sans-serif; font-size:14px; color:#111111; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .form-input:focus { border-color:#111111; box-shadow:0 0 0 3px rgba(17,17,17,0.08); background:#fff; }
        .form-input::placeholder { color:#94a3b8; }
        .form-input.has-error { border-color:#f87171; background:#fff9f9; }
        .form-input.is-valid  { border-color:#34d399; background:#f0fdf4; }
        .form-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:40px; cursor:pointer; }

        .field-msg { font-size:11px; font-weight:600; margin-top:5px; margin-left:2px; display:flex; align-items:center; gap:4px; min-height:18px; }
        .field-msg.error { color:#ef4444; }
        .field-msg.valid { color:#10b981; }

        /* Confirm pw eye */
        .pw-wrap { position:relative; }
        .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; padding:2px; transition:color 0.15s; }
        .eye-btn:hover { color:#111111; }

        /* Grid */
        .grid-2 { display:grid; grid-template-columns:1fr; gap:0 20px; }
        @media (min-width:480px) { .grid-2 { grid-template-columns:1fr 1fr; } }

        /* Submit */
        .submit-btn { width:100%; background:#111111; color:white; border:none; border-radius:12px; padding:15px 20px; font-family:'Sora',sans-serif; font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s, transform 0.1s; margin-top:8px; }
        .submit-btn:hover:not(:disabled) { background:#333333; }
        .submit-btn:active:not(:disabled) { transform:scale(0.98); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .form-footer { text-align:center; font-size:14px; color:#64748b; margin-top:18px; }
        .footer-link { color:#111111; font-weight:700; background:none; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:14px; text-decoration:underline; text-underline-offset:3px; }
        .footer-link:hover { color:#555555; }
      `}</style>

      <div className="reg-root">
        {/* Left Panel */}
        <div className="reg-panel">
          <div className="r-brand">
            <div className="r-logo">
              <Activity size={20} color="#111111" />
            </div>
            <span className="r-brand-name">Medicare</span>
          </div>

          <div className="r-hero">
            <div className="r-divider" />
            <h1 className="r-heading">
              Better health
              <br />
              <span>starts here.</span>
            </h1>
            <p className="r-sub">
              Create your free account and take control of your healthcare
              journey with a platform built for you.
            </p>
            <div className="r-features">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="r-feature">
                  <div className="r-feature-icon">
                    <Icon size={14} color="white" />
                  </div>
                  <span className="r-feature-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="r-footer">© 2026 Medicare · All rights reserved.</div>
        </div>

        {/* Right Form */}
        <div className="reg-form-side">
          <div className="reg-form-inner">
            <div className="reg-card">
              <div className="r-mobile-brand">
                <div className="r-mobile-logo">
                  <Activity size={18} color="white" />
                </div>
                <span className="r-mobile-name">Medicare</span>
              </div>

              <h1 className="reg-heading">Create your account</h1>
              <p className="reg-sub">Fill in your details to get started</p>
              <p className="reg-sub">Fill in your details to get started</p>

              {regError && (
                <div className="error-box">
                  <AlertCircle
                    size={16}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <span>{regError}</span>
                </div>
              )}

              <Formik
                initialValues={{
                  full_name: "",
                  email: "",
                  gender: "",
                  dob: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={registerSchema}
                validateOnChange={false}
                validateOnBlur={true}
                onSubmit={async (values, { setSubmitting }) => {
                  setRegError("");
                  try {
                    const response = await api.post("/register", {
                      full_name: values.full_name,
                      email: values.email,
                      dob: values.dob,
                      gender: values.gender,
                      password: values.password,
                    });
                    localStorage.setItem(
                      "refresh_token",
                      response.data.refresh_token,
                    );
                    await checkAuth();
                    navigate("/welcome-patient");
                  } catch (err) {
                    setRegError(
                      err.response?.data?.detail ||
                        "Registration failed. Please try again.",
                    );
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({
                  errors,
                  touched,
                  values,
                  isSubmitting,
                  handleChange,
                  handleBlur,
                }) => (
                  <Form>
                    {/* Row 1 */}
                    <div className="grid-2">
                      <div className="field-block">
                        <label className="field-label">Full Name</label>
                        <input
                          name="full_name"
                          type="text"
                          placeholder="John Doe"
                          className={`form-input ${errors.full_name && touched.full_name && focusedField !== "full_name" ? "has-error" : !errors.full_name && values.full_name ? "is-valid" : ""}`}
                          value={values.full_name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("full_name")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {errors.full_name &&
                        touched.full_name &&
                        focusedField !== "full_name" ? (
                          <p className="field-msg error">
                            <XCircle size={11} /> {errors.full_name}
                          </p>
                        ) : (
                          <div style={{ minHeight: 18 }} />
                        )}
                      </div>

                      <div className="field-block">
                        <label className="field-label">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className={`form-input ${errors.email && touched.email && focusedField !== "email" ? "has-error" : !errors.email && values.email ? "is-valid" : ""}`}
                          value={values.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("email")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {errors.email &&
                        touched.email &&
                        focusedField !== "email" ? (
                          <p className="field-msg error">
                            <XCircle size={11} /> {errors.email}
                          </p>
                        ) : !errors.email &&
                          values.email &&
                          focusedField !== "email" ? (
                          <p className="field-msg valid">
                            <CheckCircle2 size={11} /> Valid email
                          </p>
                        ) : (
                          <div style={{ minHeight: 18 }} />
                        )}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid-2">
                      <div className="field-block">
                        <label className="field-label">Gender</label>
                        <Field
                          as="select"
                          name="gender"
                          className={`form-input form-select ${errors.gender && touched.gender && focusedField !== "gender" ? "has-error" : !errors.gender && values.gender ? "is-valid" : ""}`}
                          onFocus={() => setFocusedField("gender")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Field>
                        {errors.gender &&
                        touched.gender &&
                        focusedField !== "gender" ? (
                          <p className="field-msg error">
                            <XCircle size={11} /> {errors.gender}
                          </p>
                        ) : (
                          <div style={{ minHeight: 18 }} />
                        )}
                      </div>

                      <div className="field-block">
                        <label className="field-label">Date of Birth</label>
                        <input
                          name="dob"
                          type="date"
                          className={`form-input ${errors.dob && touched.dob && focusedField !== "dob" ? "has-error" : !errors.dob && values.dob ? "is-valid" : ""}`}
                          value={values.dob}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("dob")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {errors.dob && touched.dob && focusedField !== "dob" ? (
                          <p className="field-msg error">
                            <XCircle size={11} /> {errors.dob}
                          </p>
                        ) : (
                          <div style={{ minHeight: 18 }} />
                        )}
                      </div>
                    </div>

                    {/* Password — your existing component handles strength display */}
                    <PasswordStrengthField
                      label="Password"
                      name="password"
                      placeholder="••••••••"
                    />

                    {/* Confirm Password */}
                    <div className="field-block">
                      <label className="field-label">Confirm Password</label>
                      <div className="pw-wrap">
                        <input
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className={`form-input ${
                            values.confirmPassword &&
                            values.password !== values.confirmPassword &&
                            focusedField !== "confirmPassword"
                              ? "has-error"
                              : values.confirmPassword &&
                                  values.password === values.confirmPassword
                                ? "is-valid"
                                : ""
                          }`}
                          style={{ paddingRight: 44 }}
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("confirmPassword")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowConfirm((p) => !p)}
                        >
                          {showConfirm ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {values.confirmPassword &&
                      values.password !== values.confirmPassword &&
                      focusedField !== "confirmPassword" ? (
                        <p className="field-msg error">
                          <XCircle size={11} /> Passwords do not match
                        </p>
                      ) : values.confirmPassword &&
                        values.password === values.confirmPassword ? (
                        <p className="field-msg valid">
                          <CheckCircle2 size={11} /> Passwords match
                        </p>
                      ) : (
                        <div style={{ minHeight: 18 }} />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner" /> Creating Account…
                        </>
                      ) : (
                        <>
                          <UserPlus size={17} /> Create Account{" "}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                    <p className="form-footer">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="footer-link"
                        onClick={() => handleNavigation("/login")}
                      >
                        Sign in
                      </button>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
