"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, Clock, CheckCircle2, XCircle, Star as StarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

type Review = {
  id: string;
  name: string;
  role: string;
  company?: string | null;
  content: string;
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
  const { t, isAr } = useT();
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
                      <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-border/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center font-bold text-primary text-lg">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{review.name}</h4>
                          {statusBadge(review.status)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {review.role}{review.company ? ` · ${review.company}` : ""}
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
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 mb-3">{review.content}</p>
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
