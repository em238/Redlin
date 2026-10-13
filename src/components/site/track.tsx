"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, MapPin, Phone, Scale, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, formatEGP, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/api";
import { toast } from "sonner";

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
    if (!q) {
      toast.error("أدخل رقم التتبع");
      return;
    }
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            تتبع الشحنة
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            تابع شحنتك <span className="text-gradient-red">لحظة بلحظة</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            أدخل رقم التتبع الخاص بك لمعرفة مكان شحنتك ووضعها الحالي ومراحل التوصيل
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && track()}
                placeholder="مثال: RED100001"
                className="h-12 pr-11 text-base"
              />
            </div>
            <Button
              onClick={() => track()}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-primary/25 gap-2 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              تتبع
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {["RED100001", "RED100005", "RED100010"].map((demo) => (
              <button
                key={demo}
                onClick={() => { setTrackingNo(demo); track(demo); }}
                className="px-3 py-1 text-xs rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors"
              >
                تجربة: {demo}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">رقم التتبع</div>
                    <div className="text-2xl font-black text-gradient-red">{result.shipment.trackingNo}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${STATUS_COLORS[result.shipment.status]}`}>
                    {result.shipment.statusLabel}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 py-5 border-b border-border">
                  {[
                    { icon: MapPin, label: "المحافظة", value: result.shipment.governorate },
                    { icon: Truck, label: "الخدمة", value: result.shipment.service },
                    { icon: Scale, label: "الوزن", value: `${result.shipment.weight} كجم` },
                    { icon: Tag, label: "السعر", value: formatEGP(result.shipment.price) },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <d.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{d.label}</div>
                        <div className="font-semibold text-sm">{d.value}</div>
                      </div>
                    </div>
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
                    <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-border" />
                    {result.history.map((h: any, i: number) => {
                      const Icon = TIMELINE_ICON[h.status] || Package;
                      const isLast = i === result.history.length - 1;
                      return (
                        <div key={i} className="relative pb-6 last:pb-0">
                          <div className={`absolute right-0 -mr-7 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isLast ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="pt-1">
                            <div className="font-semibold text-sm">{h.label || h.status}</div>
                            {h.note && <div className="text-xs text-muted-foreground mt-0.5">{h.note}</div>}
                            <div className="text-xs text-muted-foreground mt-0.5">{formatDate(h.at)}</div>
                          </div>
                        </div>
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
