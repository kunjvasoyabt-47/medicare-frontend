import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { AlertCircle, Activity, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginSchema } from "../lib/validation";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { API_ROUTES } from "../lib/routes";

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
      const response = await api.post(API_ROUTES.auth.login, values);
      const refreshToken = response?.data?.refresh_token;
      if (
        typeof refreshToken === "string" &&
        refreshToken.trim() !== "" &&
        refreshToken !== "undefined" &&
        refreshToken !== "null"
      ) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }

      const authUser = await checkAuth();
      if (!authUser) {
        throw new Error("SESSION_NOT_ESTABLISHED");
      }

      if (authUser.is_admin) navigate("/admin/dashboard");
      else navigate("/patient/dashboard");
    } catch (err) {
      if (err.message === "SESSION_NOT_ESTABLISHED") {
        setError(
          "Login was accepted, but a secure session could not be established in this browser context. Please verify backend cookie settings (Domain, SameSite, Secure).",
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Incorrect email or password. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: "#0f172a" }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow">
              <Activity size={18} className="text-slate-900" />
            </div>
            <span
              className="text-white text-[17px] tracking-tight"
              style={{ fontWeight: 600 }}
            >
              Medicare
            </span>
          </div>

          {/* Headline */}
          <div>
            <p
              className="text-slate-500 text-[13px] uppercase tracking-widest mb-4"
              style={{ fontWeight: 500, letterSpacing: "0.12em" }}
            >
              Patient Portal
            </p>
            <h1
              className="text-white leading-tight mb-5"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(32px, 3.5vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.15,
              }}
            >
              Your health records,
              <br />
              <em>always within reach.</em>
            </h1>
            <p
              className="text-slate-400 leading-relaxed max-w-xs"
              style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7 }}
            >
              Securely access your discharge summaries, medical reports, and
              care history — all in one place.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10">
          <div className="space-y-3 mb-10">
            {[
              "Complete discharge documentation",
              "Prescription and billing history",
              "Private and HIPAA-compliant",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                <p
                  className="text-slate-400 text-[13px]"
                  style={{ fontWeight: 400 }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-[12px]" style={{ fontWeight: 400 }}>
            © 2026 Medicare · Secure & Private
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto min-h-0">
        <div className="w-full max-w-[380px]">
          {/* Mobile Brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-7">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span
              className="text-slate-900 text-[16px]"
              style={{ fontWeight: 600 }}
            >
              Medicare
            </span>
          </div>

          <h2
            className="text-slate-900 mb-1"
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </h2>
          <p
            className="text-slate-500 mb-6"
            style={{ fontSize: "13px", fontWeight: 400 }}
          >
            Enter your credentials to access your account
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-600 text-[13px] mb-6 leading-relaxed">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span style={{ fontWeight: 500 }}>{error}</span>
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
              <Form className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    className="block text-slate-600 mb-1"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border bg-white text-slate-900 outline-none transition-all text-[13px]"
                    style={{
                      fontWeight: 400,
                      borderColor:
                        errors.email &&
                        touched.email &&
                        focusedField !== "email"
                          ? "#fca5a5"
                          : !errors.email && values.email
                            ? "#6ee7b7"
                            : "#e2e8f0",
                      boxShadow:
                        focusedField === "email"
                          ? "0 0 0 3px rgba(15,23,42,0.08)"
                          : "none",
                    }}
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
                    focusedField !== "email" && (
                      <p
                        className="flex items-center gap-1 text-red-500 text-[11px] mt-1"
                        style={{ fontWeight: 500 }}
                      >
                        <AlertCircle size={10} /> {errors.email}
                      </p>
                    )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-slate-600 mb-1"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2 rounded-xl border bg-white text-slate-900 outline-none transition-all pr-10 text-[13px]"
                      style={{
                        fontWeight: 400,
                        borderColor:
                          errors.password &&
                          touched.password &&
                          focusedField !== "password"
                            ? "#fca5a5"
                            : "#e2e8f0",
                        boxShadow:
                          focusedField === "password"
                            ? "0 0 0 3px rgba(15,23,42,0.08)"
                            : "none",
                      }}
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password &&
                    touched.password &&
                    focusedField !== "password" && (
                      <p
                        className="flex items-center gap-1 text-red-500 text-[11px] mt-1"
                        style={{ fontWeight: 500 }}
                      >
                        <AlertCircle size={10} /> {errors.password}
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
                  style={{ backgroundColor: "#0f172a", fontWeight: 600 }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1e293b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0f172a")
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <p
                  className="text-center text-slate-500 text-[12px]"
                  style={{ fontWeight: 400 }}
                >
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-slate-900 underline underline-offset-2 hover:text-slate-600 transition-colors"
                    style={{
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => handleNavigation("/register")}
                  >
                    Create account
                  </button>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
