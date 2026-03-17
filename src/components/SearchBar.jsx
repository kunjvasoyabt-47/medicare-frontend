import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 400,
  className = "",
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isPending, setIsPending] = useState(false);
  const lastEmittedValueRef = useRef(value || "");
  const timerRef = useRef(null);

  // Sync external value (e.g. URL param resets)
  useEffect(() => {
    if (value !== lastEmittedValueRef.current) {
      setInputValue(value || "");
      lastEmittedValueRef.current = value || "";
      setIsPending(false);
    }
  }, [value]);

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value;
      setInputValue(next);

      if (next === lastEmittedValueRef.current) {
        setIsPending(false);
        return;
      }

      setIsPending(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lastEmittedValueRef.current = next;
        setIsPending(false);
        onChange(next);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputValue("");
    setIsPending(false);
    lastEmittedValueRef.current = "";
    onChange("");
  }, [onChange]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div className={`relative group ${className}`}>
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all">
        {isPending ? (
          <Loader2 size={15} className="animate-spin text-slate-400" />
        ) : (
          <Search
            size={15}
            className="text-slate-400 group-focus-within:text-slate-600 transition-colors"
          />
        )}
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-xl text-[13.5px] text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 hover:border-slate-300 transition-all duration-150 shadow-sm"
      />

      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
