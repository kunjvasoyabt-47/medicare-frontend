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
  XCircle
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

      <div className="min-h-screen flex bg-white">
        {/* Left Panel */}
        <div className="reg-panel hidden lg:flex lg:w-[42%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12 flex-shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Activity size={20} className="text-slate-900" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">Medicare</span>
            </div>

            <div className="w-10 h-0.5 bg-white opacity-15 mb-4" />
            <h1 className="text-white text-4xl font-black leading-tight tracking-tight mt-5 mb-3 r-heading">
              Better health
              <br />
              <span>starts here.</span>
            </h1>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-8">
              Create your free account and take control of your healthcare
              journey with a platform built for you.
            </p>
            <div className="flex flex-col gap-3.5">
             {FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                      <FeatureIcon size={14} className="text-white" />
                    </div>
                    <span className="text-white/60 text-sm">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>


        </div>

        {/* Right Form */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full flex justify-center items-center p-5 sm:p-6">
            <div className="w-full max-w-xl">
              <div className="flex lg:hidden items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
                <span className="font-black text-lg text-slate-900 tracking-tight">Medicare</span>
              </div>

              <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1">Create your account</h1>
              <p className="text-xs text-slate-500 font-normal mb-4 leading-relaxed">
                Fill in your details to get started
              </p>

              {regError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-300 rounded-2xl p-3 text-red-600 text-sm font-medium mb-3 leading-relaxed">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-3">
                      <div className="mb-2.5">
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input
                          name="full_name"
                          type="text"
                          placeholder="John Doe"
                          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all ${errors.full_name && touched.full_name && focusedField !== "full_name"
                            ? "border-red-300 bg-red-50"
                            : !errors.full_name && values.full_name
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 focus:border-slate-900 focus:bg-white"
                            }`}
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
                          <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                            <XCircle size={11} /> {errors.full_name}
                          </p>
                        ) : (
                          <div className="min-h-4" />
                        )}
                      </div>

                      <div className="mb-2.5">
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all ${errors.email && touched.email && focusedField !== "email"
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
                        {errors.email &&
                          touched.email &&
                          focusedField !== "email" ? (
                          <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                            <XCircle size={11} /> {errors.email}
                          </p>
                        ) : !errors.email &&
                          values.email &&
                          focusedField !== "email" ? (
                          <p className="text-xs font-semibold text-emerald-600 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                            <CheckCircle2 size={11} /> Valid email
                          </p>
                        ) : (
                          <div className="min-h-4" />
                        )}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-3">
                      <div className="mb-2.5">
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Gender</label>
                        <Field
                          as="select"
                          name="gender"
                          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all appearance-none bg-no-repeat bg-right-3 pr-10 ${errors.gender && touched.gender && focusedField !== "gender"
                            ? "border-red-300 bg-red-50"
                            : !errors.gender && values.gender
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 focus:border-slate-900 focus:bg-white"
                            }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundPosition: "right 14px center",
                          }}
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
                          <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                            <XCircle size={11} /> {errors.gender}
                          </p>
                        ) : (
                          <div className="min-h-4" />
                        )}
                      </div>

                      <div className="mb-2.5">
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Date of Birth</label>
                        <input
                          name="dob"
                          type="date"
                          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all ${errors.dob && touched.dob && focusedField !== "dob"
                            ? "border-red-300 bg-red-50"
                            : !errors.dob && values.dob
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 focus:border-slate-900 focus:bg-white"
                            }`}
                          value={values.dob}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("dob")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {errors.dob && touched.dob && focusedField !== "dob" ? (
                          <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                            <XCircle size={11} /> {errors.dob}
                          </p>
                        ) : (
                          <div className="min-h-4" />
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <PasswordStrengthField
                      label="Password"
                      name="password"
                      placeholder="••••••••"
                      className="mb-3"
                    />

                    {/* Confirm Password */}
                    <div className="mb-2.5">
                      <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all pr-11 ${values.confirmPassword &&
                            values.password !== values.confirmPassword &&
                            focusedField !== "confirmPassword"
                            ? "border-red-300 bg-red-50"
                            : values.confirmPassword &&
                              values.password === values.confirmPassword
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 focus:border-slate-900 focus:bg-white"
                            }`}
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
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 flex items-center p-0.5 transition-colors hover:text-slate-900"
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
                        <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                          <XCircle size={11} /> Passwords do not match
                        </p>
                      ) : values.confirmPassword &&
                        values.password === values.confirmPassword ? (
                        <p className="text-xs font-semibold text-emerald-600 mt-1 ml-0.5 flex items-center gap-1 min-h-4">
                          <CheckCircle2 size={11} /> Passwords match
                        </p>
                      ) : (
                        <div className="min-h-4" />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 text-white border-none rounded-3xl py-3.5 px-5 font-sans text-base font-black cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
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

                    <p className="text-center text-sm text-slate-500 font-normal mt-3">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-slate-900 font-black bg-none border-none cursor-pointer font-sans text-sm underline underline-offset-1 hover:text-slate-600"
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
