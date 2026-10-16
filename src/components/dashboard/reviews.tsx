"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, Clock, CheckCircle2, XCircle, Star as StarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useDashboardT } from "@/lib/i18n";
import { toast } from "sonner";
import { SectionContentEditor } from "@/components/shared/section-content-editor";

type Review = {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  company?: string | null;
  companyAr?: string | null;
  content: string;
  contentAr: string;
  rating: number;
  avatar?: string | null;
  status: string;
  createdAt: string;
};

const TABS = [
  { id: "pending", icon: Clock, color: "text-amber-500" },
  { id: "approved", icon: CheckCircle2, color: "text-emerald-500" },
  { id: "rejected", icon: XCircle, color: "text-rose-500" },
  { id: "all", icon: Star, color: "text-primary" },
] as const;

export function DashboardReviews() {
  const { t, isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: () => apiGet<{ testimonials: Review[] }>(`/api/testimonials?status=${tab}`),
  });

  const reviews = data?.testimonials ?? [];

  // Count badges
  const { data: allData } = useQuery({
    queryKey: ["admin-reviews", "all"],
    queryFn: () => apiGet<{ testimonials: Review[] }>(`/api/testimonials?status=all`),
  });
  const allReviews = allData?.testimonials ?? [];
  const counts = {
    pending: allReviews.filter(r => r.status === "pending").length,
    approved: allReviews.filter(r => r.status === "approved").length,
    rejected: allReviews.filter(r => r.status === "rejected").length,
    all: allReviews.length,
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await apiPatch(`/api/testimonials/${id}`, { status });
      toast.success(status === "approved" ? t("d.reviews.approvedToast") : t("d.reviews.rejectedToast"));
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["site-testimonials"] });
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await apiDelete(`/api/testimonials/${id}`);
      toast.success(t("d.reviews.deletedToast"));
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["site-testimonials"] });
    } catch (e: any) {
      toast.error(e.message || "Error");
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      rejected: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    };
    const labels: Record<string, string> = {
      pending: isAr ? "قيد الانتظار" : "Pending",
      approved: isAr ? "معتمدة" : "Approved",
      rejected: isAr ? "مرفوضة" : "Rejected",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionContentEditor section="testimonials" />
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("قسم آراء العملاء", "Customer Reviews section")}
        </span>
        <a href="/#home" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">{t("d.reviews.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("d.reviews.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.id;
          const count = counts[tabItem.id as keyof typeof counts];
          const label = t(`d.reviews.${tabItem.id}`);
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : tabItem.color}`} />
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-20 bg-muted/50 rounded" />
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t("d.reviews.empty")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-5 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {review.avatar ? (
                      <img src={review.avatar} alt={isAr ? (review.nameAr || review.name) : review.name} className="w-12 h-12 rounded-full object-cover border-2 border-border/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center font-bold text-primary text-lg">
                        {(isAr ? (review.nameAr || review.name) : review.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm" dir={isAr && review.nameAr ? "rtl" : "ltr"}>
                            {isAr && review.nameAr ? review.nameAr : review.name}
                          </h4>
                          {/* Bilingual badges if AR variant exists */}
                          {review.nameAr && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                          )}
                          {review.nameAr && review.name && (
                            <span className="text-[10px] text-muted-foreground" dir="ltr">{review.name}</span>
                          )}
                          {statusBadge(review.status)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5" dir={isAr && review.roleAr ? "rtl" : "ltr"}>
                          {isAr && review.roleAr ? review.roleAr : review.role}
                          {((isAr && review.companyAr) ? ` · ${review.companyAr}` : (review.company ? ` · ${review.company}` : ""))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map(star => (
                          <StarIcon
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Show both AR + EN content if AR exists; otherwise just EN */}
                    {review.contentAr && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-1 flex items-start gap-1.5" dir="rtl">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">AR</span>
                        <span>{review.contentAr}</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-3 flex items-start gap-1.5" dir="ltr">
                      {review.contentAr && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0 mt-0.5">EN</span>
                      )}
                      <span>{review.content}</span>
                    </p>
                    <div className="text-[11px] text-muted-foreground/60">
                      {new Date(review.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                      {review.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(review.id, "approved")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t("d.reviews.approve")}
                        </button>
                      )}
                      {review.status !== "rejected" && (
                        <button
                          onClick={() => updateStatus(review.id, "rejected")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t("d.reviews.reject")}
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/40 transition-colors ms-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("d.reviews.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
