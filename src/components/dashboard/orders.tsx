"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingCart, Trash2, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPatch, apiDelete, formatEGP, formatDateTime, STATUS_COLORS } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { useT } from "@/lib/i18n";

const STATUSES = ["pending", "confirmed", "processing", "delivered", "cancelled"];

export function DashboardOrders() {
  const { t } = useT();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => apiGet<any>("/api/orders") });
  const orders = data?.orders ?? [];

  const STATUS_LABELS: Record<string, string> = {
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiPatch(`/api/orders/${id}`, { status });
      toast.success(t("d.orders.toastStatusUpdated"));
      qc.invalidateQueries({ queryKey: ["orders"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm(t("d.orders.confirmDelete"))) return;
    try {
      await apiDelete(`/api/orders/${id}`);
      toast.success(t("d.orders.toastDeleted"));
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-3 opacity-40" />
          <p>{t("d.orders.empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((o: any) => (
            <Card key={o.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[o.status] || ""}`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" /> {o.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {o.governorate} · {o.service}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                  <span className="text-xs text-muted-foreground">{o.weight} {t("d.orders.weightUnit")}</span>
                  <span className="font-black text-lg text-gradient-red">{formatEGP(o.price)}</span>
                </div>
                {o.notes && <p className="text-xs text-muted-foreground italic mt-2 line-clamp-2">{o.notes}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Select defaultValue={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="h-9 flex-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-600" onClick={() => remove(o.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
