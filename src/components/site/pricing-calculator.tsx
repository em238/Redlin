"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Package, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, formatEGP } from "@/lib/api";
import { toast } from "sonner";

const FALLBACK_GOV = [
  { name: "Cairo", nameAr: "القاهره", basePrice: 30, etaHours: 24 },
  { name: "Giza", nameAr: "الجيزه", basePrice: 30, etaHours: 24 },
];
const FALLBACK_SVC = [
  { name: "Standard", nameAr: "عادي", multiplier: 1 },
  { name: "Express", nameAr: "ممتاز", multiplier: 1.6 },
];

export function PricingCalculator() {
  const [governorate, setGovernorate] = useState("");
  const [service, setService] = useState("");
  const [weight, setWeight] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const { data: govData } = useQuery({
    queryKey: ["governorates"],
    queryFn: () => apiGet<{ governorates: typeof FALLBACK_GOV }>("/api/governorates"),
  });
  const { data: svcData } = useQuery({
    queryKey: ["services"],
    queryFn: () => apiGet<{ services: typeof FALLBACK_SVC }>("/api/services"),
  });

  const govs = govData?.governorates ?? FALLBACK_GOV;
  const svcs = svcData?.services ?? FALLBACK_SVC;

  useEffect(() => {
    if (!governorate && govs[0]) setGovernorate(govs[0].name);
    if (!service && svcs[0]) setService(svcs[0].name);
  }, [govs, svcs]);

  const calculate = async () => {
    if (!governorate || !service) {
      toast.error("اختر المحافظة والخدمة");
      return;
    }
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
    if (!result) {
      toast.error("احسب السعر أولاً");
      return;
    }
    if (!form.name || !form.phone) {
      toast.error("الاسم ورقم الهاتف مطلوبان");
      return;
    }
    try {
      await apiPost("/api/orders", {
        customerName: form.name,
        phone: form.phone,
        governorate,
        service,
        weight,
        notes: form.address,
        price: result.price,
      });
      toast.success("تم استلام طلبك! سيتواصل معك فريق Redline لتأكيد الطلب.");
      setForm({ name: "", phone: "", address: "" });
    } catch (e: any) {
      toast.error(e.message || "خطأ في إرسال الطلب");
    }
  };

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            حاسبة الأسعار
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            احسب سعر شحنتك في <span className="text-gradient-red">ثوانٍ</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            اختر المحافظة والخدمة والوزن — احصل على سعر فوري مع وقت التوصيل المتوقع
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-primary" />
                  المحافظة الوجهة
                </Label>
                <Select value={governorate} onValueChange={setGovernorate}>
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
                  <Package className="w-4 h-4 text-primary" />
                  نوع الخدمة
                </Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="اختر الخدمة" /></SelectTrigger>
                  <SelectContent>
                    {svcs.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center justify-between text-sm font-semibold">
                  <span>الوزن (كجم)</span>
                  <span className="text-primary font-bold">{weight} كجم</span>
                </Label>
                <input
                  type="range"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5 كجم</span>
                  <span>50 كجم</span>
                </div>
              </div>
            </div>

            <Button
              onClick={calculate}
              disabled={loading}
              className="mt-6 w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-primary/25 gap-2 text-base"
            >
              <Calculator className="w-5 h-5" />
              {loading ? "جاري الحساب..." : "احسب السعر الآن"}
            </Button>
          </div>

          {/* Result */}
          <div className="lg:col-span-2 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-red-700/5 p-6 sm:p-8 flex flex-col">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="text-sm text-muted-foreground">السعر المتوقع</div>
                  <div className="mt-1 text-4xl sm:text-5xl font-black text-gradient-red">
                    {formatEGP(result.price)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Clock className="w-4 h-4" />
                    التوصيل خلال {result.etaDays} يوم تقريباً
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">سعر المحافظة الأساسي</span>
                      <span className="font-semibold">{formatEGP(result.breakdown.base)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">رسوم الوزن</span>
                      <span className="font-semibold">{formatEGP(result.breakdown.weightFee)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">معامل الخدمة</span>
                      <span className="font-semibold">×{result.breakdown.serviceMultiplier}</span>
                    </div>
                  </div>

                  {/* Quick order */}
                  <div className="mt-5 pt-5 border-t border-border space-y-2">
                    <div className="text-sm font-semibold mb-2">اطلب الشحنة الآن:</div>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="الاسم بالكامل"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="رقم الهاتف"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    />
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="العنوان بالتفصيل"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    />
                    <Button onClick={submitOrder} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Check className="w-4 h-4" />
                      تأكيد الطلب
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
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">
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
