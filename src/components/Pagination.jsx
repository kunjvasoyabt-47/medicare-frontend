import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [];
  if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    );
  }
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false,
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const countText =
    totalItems === 0 ? "No records found" : `${start}–${end} of ${totalItems}`;

  const baseStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

  if (totalPages <= 1 && totalItems <= pageSize) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-100" style={baseStyle}>
        <p className="text-slate-400 text-[12px]" style={{ fontWeight: 400 }}>
          {countText}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100"
      style={baseStyle}
    >
      <p className="text-slate-400 text-[12px]" style={{ fontWeight: 400 }}>
        {countText}
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        {getPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === "..." ? (
            <span
              key={`dots-${idx}`}
              className="w-7 h-7 flex items-center justify-center text-slate-300 text-[12px] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] transition-all disabled:cursor-not-allowed ${
                page === currentPage
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              style={{ fontWeight: page === currentPage ? 600 : 400 }}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
