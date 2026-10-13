"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, DollarSign, MapPin, Clock, Truck, Zap, Rocket, Package, Banknote, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet, formatEGP } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const ICONS: Record<string, any> = {
  truck: Truck, zap: Zap, rocket: Rocket, package: Package, banknote: Banknote, "rotate-ccw": RotateCcw,
};

const ZONE_STYLE: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  B: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  C: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  D: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

export function DashboardPricing() {
  const { data: govData, isLoading } = useQuery({ queryKey: ["governorates"], queryFn: () => apiGet<any>("/api/governorates") });
  const { data: svcData } = useQuery({ queryKey: ["services"], queryFn: () => apiGet<any>("/api/services") });
  const govs = govData?.governorates ?? [];
  const svcs = svcData?.services ?? [];
  const [filter, setFilter] = useState("");

  const filtered = govs.filter((g: any) =>
    g.nameAr.includes(filter) || g.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Services overview */}
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> خدمات الشحن
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {svcs.map((s: any) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm">{s.nameAr}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
                </div>
                <span className="text-sm font-black text-primary shrink-0">×{s.multiplier}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Governorates pricing table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> أسعار المحافظات
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">السعر الأساسي لكل محافظة ووقت التوصيل المتوقع</p>
          </div>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="بحث محافظة..."
            className="h-9 w-full sm:w-56"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 sticky top-0 z-10">
                <tr className="text-right">
                  <th className="px-4 py-3 font-semibold">المحافظة</th>
                  <th className="px-4 py-3 font-semibold">المنطقة</th>
                  <th className="px-4 py-3 font-semibold">السعر الأساسي</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">وقت التوصيل</th>
                  <th className="px-4 py-3 font-semibold">سعر ممتاز (×1.6)</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">سعر نفس اليوم (×2.3)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g: any) => (
                  <tr key={g.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-semibold">{g.nameAr}</div>
                          <div className="text-xs text-muted-foreground" dir="ltr">{g.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ZONE_STYLE[g.zone] || ZONE_STYLE.A}`}>المنطقة {g.zone}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">{formatEGP(g.basePrice)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {Math.ceil(g.etaHours / 24)} يوم
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{formatEGP(g.basePrice * 1.6)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-primary font-semibold">{formatEGP(g.basePrice * 2.3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
