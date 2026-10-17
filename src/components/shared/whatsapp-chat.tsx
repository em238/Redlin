"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useT } from "@/lib/i18n";

// WhatsApp business phone number (Egypt)
// TODO: Replace with the actual Redline business number
const WHATSAPP_PHONE = "201000000000";

/**
 * Floating WhatsApp Chat Widget
 *
 * Features:
 * - FAB button (green circular) fixed at bottom-end corner
 * - Smooth icon toggle: WhatsApp bubble → X close (rotation)
 * - Popup chat window above the FAB with dark high-tech theme
 * - Green header with avatar + brand name + online status
 * - Auto welcome message bubble
 * - Input field + green send button
 * - On send/Enter: opens https://wa.me/[phone]?text=[message] in new tab
 * - Fully RTL/LTR aware (logical CSS: end-6, text-start, icon rotation)
 */
export function WhatsAppChat() {
  const { t, isAr } = useT();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when popup opens
  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = () => {
    const text = message.trim() || t("wa.default");
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* ===== Popup Chat Window ===== */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-24 end-6 z-50 w-[min(92vw,320px)] sm:w-[350px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/40 bg-[#111827] text-white"
            role="dialog"
            aria-label={t("wa.brand")}
          >
            {/* --- Header (Green Accent) --- */}
            <div className="bg-[#25D366] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar circle */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shrink-0 backdrop-blur-sm">
                  R
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight truncate">
                    {t("wa.brand")}
                  </div>
                  {/* Online status badge */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span className="text-[11px] text-white/85 font-medium">
                      {t("wa.online")}
                    </span>
                  </div>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* --- Chat Body (Dark High-Tech) --- */}
            <div className="p-5 space-y-4">
              {/* Auto Welcome Message Bubble */}
              <div className="bg-[#1f2937] text-slate-200 text-sm p-3.5 rounded-2xl rounded-tr-none shadow-sm leading-relaxed max-w-[90%]">
                {t("wa.welcome")}
              </div>

              {/* Footer / Input Area */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t("wa.placeholder")}
                  className="flex-1 bg-[#1f2937] border border-slate-700/60 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-start min-w-0"
                />
                <button
                  onClick={send}
                  aria-label={t("wa.send")}
                  className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center text-white shrink-0 shadow-md transition-all active:scale-95 hover:scale-105"
                >
                  <Send className={`w-4 h-4 ${isAr ? "-scale-x-100" : ""}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Floating Action Button (FAB) ===== */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("wa.tooltip")}
        title={t("wa.tooltip")}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] shadow-xl flex items-center justify-center text-white transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Clean official WhatsApp icon from react-icons (Font Awesome 6) */}
              <FaWhatsapp className="w-7 h-7 fill-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Online pulse ring on FAB (when closed) */}
      {!open && (
        <span
          className="fixed bottom-6 end-6 z-40 w-14 h-14 rounded-full pointer-events-none"
          aria-hidden
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        </span>
      )}
    </>
  );
}
