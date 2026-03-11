import { useState } from 'react';
import { useField } from 'formik';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const InputField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const [isFocused, setIsFocused] = useState(false);

  // Logic: Show error only if there is an error AND the field is currently focused
  const showLiveError = meta.error && isFocused;

  return (
    <div className="mb-5 group">
      <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider group-focus-within:text-slate-950 transition-colors">
        {label}
      </label>
      <input
        {...field}
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          field.onBlur(e);
          setIsFocused(false);
        }}
        className={`w-full px-4 py-3 rounded-3xl border-2 bg-slate-50 font-sans text-sm text-slate-900 outline-none transition-all ${showLiveError
            ? "border-red-300 bg-red-50"
            : "border-slate-200 focus:border-slate-900 focus:bg-white"
          }`}
      />
      {showLiveError && (
        <p className="text-red-500 text-xs font-semibold mt-1.5 ml-0.5 flex items-center gap-1.5 animate-in fade-in duration-200">
          <AlertCircle size={12} /> {meta.error}
        </p>
      )}
    </div>
  );
};
