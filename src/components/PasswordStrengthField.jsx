import { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export const PasswordStrengthField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const [show, setShow] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  useFormikContext();

  const pwd = field.value || "";

  // Validation Logic
  const checks = [
    { label: "At least 8 characters", valid: pwd.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(pwd) },
    { label: "One number", valid: /[0-9]/.test(pwd) },
    { label: "One special character", valid: /[!@#$%^&*]/.test(pwd) },
  ];

  const strengthCount = checks.filter(c => c.valid).length;
  const strengthColor = strengthCount <= 1 ? 'bg-red-500' : strengthCount <= 3 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthLabel = strengthCount <= 1 ? 'weak' : strengthCount <= 3 ? 'fair' : 'strong';
  const strengthLabelColor = strengthCount === 4 ? 'text-green-600' : 'text-red-500';

  return (
    <div className="mb-2">
      <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative mb-1">
        <input
          {...field}
          {...props}
          type={show ? "text" : "password"}
          className={`w-full px-4 py-2.5 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all pr-11 ${meta.touched && meta.error && !focusedField
              ? "border-red-300 bg-red-50"
              : "border-slate-200 focus:border-slate-900 focus:bg-white"
            }`}
          onFocus={() => setFocusedField(true)}
          onBlur={(e) => {
            setFocusedField(false);
            field.onBlur(e);
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Live Strength Bar */}
      {pwd && (
        <div className="mt-1.5">
          <div className="flex justify-between items-center gap-3 mb-1">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className={`strength-bar ${strengthColor} rounded-full transition-all duration-500`}
                style={{ width: `${(strengthCount / 4) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-black uppercase ${strengthLabelColor}`}>
              {strengthLabel}
            </span>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 gap-1 mt-0.5">
            {checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${check.valid ? 'text-emerald-600' : 'text-slate-400'
                  }`}
              >
                {check.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {check.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {meta.touched && meta.error && !focusedField && (
        <p className="text-xs font-semibold text-red-500 mt-1 ml-0.5 flex items-center gap-1">
          <XCircle size={11} /> {meta.error}
        </p>
      )}
    </div>
  );
};
