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
import { API_ROUTES } from "../lib/routes";
import { getAccessToken, saveTokensFromPayload } from "../lib/tokenStorage";

const FEATURES = [
  { icon: Heart, text: "All your health records in one place" },
  { icon: FileText, text: "View discharge notes anytime" },
  { icon: Lock, text: "Your data is always private and secure" },
];

const COUNTRY_CODES = [
  { code: "+91", country: "India", iso: "IN" },
  { code: "+1", country: "USA", iso: "US" },
  { code: "+44", country: "UK", iso: "GB" },
  { code: "+61", country: "Australia", iso: "AU" },
  { code: "+81", country: "Japan", iso: "JP" },
  { code: "+86", country: "China", iso: "CN" },
  { code: "+33", country: "France", iso: "FR" },
  { code: "+49", country: "Germany", iso: "DE" },
  { code: "+39", country: "Italy", iso: "IT" },
  { code: "+34", country: "Spain", iso: "ES" },
  { code: "+31", country: "Netherlands", iso: "NL" },
  { code: "+32", country: "Belgium", iso: "BE" },
  { code: "+41", country: "Switzerland", iso: "CH" },
  { code: "+65", country: "Singapore", iso: "SG" },
  { code: "+60", country: "Malaysia", iso: "MY" },
  { code: "+55", country: "Brazil", iso: "BR" },
];

const inputBase =
  "w-full px-3.5 py-2 rounded-xl border bg-white text-slate-900 outline-none transition-all text-[13px]";

function fieldStyle(hasError, hasValid, isFocused) {
  return {
    borderColor: hasError ? "#fca5a5" : hasValid ? "#6ee7b7" : "#e2e8f0",
    boxShadow: isFocused ? "0 0 0 3px rgba(15,23,42,0.07)" : "none",
    fontWeight: 400,
  };
}

