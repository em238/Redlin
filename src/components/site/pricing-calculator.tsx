"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Package, Clock, Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, formatEGP } from "@/lib/api";
import { toast } from "sonner";
import { SectionHeading } from "@/components/shared/section-heading";

const FALLBACK_GOV = [
  { name: "Cairo", nameAr: "القاهره", basePrice: 30, etaHours: 24 },
  { name: "Giza", nameAr: "الجيزه", basePrice: 30, etaHours: 24 },
];
const FALLBACK_SVC = [
  { name: "Standard", nameAr: "عادي", multiplier: 1 },
  { name: "Express", nameAr: "ممتاز", multiplier: 1.6 },
];

const WEIGHT_PRESETS = [0.5, 1, 3, 5, 10, 20];

export function PricingCalculator() {
  const [governorate, setGovernorate] = useState("");
  const [service, setService] = useState("");
  const [weight, setWeight] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: govData } = useQuery({ queryKey: ["governorates"], queryFn: () => apiGet<{ governorates: typeof FALLBACK_GOV }>("/api/governorates") });
  const { data: svcData } = useQuery({ queryKey: ["services"], queryFn: () => apiGet<{ services: typeof FALLBACK_SVC }>("/api/services") });

  const govs = govData?.governorates ?? FALLBACK_GOV;
  const svcs = svcData?.services ?? FALLBACK_SVC;

  useEffect(() => {
    if (!governorate && govs[0]) setGovernorate(govs[0].name);
    if (!service && svcs[0]) setService(svcs[0].name);
  }, [govs, svcs]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.phone.trim()) e.phone = "الهاتف مطلوب";
    else if (!/^01[0-2,5]\d{8}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "رقم هاتف غير صحيح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const calculate = async () => {
    if (!governorate || !service) { toast.error("اختر المحافظة والخدمة"); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await apiGet<any>(`/api/pricing/calculate?governorate=${encodeURIComponent(governorate)}&service=${encodeURIComponent(service)}&weight=${weight}`);
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || "خطأ في الحساب");
    } finally {
      setLoading(false);
    }
  };

  const submitOrder = async () => {
    if (!result) { toast.error("احسب السعر أولاً"); return; }
    if (!validate()) { toast.error("راجع البيانات"); return; }
    try {
      await apiPost("/api/orders", {
        customerName: form.name, phone: form.phone, governorate, service, weight,
        notes: form.address, price: result.price,
      });
      toast.success("تم استلام طلبك! سيتواصل معك فريق Redline لتأكيد الطلب.");
      setForm({ name: "", phone: "", address: "" });
      setResult(null);
    } catch (e: any) {
      toast.error(e.message || "خطأ في إرسال الطلب");
    }
  };

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="حاسبة الأسعار"
          title={<>احسب سعر شحنتك في <span className="text-gradient-red">ثوانٍ</span></>}
          subtitle="اختر المحافظة والخدمة والوزن — احصل على سعر فوري مع وقت التوصيل المتوقع"
        />

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-primary" /> المحافظة الوجهة
                </Label>
                <Select value={governorate} onValueChange={(v) => { setGovernorate(v); setResult(null); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {govs.map((g) => (
                      <SelectItem key={g.name} value={g.name}>
                        {g.nameAr} — من {g.basePrice} ج.م
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Package className="w-4 h-4 text-primary" /> نوع الخدمة
                </Label>
                <Select value={service} onValueChange={(v) => { setService(v); setResult(null); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="اختر الخدمة" /></SelectTrigger>
                  <SelectContent>
                    {svcs.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.nameAr} (×{s.multiplier})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> الوزن (كجم)</span>
                  <span className="text-primary font-black text-lg tabular-nums">{weight} كجم</span>
                </Label>
                <input
                  type="range" min={0.5} max={50} step={0.5} value={weight}
                  onChange={(e) => { setWeight(Number(e.target.value)); setResult(null); }}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {WEIGHT_PRESETS.map((w) => (
                    <button
                      key={w}
                      onClick={() => { setWeight(w); setResult(null); }}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        weight === w ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {w} كجم
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={calculate} disabled={loading}
              className="mt-6 w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-primary/25 gap-2 text-base group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
              {loading ? "جاري الحساب..." : "احسب السعر الآن"}
            </Button>
          </div>

          {/* Result */}
          <div className="lg:col-span-2 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-red-700/5 p-6 sm:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col relative"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    السعر المتوقع
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mt-1 text-4xl sm:text-5xl font-black text-gradient-red tabular-nums"
                  >
                    {formatEGP(result.price)}
                  </motion.div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Clock className="w-4 h-4" />
                    التوصيل خلال {result.etaDays} يوم تقريباً
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    {[
                      { l: "سعر المحافظة الأساسي", v: formatEGP(result.breakdown.base) },
                      { l: "رسوم الوزن", v: formatEGP(result.breakdown.weightFee) },
                      { l: "معامل الخدمة", v: `×${result.breakdown.serviceMultiplier}` },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">{row.l}</span>
                        <span className="font-semibold tabular-nums">{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick order */}
                  <div className="mt-5 pt-5 border-t border-border space-y-2">
                    <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" /> اطلب الشحنة الآن:
                    </div>
                    <div>
                      <input
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                        placeholder="الاسم بالكامل"
                        className={`h-10 w-full rounded-lg border bg-background px-3 text-sm ${errors.name ? "border-destructive" : "border-input"}`}
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        value={form.phone}
                        onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
                        placeholder="01XXXXXXXXX"
                        dir="ltr"
                        className={`h-10 w-full rounded-lg border bg-background px-3 text-sm text-right ${errors.phone ? "border-destructive" : "border-input"}`}
                      />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="العنوان بالتفصيل"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    />
                    <Button onClick={submitOrder} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Check className="w-4 h-4" /> تأكيد الطلب
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <Calculator className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    املأ البيانات واضغط "احسب السعر" لمعرفة التكلفة المتوقعة لشحنتك
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
