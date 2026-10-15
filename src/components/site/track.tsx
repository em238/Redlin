"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, MapPin, Scale, Tag, Loader2, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, formatEGP, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/api";
import { toast } from "sonner";
import { SectionHeading } from "@/components/shared/section-heading";

const TIMELINE_ICON: Record<string, any> = {
  pending: Package, picked_up: Package, in_transit: Truck,
  out_for_delivery: Truck, delivered: CheckCircle2, returned: MapPin, cancelled: Package,
};

export function TrackShipment() {
  const [trackingNo, setTrackingNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const track = async (no?: string) => {
    const q = (no ?? trackingNo).trim();
    if (!q) { toast.error("أدخل رقم التتبع"); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await apiGet<any>(`/api/track?no=${encodeURIComponent(q)}`);
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "لم يتم العثور على الشحنة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="track" className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="تتبع الشحنة"
          title={<>تابع شحنتك <span className="text-gradient-red">لحظة بلحظة</span></>}
          subtitle="أدخل رقم التتبع الخاص بك لمعرفة مكان شحنتك ووضعها الحالي ومراحل التوصيل"
        />

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-card border border-border shadow-sm"
          >
            <div className="relative flex-1">
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && track()}
                placeholder="مثال: RED100001"
                className="h-12 pr-11 text-base border-0 focus-visible:ring-0 bg-muted/40"
              />
            </div>
            <Button
              onClick={() => track()}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-primary/25 gap-2 text-base group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              تتبع
            </Button>
          </motion.div>

          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-muted-foreground py-1">جرّب:</span>
            {["RED100001", "RED100005", "RED100010"].map((demo) => (
              <button
                key={demo}
                onClick={() => { setTrackingNo(demo); track(demo); }}
                className="px-3 py-1 text-xs rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors font-mono"
                dir="ltr"
              >
                {demo}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> رقم التتبع
                    </div>
                    <div className="text-2xl font-black text-gradient-red font-mono mt-1" dir="ltr">{result.shipment.trackingNo}</div>
                  </div>
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold border flex items-center gap-1.5 ${STATUS_COLORS[result.shipment.status]}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-slow-pulse" />
                    {result.shipment.statusLabel}
                  </motion.span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-b border-border">
                  {[
                    { icon: MapPin, label: "المحافظة", value: result.shipment.governorate },
                    { icon: Truck, label: "الخدمة", value: result.shipment.service },
                    { icon: Scale, label: "الوزن", value: `${result.shipment.weight} كجم` },
                    { icon: Tag, label: "السعر", value: formatEGP(result.shipment.price) },
                  ].map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <d.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{d.label}</div>
                        <div className="font-semibold text-sm truncate">{d.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-5">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <div className="text-muted-foreground text-xs">المرسل</div>
                      <div className="font-semibold">{result.shipment.senderName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">المستلم</div>
                      <div className="font-semibold">{result.shipment.receiverName}</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative pr-8">
                    <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-border" />
                    {result.history.map((h: any, i: number) => {
                      const Icon = TIMELINE_ICON[h.status] || Package;
                      const isLast = i === result.history.length - 1;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.12 }}
                          className="relative pb-6 last:pb-0"
                        >
                          <div className={`absolute right-0 -mr-7 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isLast ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "bg-background border-border text-muted-foreground"
                          }`}>
                            {isLast ? <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" /> : null}
                            <Icon className="w-4 h-4 relative" />
                          </div>
                          <div className="pt-1">
                            <div className="font-semibold text-sm">{h.label || h.status}</div>
                            {h.note && <div className="text-xs text-muted-foreground mt-0.5">{h.note}</div>}
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(h.at)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
