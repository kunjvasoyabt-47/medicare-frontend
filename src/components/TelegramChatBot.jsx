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

  // Only show on patient routes
  const isPatientRoute = location.pathname.startsWith("/patient/");

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const showBlockedMessage = (message) => {
    setStatusMessage(message);
    setShowStatusMessage(true);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setShowStatusMessage(false);
    }, 3200);
  };

  const handleTelegramClick = () => {
    if (!user || user.is_admin) {
      return;
    }

    if (isDischargeStatusLoading) {
      showBlockedMessage("Checking discharge status. Please try again.");
      return;
    }

    if (!isDischarged) {
      showBlockedMessage(
        "You are not discharged yet. Bot will work only if you are discharged.",
      );
      return;
    }

    const telegramBotLink = "https://t.me/medicare_health_assistant_bot";
    window.open(telegramBotLink, "_blank", "noopener,noreferrer");
  };

  if (!isPatientRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {showStatusMessage && (
        <div
          className="absolute bottom-20 right-0 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-[13px] font-semibold leading-relaxed whitespace-normal break-words w-[22rem] max-w-[calc(100vw-2rem)] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && !showStatusMessage && (
        <div className="absolute bottom-20 right-0 bg-[#0f172a] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          Post-Discharge Support on Telegram
          <div className="absolute bottom-0 right-4 w-2 h-2 bg-[#0f172a] transform rotate-45 translate-y-1" />
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleTelegramClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0f172a] to-slate-700 text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group hover:from-slate-700 hover:to-[#0f172a]"
        aria-label="Open Telegram chat"
      >
        <Send
          size={24}
          className="group-hover:scale-125 transition-transform duration-300 transform"
          style={{ transform: "rotate(5deg)" }}
        />
      </button>
    </div>
  );
}
