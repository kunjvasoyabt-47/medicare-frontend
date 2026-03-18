import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TelegramChatBot() {
  const [isHovered, setIsHovered] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const messageTimeoutRef = useRef(null);
  const location = useLocation();
  const { user, isDischarged, isDischargeStatusLoading } = useAuth();

  const isPatientRoute = location.pathname.startsWith("/patient/");

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const showBlockedMessage = (message) => {
    setStatusMessage(message);
    setShowStatusMessage(true);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(
      () => setShowStatusMessage(false),
      3200,
    );
  };

  const handleTelegramClick = () => {
    if (!user || user.is_admin) return;
    if (isDischargeStatusLoading) {
      showBlockedMessage("Checking discharge status. Please try again.");
      return;
    }
    if (!isDischarged) {
      showBlockedMessage(
        "You are not discharged yet. This bot is only available after discharge.",
      );
      return;
    }
    window.open(
      "https://t.me/medicare_health_assistant_bot",
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (!isPatientRoute) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-40"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Status / blocked message */}
      {showStatusMessage && (
        <div
          className="absolute bottom-14 right-0 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed shadow-lg"
          style={{
            fontWeight: 500,
            width: "18rem",
            maxWidth: "calc(100vw - 2.5rem)",
            animation: "fadeInUp 0.15s ease-out",
          }}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && !showStatusMessage && (
        <div
          className="absolute bottom-14 right-0 bg-slate-900 text-white px-3 py-2 rounded-lg text-[12px] whitespace-nowrap shadow-lg"
          style={{
            fontWeight: 500,
            animation: "fadeInUp 0.12s ease-out",
          }}
        >
          Post-Discharge Support
          <div className="absolute bottom-0 right-4 w-1.5 h-1.5 bg-slate-900 rotate-45 translate-y-0.5" />
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleTelegramClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Open Telegram support chat"
      >
        <Send size={16} style={{ transform: "rotate(5deg)" }} />
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
