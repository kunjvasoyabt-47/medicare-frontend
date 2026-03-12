import React, { useState } from "react";
import { Send } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function TelegramChatBot() {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();

    // Only show on patient routes
    const isPatientRoute = location.pathname.startsWith("/patient/");

    if (!isPatientRoute) {
        return null;
    }

    const handleTelegramClick = () => {
        // Replace with your actual Telegram bot link
        const telegramBotLink = "https://t.me/medicare_health_assistant_bot";
        window.open(telegramBotLink, "_blank");
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 font-sans">
            {/* Tooltip */}
            {isHovered && (
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
                <Send size={24} className="group-hover:scale-125 transition-transform duration-300 transform" style={{ transform: 'rotate(5deg)' }} />
            </button>
        </div>
    );
}
