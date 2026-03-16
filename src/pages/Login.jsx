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

      <div className="min-h-screen bg-slate-100 flex">
        {/* Left panel */}
        <div className="login-panel hidden lg:flex lg:w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between p-14 flex-shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Activity size={20} className="text-slate-900" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">Medicare</span>
            </div>

            <div className="w-10 h-0.5 bg-white opacity-15 mb-4" />
            <h1 className="text-white text-5xl font-black leading-tight tracking-tight mb-4 panel-heading">
              Your health,
              <br />
              <span>always with you.</span>
            </h1>
            <p className="text-white/45 text-base leading-relaxed max-w-xs">
              Sign in to access your health dashboard, medical records, and care
              history — all in one place.
            </p>
          </div>

        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto bg-white">
          <div className="w-full max-w-sm">
            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2.5 mb-9">
              <div className="w-9 h-9 bg-slate-900 rounded-2xl flex items-center justify-center">
                <Activity size={18} className="text-white" />
              </div>
              <span className="font-black text-lg text-slate-900 tracking-tight">Medicare</span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1.5">Login</h1>
            <p className="text-sm text-slate-500 font-normal mb-7">
              Enter your email and password to access your account
            </p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-300 rounded-2xl p-3.5 text-red-600 text-sm font-medium mb-5 leading-relaxed">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
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
                  <div className="mb-5">
                    <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Email Address</label>
                    <div className="relative mb-1.5">
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all ${errors.email && touched.email && focusedField !== "email"
                          ? "border-red-300 bg-red-50"
                          : !errors.email && values.email
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 focus:border-slate-900 focus:bg-white"
                          }`}
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
                      <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    ) : (
                      <div className="min-h-5" />
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-5">
                    <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Password</label>
                    <div className="relative mb-1.5">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`w-full px-4 py-3 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all pr-11 ${errors.password && touched.password && focusedField !== "password"
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 focus:border-slate-900 focus:bg-white"
                          }`}
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
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 flex items-center p-0.5 transition-colors hover:text-slate-900"
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
                      <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                        <AlertCircle size={11} /> {errors.password}
                      </p>
                    ) : (
                      <div className="min-h-5" />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white border-none rounded-3xl py-4 px-5 font-sans text-base font-black cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

                  <div className="text-center text-sm text-slate-500 font-normal mt-4.5">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-slate-900 font-black bg-none border-none cursor-pointer font-sans text-sm underline underline-offset-1 hover:text-slate-600"
                      onClick={() => handleNavigation("/register")}
                    >
                      Create a free account
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            <p className="text-center text-slate-400 text-xs mt-8">© 2026 Medicare · Secure & Private</p>
          </div>
        </div>
      </div>
    </>
  );
}
