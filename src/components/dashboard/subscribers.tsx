"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiDelete } from "@/lib/api";
import { useDashboardT } from "@/lib/i18n";

type Subscriber = { id: string; email: string; createdAt: string };

export function DashboardSubscribers() {
  const { isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["subscribers-admin"],
    queryFn: () => apiGet<{ items: Subscriber[] }>("/api/subscribers"),
  });
  const items = data?.items ?? [];

  const remove = async (id: string) => {
    if (!confirm(L("حذف هذا المشترك؟", "Delete this subscriber?"))) return;
    try {
      await apiDelete(`/api/subscribers?id=${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      qc.invalidateQueries({ queryKey: ["subscribers-admin"] });
    } catch (e: any) {
      toast.error(e?.message || L("خطأ", "Error"));
    }
  };

  const exportCsv = () => {
    const rows = ["email,createdAt", ...items.map((s) => `${s.email},${s.createdAt}`)];
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-bold">{L("مشتركو النشرة البريدية", "Newsletter subscribers")}</h4>
              <p className="text-xs text-muted-foreground">
                {L(`الإجمالي: ${items.length}`, `Total: ${items.length}`)}
              </p>
            </div>
          </div>
          <Button onClick={exportCsv} disabled={items.length === 0} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> {L("تصدير CSV", "Export CSV")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
            {L("لا يوجد مشتركون بعد", "No subscribers yet")}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" dir="ltr">{s.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString(isAr ? "ar-EG" : "en-GB")}
                  </div>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 shrink-0" onClick={() => remove(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}