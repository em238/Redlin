"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Package, ShoppingCart, Users, Banknote, TrendingUp,
  Clock, CheckCircle2, Loader2, ArrowLeft, Truck, Video, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiGet, formatEGP, formatDateTime, STATUS_COLORS } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { StaggerWrap } from "./_shared";

// localized status labels
function useStatusLabels() {
  const { t } = useT();
  return {
    pending: t("d.status.pending"),
    picked_up: t("d.status.picked_up"),
    in_transit: t("d.status.in_transit"),
    out_for_delivery: t("d.status.out_for_delivery"),
    delivered: t("d.status.delivered"),
    returned: t("d.status.returned"),
    cancelled: t("d.status.cancelled"),
    confirmed: t("d.status.confirmed"),
    processing: t("d.status.processing"),
    new: t("d.status.new"),
  };
}

export function DashboardOverview() {
  const { setDashboardSection } = useAppStore();
  const { t, isAr } = useT();
  const STATUS_LABELS = useStatusLabels();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<any>("/api/stats"),
  });

  const STATUS_CHART_COLORS: Record<string, string> = {
    pending: "#f59e0b", picked_up: "#3b82f6", in_transit: "#6366f1",
    out_for_delivery: "#a855f7", delivered: "#10b981", returned: "#f43f5e", cancelled: "#71717a",
  };

  // Build donut conic gradient (memoized, immutable computation)
  const donutSegments = useMemo(() => {
    const statusMap = data?.statusMap || {};
    const entries = Object.entries(statusMap)
      .map(([k, v]) => ({ status: k, count: Number(v) }))
      .sort((a, b) => b.count - a.count);
    const total = entries.reduce((a, b) => a + b.count, 0) || 1;
    return entries.map((sd, i) => {
      const startSum = entries.slice(0, i).reduce((a, b) => a + b.count, 0);
      const startDeg = (startSum / total) * 360;
      const pctDeg = (sd.count / total) * 360;
      return { color: STATUS_CHART_COLORS[sd.status] || "#71717a", start: startDeg, end: startDeg + pctDeg };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 h-32 animate-pulse bg-muted/40" />
        ))}
      </div>
    );
  }

  const s = data || { counts: {}, weekly: [], monthlyRevenue: [], recentShipments: [], recentOrders: [], statusMap: {}, revenue: 0 };

  const kpis = [
    { label: t("d.overview.kpi.shipments"), value: s.counts.shipments ?? 0, icon: Package, color: "from-primary to-red-700", trend: "+12%", spark: s.weekly?.map((d: any) => d.count) || [] },
    { label: t("d.overview.kpi.orders"), value: s.counts.orders ?? 0, icon: ShoppingCart, color: "from-blue-500 to-blue-700", trend: "+8%", spark: [3, 5, 2, 6, 4, 8, 5] },
    { label: t("d.overview.kpi.customers"), value: s.counts.customers ?? 0, icon: Users, color: "from-emerald-500 to-emerald-700", trend: "+5%", spark: [1, 2, 3, 2, 4, 3, 5] },
    { label: t("d.overview.kpi.revenue"), value: formatEGP(s.revenue ?? 0), icon: Banknote, color: "from-amber-500 to-amber-700", trend: "+23%", spark: s.monthlyRevenue?.map((d: any) => d.revenue) || [] },
  ];

  const maxWeekly = Math.max(...(s.weekly?.map((d: any) => d.count) || [1]), 1);
  const maxRev = Math.max(...(s.monthlyRevenue?.map((d: any) => d.revenue) || [1]), 1);

  const statusData = Object.entries(s.statusMap || {}).map(([k, v]) => ({
    status: k, count: v, label: STATUS_LABELS[k] || k, color: STATUS_COLORS[k] || "",
  })).sort((a, b) => Number(b.count) - Number(a.count));
  const totalStatus = statusData.reduce((a, b) => a + Number(b.count), 0) || 1;

  return (
    <div className="space-y-6">
      {/* KPIs with sparklines */}
      <StaggerWrap className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all border-border group">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              </div>
              <div className="mt-4 text-2xl font-black tabular-nums">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
              {/* Sparkline */}
              <div className="mt-3 flex items-end gap-0.5 h-8">
                {kpi.spark.slice(-12).map((v: number, j: number) => {
                  const max = Math.max(...kpi.spark, 1);
                  const h = (v / max) * 100;
                  return (
                    <div
                      key={j}
                      className="flex-1 rounded-sm bg-primary/20 group-hover:bg-primary/40 transition-colors"
                      style={{ height: `${Math.max(h, 6)}%` }}
                    />
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </StaggerWrap>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly shipments area chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> {t("d.overview.weeklyTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">{t("d.overview.weeklySub")}</p>
            </div>
          </div>
          {/* Area chart */}
          <div className="relative h-48">
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.52 0.22 27)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="oklch(0.52 0.22 27)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const w = 700, h = 200, n = s.weekly?.length || 7;
                const pts = (s.weekly || []).map((d: any, i: number) => {
                  const x = (i / (n - 1)) * w;
                  const y = h - (d.count / maxWeekly) * (h - 20) - 10;
                  return [x, y];
                });
                const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
                const area = `${line} L ${w} ${h} L 0 ${h} Z`;
                return (
                  <>
                    <path d={area} fill="url(#areaGrad)" />
                    <path d={line} fill="none" stroke="oklch(0.52 0.22 27)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="white" stroke="oklch(0.52 0.22 27)" strokeWidth="2" />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between mt-3 px-1">
            {s.weekly?.map((d: any, i: number) => (
              <span key={i} className="text-xs text-muted-foreground">
                {new Date(d.date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "short" })}
              </span>
            ))}
          </div>
        </Card>

        {/* Donut status */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-1">{t("d.overview.donutTitle")}</h3>
          <p className="text-xs text-muted-foreground mb-5">{t("d.overview.donutSub")}</p>
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-40 h-40">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(${donutSegments.map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`).join(", ")})`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-card flex flex-col items-center justify-center">
                <div className="text-2xl font-black">{totalStatus}</div>
                <div className="text-xs text-muted-foreground">{t("d.overview.total")}</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {statusData.slice(0, 5).map((st, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_CHART_COLORS[st.status] }} />
                  {st.label}
                </span>
                <span className="font-semibold tabular-nums">{st.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue bars + quick stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2"><Banknote className="w-5 h-5 text-emerald-500" /> {t("d.overview.revenueTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("d.overview.revenueSub")}</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-44">
            {s.monthlyRevenue?.map((m: any, i: number) => {
              const h = (m.revenue / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex flex-col justify-end h-full relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-700 group-hover:to-emerald-500 relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatEGP(m.revenue)}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-5">{t("d.overview.quickStatsTitle")}</h3>
          <div className="space-y-3">
            {[
              { icon: Clock, label: t("d.overview.qs.pending"), value: s.counts.pending ?? 0, color: "bg-amber-500/10 text-amber-600" },
              { icon: CheckCircle2, label: t("d.overview.qs.delivered"), value: s.counts.delivered ?? 0, color: "bg-emerald-500/10 text-emerald-600" },
              { icon: Video, label: t("d.overview.qs.videos"), value: s.counts.videos ?? 0, color: "bg-primary/10 text-primary" },
            ].map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center justify-between p-3 rounded-xl ${q.color}`}
              >
                <div className="flex items-center gap-2">
                  <q.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{q.label}</span>
                </div>
                <span className="font-black text-lg tabular-nums">{q.value}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {t("d.overview.recentShipments")}</h3>
            <button onClick={() => setDashboardSection("shipments")} className="text-xs text-primary hover:underline flex items-center gap-1">
              {t("d.overview.viewAll")} <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {s.recentShipments?.slice(0, 6).map((sh: any, i: number) => (
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
            <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {t("d.overview.recentOrders")}</h3>
            <button onClick={() => setDashboardSection("orders")} className="text-xs text-primary hover:underline flex items-center gap-1">
              {t("d.overview.viewAll")} <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {s.recentOrders?.slice(0, 6).map((o: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm tabular-nums">{formatEGP(o.price)}</div>
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