export default function Register({ togglePage }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [regError, setRegError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [countryCodeSuggestions, setCountryCodeSuggestions] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (togglePage) togglePage();
    navigate(path);
  };

  const handleCountryCodeChange = (value, setFieldValue) => {
    setFieldValue("country_code", value);
    if (value.trim() === "") {
      setCountryCodeSuggestions([]);
      setShowCountrySuggestions(false);
    } else {
      const exactMatch = COUNTRY_CODES.find(
        (item) => item.country.toLowerCase() === value.toLowerCase(),
      );
      if (exactMatch) {
        setFieldValue("country_code", exactMatch.code);
        setCountryCodeSuggestions([]);
        setShowCountrySuggestions(false);
      } else {
        const filtered = COUNTRY_CODES.filter(
          (item) =>
            item.code.toLowerCase().includes(value.toLowerCase()) ||
            item.country.toLowerCase().includes(value.toLowerCase()),
        );
        setCountryCodeSuggestions(filtered);
        setShowCountrySuggestions(true);
      }
    }
  };

  const handleSelectCountry = (code, setFieldValue) => {
    setFieldValue("country_code", code);
    setShowCountrySuggestions(false);
    setCountryCodeSuggestions([]);
  };

  const handleCountryCodeBlur = (
    value,
    setFieldValue,
    setFieldTouched,
    validateField,
  ) => {
    if (value.startsWith("+")) {
      setShowCountrySuggestions(false);
      setFocusedField("");
      setFieldTouched("country_code", true, false);
      validateField("country_code");
    } else if (value.trim() !== "") {
      const exactMatch = COUNTRY_CODES.find(
        (item) => item.country.toLowerCase() === value.toLowerCase(),
      );
      if (exactMatch) {
        setFieldValue("country_code", exactMatch.code, true);
      } else {
        const partialMatch = COUNTRY_CODES.find(
          (item) =>
            item.country.toLowerCase().startsWith(value.toLowerCase()) ||
            item.code.toLowerCase().includes(value.toLowerCase()),
        );
        setFieldValue(
          "country_code",
          partialMatch ? partialMatch.code : "+91",
          true,
        );
      }
      setShowCountrySuggestions(false);
      setFocusedField("");
      setFieldTouched("country_code", true, false);
      validateField("country_code");
    } else {
      setShowCountrySuggestions(false);
      setFocusedField("");
      setFieldTouched("country_code", true, false);
      validateField("country_code");
    }
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col justify-between p-10 flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: "#0f172a" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow">
              <Activity size={18} className="text-slate-900" />
            </div>
            <span
              className="text-white text-[17px]"
              style={{ fontWeight: 600 }}
            >
              Medicare
            </span>
          </div>

          <p
            className="text-slate-500 text-[12px] uppercase tracking-widest mb-4"
            style={{ fontWeight: 500, letterSpacing: "0.12em" }}
          >
            New Account
          </p>
          <h1
            className="text-white mb-5 leading-tight"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(28px, 3vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.15,
            }}
          >
            Better health
            <br />
            <em>starts here.</em>
          </h1>
          <p
            className="text-slate-400 leading-relaxed max-w-xs mb-6"
            style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.7 }}
          >
            Create your free account and take full control of your healthcare
            journey with a platform built around you.
          </p>

          <div className="space-y-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-slate-400" />
                  </div>
                  <span
                    className="text-slate-400 text-[13px]"
                    style={{ fontWeight: 400 }}
                  >
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-600 text-[12px]" style={{ fontWeight: 400 }}>
            © 2026 Medicare · Secure & Private
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        <div className="min-h-full flex justify-center items-start py-7 px-5 sm:px-10">
          <div className="w-full max-w-lg">
            {/* Mobile brand */}
            <div className="flex lg:hidden items-center gap-2.5 mb-6">
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
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Create your account
            </h2>
            <p
              className="text-slate-500 mb-5"
              style={{ fontSize: "13px", fontWeight: 400 }}
            >
              Fill in your details to get started
            </p>

            {regError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-[13px] mb-4 leading-relaxed">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span style={{ fontWeight: 500 }}>{regError}</span>
              </div>
            )}

            <Formik
              initialValues={{
                full_name: "",
                email: "",
                gender: "",
                dob: "",
                country_code: "+91",
                phone_number: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={registerSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={async (values, { setSubmitting }) => {
                setRegError("");
                try {
                  const response = await api.post(API_ROUTES.auth.register, {
                    full_name: values.full_name,
                    email: values.email,
                    dob: values.dob,
                    gender: values.gender,
                    country_code: values.country_code,
                    phone_number: values.phone_number,
                    password: values.password,
                  });
                  saveTokensFromPayload(response?.data || {});
                  const accessToken = getAccessToken();
                  if (!accessToken) {
                    throw new Error("TOKENS_NOT_PROVIDED");
                  }

                  const authUser = await checkAuth();
                  if (!authUser) {
                    throw new Error("SESSION_NOT_ESTABLISHED");
                  }

                  navigate(authUser.is_admin ? "/welcome-admin" : "/welcome-patient");
                } catch (err) {
                  if (err.message === "TOKENS_NOT_PROVIDED") {
                    setRegError(
                      "Registration succeeded but tokens were not returned by backend.",
                    );
                  } else if (err.message === "SESSION_NOT_ESTABLISHED") {
                    setRegError(
                      "Tokens were stored, but user verification failed. Please check backend /auth/me for Bearer token auth.",
                    );
                  } else {
                    setRegError(
                      err.response?.data?.detail ||
                        "Registration failed. Please try again.",
                    );
                  }
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
                setFieldValue,
                setFieldTouched,
                validateField,
              }) => {
                const selectedCountry = COUNTRY_CODES.find(
                  (item) => item.code === values.country_code,
                );
                const phoneHasInvalidChars = /[^0-9-]/.test(
                  values.phone_number || "",
                );
                const showPhoneError = Boolean(
                  errors.phone_number &&
                  touched.phone_number &&
                  (focusedField !== "phone_number" || phoneHasInvalidChars),
                );

                const label = (text) => (
                  <label
                    className="block text-slate-600 mb-1"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {text}
                  </label>
                );

                const errMsg = (msg) => (
                  <p
                    className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    <XCircle size={10} /> {msg}
                  </p>
                );

                const okMsg = (msg) => (
                  <p
                    className="flex items-center gap-1 text-emerald-600 text-[11px] mt-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    <CheckCircle2 size={10} /> {msg}
                  </p>
                );

                return (
                  <Form className="space-y-2.5">
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        {label("Full Name")}
                        <input
                          name="full_name"
                          type="text"
                          placeholder="John Doe"
                          className={inputBase}
                          style={fieldStyle(
                            errors.full_name &&
                              touched.full_name &&
                              focusedField !== "full_name",
                            !errors.full_name && values.full_name,
                            focusedField === "full_name",
                          )}
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
                          errMsg(errors.full_name)
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>
                      <div>
                        {label("Email Address")}
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className={inputBase}
                          style={fieldStyle(
                            errors.email &&
                              touched.email &&
                              focusedField !== "email",
                            !errors.email && values.email,
                            focusedField === "email",
                          )}
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
                          errMsg(errors.email)
                        ) : !errors.email &&
                          values.email &&
                          focusedField !== "email" ? (
                          okMsg("Valid email")
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>
                    </div>

                    {/* Row 2: Gender + DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        {label("Gender")}
                        <Field
                          as="select"
                          name="gender"
                          className={inputBase + " appearance-none"}
                          style={{
                            ...fieldStyle(
                              errors.gender &&
                                touched.gender &&
                                focusedField !== "gender",
                              !errors.gender && values.gender,
                              focusedField === "gender",
                            ),
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                            paddingRight: "36px",
                          }}
                          onFocus={() => setFocusedField("gender")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Field>
                        {errors.gender &&
                        touched.gender &&
                        focusedField !== "gender" ? (
                          errMsg(errors.gender)
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>
                      <div>
                        {label("Date of Birth")}
                        <input
                          name="dob"
                          type="date"
                          className={inputBase}
                          style={fieldStyle(
                            errors.dob && touched.dob && focusedField !== "dob",
                            !errors.dob && values.dob,
                            focusedField === "dob",
                          )}
                          value={values.dob}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("dob")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {errors.dob && touched.dob && focusedField !== "dob" ? (
                          errMsg(errors.dob)
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>
                    </div>

                    {/* Row 3: Country code + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        {label("Country Code")}
                        <div className="relative">
                          {selectedCountry?.iso && (
                            <img
                              src={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png`}
                              alt=""
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-3 rounded-sm object-cover border border-slate-200"
                              loading="lazy"
                            />
                          )}
                          <input
                            type="text"
                            name="country_code"
                            placeholder="+91"
                            className={inputBase + " pl-9"}
                            style={fieldStyle(
                              errors.country_code &&
                                touched.country_code &&
                                focusedField !== "country_code",
                              !errors.country_code && values.country_code,
                              focusedField === "country_code",
                            )}
                            value={values.country_code}
                            onChange={(e) =>
                              handleCountryCodeChange(
                                e.target.value,
                                setFieldValue,
                              )
                            }
                            onFocus={() => {
                              setFocusedField("country_code");
                              if (values.country_code) {
                                const filtered = COUNTRY_CODES.filter(
                                  (item) =>
                                    item.code
                                      .toLowerCase()
                                      .includes(
                                        values.country_code.toLowerCase(),
                                      ) ||
                                    item.country
                                      .toLowerCase()
                                      .includes(
                                        values.country_code.toLowerCase(),
                                      ),
                                );
                                setCountryCodeSuggestions(filtered);
                                setShowCountrySuggestions(true);
                              }
                            }}
                            onBlur={() =>
                              handleCountryCodeBlur(
                                values.country_code,
                                setFieldValue,
                                setFieldTouched,
                                validateField,
                              )
                            }
                          />
                        </div>

                        {showCountrySuggestions &&
                          countryCodeSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-44 overflow-y-auto">
                              {countryCodeSuggestions.map((item) => (
                                <button
                                  key={item.code}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectCountry(
                                      item.code,
                                      setFieldValue,
                                    );
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png`}
                                      alt=""
                                      className="w-4 h-3 rounded-sm object-cover border border-slate-200"
                                      loading="lazy"
                                    />
                                    <span
                                      className="text-slate-900 text-[13px]"
                                      style={{ fontWeight: 500 }}
                                    >
                                      {item.code}
                                    </span>
                                  </div>
                                  <span className="text-slate-500 text-[12px]">
                                    {item.country}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                        {errors.country_code &&
                        touched.country_code &&
                        focusedField !== "country_code" ? (
                          errMsg(errors.country_code)
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        {label("Phone Number")}
                        <input
                          name="phone_number"
                          type="tel"
                          placeholder="9876543210"
                          className={inputBase}
                          style={fieldStyle(
                            showPhoneError,
                            !errors.phone_number && values.phone_number,
                            focusedField === "phone_number",
                          )}
                          value={values.phone_number}
                          onChange={(e) => {
                            setFieldValue("phone_number", e.target.value);
                            setFieldTouched("phone_number", true, false);
                            validateField("phone_number");
                          }}
                          onFocus={() => setFocusedField("phone_number")}
                          onBlur={(e) => {
                            setFocusedField("");
                            handleBlur(e);
                          }}
                        />
                        {showPhoneError ? (
                          errMsg(errors.phone_number)
                        ) : !errors.phone_number &&
                          values.phone_number &&
                          focusedField !== "phone_number" ? (
                          okMsg("Valid phone number")
                        ) : (
                          <div className="h-3" />
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <PasswordStrengthField
                      label="Password"
                      name="password"
                      placeholder="••••••••"
                    />

                    {/* Confirm Password */}
                    <div>
                      {label("Confirm Password")}
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className={inputBase + " pr-11"}
                          style={fieldStyle(
                            values.confirmPassword &&
                              values.password !== values.confirmPassword &&
                              focusedField !== "confirmPassword",
                            values.confirmPassword &&
                              values.password === values.confirmPassword,
                            focusedField === "confirmPassword",
                          )}
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
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
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
                        errMsg("Passwords do not match")
                      ) : values.confirmPassword &&
                        values.password === values.confirmPassword ? (
                        okMsg("Passwords match")
                      ) : (
                        <div className="h-3" />
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-white transition-all disabled:opacity-50 text-[14px]"
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
                          Creating account…
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Create Account{" "}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    <p
                      className="text-center text-slate-500 text-[13px]"
                      style={{ fontWeight: 400 }}
                    >
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-slate-900 underline underline-offset-2 hover:text-slate-600 transition-colors"
                        style={{
                          fontWeight: 600,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => handleNavigation("/login")}
                      >
                        Sign in
                      </button>
                    </p>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
