"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
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
              {/* WhatsApp speech bubble icon */}
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.27 9.27 0 01-4.708-1.315 9.31 9.31 0 01-3.4-3.42L4.05 18.6l1.515-4.455a9.27 9.27 0 01-1.252-4.66c0-5.13 4.19-9.32 9.33-9.32 2.49 0 4.83.97 6.59 2.73a9.24 9.24 0 012.73 6.59c0 5.13-4.19 9.32-9.32 9.32m7.939-17.27A11.18 11.18 0 0013.643 0C7.444 0 2.41 5.034 2.41 11.232c0 1.98.517 3.916 1.502 5.633L2 22l5.285-1.385a11.2 11.2 0 005.358 1.364h.001c6.198 0 11.232-5.034 11.232-11.232a11.16 11.16 0 00-3.287-7.938" />
              </svg>
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
