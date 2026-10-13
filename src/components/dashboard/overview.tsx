"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package, ShoppingCart, Users, Video, TrendingUp, TrendingDown,
  Clock, CheckCircle2, Loader2, ArrowLeft, Truck, Banknote
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiGet, formatEGP, formatDateTime, STATUS_LABELS, STATUS_COLORS } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export function DashboardOverview() {
  const { setDashboardSection } = useAppStore();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<any>("/api/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const s = data || { counts: {}, weekly: [], monthlyRevenue: [], recentShipments: [], recentOrders: [], statusMap: {}, revenue: 0 };

  const kpis = [
    { label: "إجمالي الشحنات", value: s.counts.shipments ?? 0, icon: Package, color: "from-primary to-red-700", trend: "+12%" },
    { label: "الطلبات الجديدة", value: s.counts.orders ?? 0, icon: ShoppingCart, color: "from-blue-500 to-blue-700", trend: "+8%" },
    { label: "العملاء", value: s.counts.customers ?? 0, icon: Users, color: "from-emerald-500 to-emerald-700", trend: "+5%" },
    { label: "إجمالي الإيرادات", value: formatEGP(s.revenue ?? 0), icon: Banknote, color: "from-amber-500 to-amber-700", trend: "+23%" },
  ];

  const maxWeekly = Math.max(...(s.weekly?.map((d: any) => d.count) || [1]), 1);
  const maxRev = Math.max(...(s.monthlyRevenue?.map((d: any) => d.revenue) || [1]), 1);

  const statusData = Object.entries(s.statusMap || {}).map(([k, v]) => ({
    status: k, count: v, label: STATUS_LABELS[k] || k, color: STATUS_COLORS[k] || "",
  })).sort((a, b) => Number(b.count) - Number(a.count));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="p-5 hover:shadow-lg transition-shadow border-border">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {kpi.trend}
                </span>
              </div>
              <div className="mt-4 text-2xl font-black">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly shipments bar chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">الشحنات آخر 7 أيام</h3>
              <p className="text-xs text-muted-foreground">عدد الشحنات اليومية</p>
            </div>
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {s.weekly?.map((d: any, i: number) => {
              const h = (d.count / maxWeekly) * 100;
              const day = new Date(d.date).toLocaleDateString("ar-EG", { weekday: "short" });
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-primary to-red-500 rounded-t-lg relative group"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.count}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Status distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-1">توزيع الحالات</h3>
          <p className="text-xs text-muted-foreground mb-5">حالات الشحنات الحالية</p>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {statusData.map((s, i) => {
              const total = statusData.reduce((a, b) => a + Number(b.count), 0) || 1;
              const pct = (Number(s.count) / total) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05 }}
                      className={`h-full rounded-full ${s.color.split(" ")[0]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Revenue chart + quick stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">الإيرادات الشهرية</h3>
              <p className="text-xs text-muted-foreground">آخر 6 أشهر</p>
            </div>
            <Banknote className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-end justify-between gap-3 h-44">
            {s.monthlyRevenue?.map((m: any, i: number) => {
              const h = (m.revenue / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-5">مؤشرات سريعة</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">شحنات قيد التنفيذ</span>
              </div>
              <span className="font-black text-lg">{s.counts.pending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">تم تسليمها</span>
              </div>
              <span className="font-black text-lg">{s.counts.delivered ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">فيديوهات منشورة</span>
              </div>
              <span className="font-black text-lg">{s.counts.videos ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">أحدث الشحنات</h3>
            <button onClick={() => setDashboardSection("shipments")} className="text-xs text-primary hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {s.recentShipments?.slice(0, 5).map((sh: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="font-semibold text-sm font-mono">{sh.trackingNo}</div>
                  <div className="text-xs text-muted-foreground truncate">{sh.receiverName} · {sh.governorate}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[sh.status] || ""}`}>
                  {STATUS_LABELS[sh.status] || sh.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">أحدث الطلبات</h3>
            <button onClick={() => setDashboardSection("orders")} className="text-xs text-primary hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {s.recentOrders?.slice(0, 5).map((o: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">{formatEGP(o.price)}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[o.status] || ""}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
