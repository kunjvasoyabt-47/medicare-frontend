import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import {
  AlertCircle,
  CheckCircle2,
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { loginSchema } from "../lib/validation";
import { InputField } from "../components/InputField";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const FONT = { fontFamily: "'Sora', 'DM Sans', sans-serif" };

export default function Login({ togglePage }) {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleNavigation = (path) => {
    if (togglePage) togglePage();
    navigate(path);
  };

  const handleLogin = async (values, { setSubmitting }) => {
    setError("");
    try {
      const response = await api.post("/login", values);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      await checkAuth();
      if (response.data.is_admin) navigate("/admin/dashboard");
      else navigate("/patient/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Incorrect email or password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        .login-root {
          min-height: 100vh;
          background: #f0f4f8;
          display: flex;
          font-family: 'Sora', sans-serif;
        }

        /* ── Left decorative panel ── */
        .login-panel {
          display: none;
          width: 45%;
          background: #111111;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) { .login-panel { display: flex; } }

        /* Subtle geometric grid lines */
        .login-panel::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        /* Top-right corner accent */
        .login-panel::after {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 280px; height: 280px;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.06) 0%, transparent 65%);
        }

        .orb1 { display: none; }
        .orb2 { display: none; }
        .orb3 { display: none; }

        .panel-brand { display: flex; align-items: center; gap: 12px; position: relative; z-index: 10; }
        .panel-logo {
          width: 44px; height: 44px; background: white; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        }
        .panel-logo-text { color: white; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }

        .panel-hero { position: relative; z-index: 10; }
        .panel-heading {
          color: white; font-size: 40px; font-weight: 800;
          line-height: 1.15; letter-spacing: -1px; margin-bottom: 18px;
        }
        .panel-heading span {
          display: inline-block;
          background: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.4);
          color: transparent;
        }
        .panel-sub { color: rgba(255,255,255,0.45); font-size: 15px; font-weight: 400; line-height: 1.7; max-width: 280px; }

        /* Panel divider line */
        .panel-divider {
          width: 40px; height: 2px; background: white; opacity: 0.15;
          margin-bottom: 20px; position: relative; z-index: 10;
        }

        .trust-badge { display: none; }
        .trust-dot  { display: none; }

        .panel-footer { color: rgba(255,255,255,0.2); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 10; }

        /* ── Right form panel ── */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
          background: #ffffff;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
        }

        /* Mobile brand */
        .mobile-brand {
          display: flex; align-items: center; gap: 10px; margin-bottom: 36px;
        }
        @media (min-width: 1024px) { .mobile-brand { display: none; } }
        .mobile-logo {
          width: 38px; height: 38px; background: #0c1424; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-brand-text { font-weight: 800; font-size: 18px; color: #0c1424; letter-spacing: -0.5px; }

        .login-heading { font-size: 28px; font-weight: 800; color: #0c1424; letter-spacing: -0.7px; margin-bottom: 6px; }
        .login-sub { font-size: 14px; color: #64748b; font-weight: 400; margin-bottom: 28px; }

        /* Error box */
        .error-box {
          display: flex; align-items: flex-start; gap: 10px;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 14px 16px;
          color: #dc2626; font-size: 13px; font-weight: 500;
          margin-bottom: 22px; line-height: 1.5;
        }
        .error-icon { flex-shrink: 0; margin-top: 1px; }

        /* Form label */
        .field-label {
          display: block; font-size: 12px; font-weight: 700;
          color: #475569; text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        /* Input wrapper */
        .input-wrap { position: relative; margin-bottom: 6px; }
        .field-block { margin-bottom: 20px; }
        .form-input {
          width: 100%; padding: 13px 16px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          font-family: 'Sora', sans-serif; font-size: 14px; color: #111111;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus { border-color: #111111; box-shadow: 0 0 0 3px rgba(17,17,17,0.08); background: #fff; }
        .form-input::placeholder { color: #94a3b8; }
        .form-input.has-error { border-color: #f87171; background: #fff9f9; }
        .form-input.is-valid { border-color: #34d399; background: #f0fdf4; }

        .field-msg {
          font-size: 11px; font-weight: 600; margin-top: 5px; margin-left: 2px;
          display: flex; align-items: center; gap: 4px; min-height: 16px;
        }
        .field-msg.error { color: #ef4444; }
        .field-msg.valid { color: #10b981; }

        /* Eye toggle */
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          display: flex; align-items: center; padding: 2px;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #111111; }

        /* Submit btn */
        .submit-btn {
          width: 100%; background: #111111; color: white;
          border: none; border-radius: 12px; padding: 15px 20px;
          font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #333333; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .divider-text { font-size: 12px; color: #94a3b8; font-weight: 500; }

        /* Footer link */
        .form-footer { text-align: center; font-size: 14px; color: #64748b; font-weight: 400; margin-top: 18px; }
        .footer-link { color: #111111; font-weight: 700; background: none; border: none; cursor: pointer; font-family: 'Sora', sans-serif; font-size: 14px; text-decoration: underline; text-underline-offset: 3px; }
        .footer-link:hover { color: #555555; }

        .copyright { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }
      `}</style>

      <div className="login-root">
        {/* Left panel */}
        <div className="login-panel">
          <div className="panel-brand">
            <div className="panel-logo">
              <Activity size={20} color="#111111" />
            </div>
            <span className="panel-logo-text">Medicare</span>
          </div>

          <div className="panel-hero">
            <div className="panel-divider" />
            <h1 className="panel-heading">
              Your health,
              <br />
              <span>always with you.</span>
            </h1>
            <p className="panel-sub">
              Sign in to access your health dashboard, medical records, and care
              history — all in one place.
            </p>
          </div>

          <div className="panel-footer">
            © 2026 Medicare. All rights reserved.
          </div>
        </div>

        {/* Right form */}
        <div className="login-form-side">
          <div className="login-card">
            {/* Mobile brand */}
            <div className="mobile-brand">
              <div className="mobile-logo">
                <Activity size={18} color="white" />
              </div>
              <span className="mobile-brand-text">Medicare</span>
            </div>

            <h1 className="login-heading">Login</h1>
            <p className="login-sub">
              Enter your email and password to access your account
            </p>

            {error && (
              <div className="error-box">
                <AlertCircle size={16} className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={handleLogin}
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
                  {/* Email */}
                  <div className="field-block">
                    <label className="field-label">Email Address</label>
                    <div className="input-wrap">
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`form-input ${errors.email && touched.email && focusedField !== "email" ? "has-error" : !errors.email && values.email ? "is-valid" : ""}`}
                        value={values.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={(e) => {
                          setFocusedField("");
                          handleBlur(e);
                        }}
                      />
                    </div>
                    {errors.email &&
                    touched.email &&
                    focusedField !== "email" ? (
                      <p className="field-msg error">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    ) : !errors.email && values.email.length > 0 ? (
                      <p className="field-msg valid">
                        <CheckCircle2 size={11} /> Looks good!
                      </p>
                    ) : (
                      <div style={{ minHeight: 21 }} />
                    )}
                  </div>

                  {/* Password */}
                  <div className="field-block">
                    <label className="field-label">Password</label>
                    <div className="input-wrap">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`form-input ${errors.password && touched.password && focusedField !== "password" ? "has-error" : ""}`}
                        style={{ paddingRight: 44 }}
                        value={values.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={(e) => {
                          setFocusedField("");
                          handleBlur(e);
                        }}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.password &&
                    touched.password &&
                    focusedField !== "password" ? (
                      <p className="field-msg error">
                        <AlertCircle size={11} /> {errors.password}
                      </p>
                    ) : (
                      <div style={{ minHeight: 21 }} />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner" /> Signing in…
                      </>
                    ) : (
                      <>
                        Log In <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="form-footer">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="footer-link"
                      onClick={() => handleNavigation("/register")}
                    >
                      Create a free account
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <p className="copyright">© 2026 Medicare · Secure & Private</p>
          </div>
        </div>
      </div>
    </>
  );
}
