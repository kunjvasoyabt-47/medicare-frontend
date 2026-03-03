import { useState } from 'react';
import { useField } from 'formik';

export const InputField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const [isFocused, setIsFocused] = useState(false); 

  // Logic: Show error only if there is an error AND the field is currently focused
  const showLiveError = meta.error && isFocused; 

  return (
    <div className="mb-5 group">
      <label className="block text-[13px] font-bold text-slate-600 mb-2 ml-4 tracking-wider group-focus-within:text-slate-950 transition-colors">
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
        className={`form-input-field ${showLiveError ? 'form-input-error' : ''}`} 
      />
      {showLiveError && (
        <p className="text-red-500 text-[12px] mt-1.5 ml-4 font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {meta.error}
        </p>
      )}
    </div>
  );
};