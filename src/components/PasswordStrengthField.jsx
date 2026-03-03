import { useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export const PasswordStrengthField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const [show, setShow] = useState(false);
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

  return (
    <div className="mb-5">
      <label className="block text-[13px] font-bold text-slate-600 mb-2 ml-4  tracking-wider group-focus-within:text-slate-950 transition-colors">
        {label}
      </label>
      
      <div className="relative">
        <input
          {...field}
          {...props}
          type={show ? "text" : "password"}
          className={`form-input-field pr-12 ${meta.touched && meta.error ? 'form-input-error' : ''}`}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Live Strength Bar */}
      {pwd && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
             <div className="w-full bg-slate-100 rounded-full h-1.5 mr-4">
                <div className={`strength-bar ${strengthColor}`} style={{ width: `${(strengthCount / 4) * 100}%` }}></div>
             </div>
             <span className={`text-[10px] font-bold uppercase ${strengthCount === 4 ? 'text-green-600' : 'text-red-500'}`}>
                {strengthCount <= 1 ? 'weak' : strengthCount <= 3 ? 'fair' : 'strong'}
             </span>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 gap-1 mt-2">
            {checks.map((check, i) => (
              <div key={i} className={`check-item ${check.valid ? 'check-valid' : 'check-invalid'}`}>
                {check.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {check.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};