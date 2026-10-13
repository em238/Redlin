"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Loader2, Pencil, Trash2, X, Package, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete, formatEGP, formatDateTime, STATUS_LABELS, STATUS_COLORS } from "@/lib/api";
import { toast } from "sonner";

const STATUSES = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"];

export function DashboardShipments() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    senderName: "", senderPhone: "", senderAddress: "",
    receiverName: "", receiverPhone: "", receiverAddress: "",
    governorate: "", service: "Standard", weight: 1, notes: "", price: 0, status: "pending",
  });

  const { data: govData } = useQuery({ queryKey: ["governorates"], queryFn: () => apiGet<any>("/api/governorates") });
  const { data: svcData } = useQuery({ queryKey: ["services"], queryFn: () => apiGet<any>("/api/services") });
  const { data, isLoading } = useQuery({
    queryKey: ["shipments", q, status],
    queryFn: () => apiGet<any>(`/api/shipments?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`),
  });
  const shipments = data?.shipments ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ senderName: "Redline Warehouse", senderPhone: "019000", senderAddress: "5th Settlement, New Cairo",
      receiverName: "", receiverPhone: "", receiverAddress: "", governorate: govData?.governorates?.[0]?.name || "Cairo",
      service: "Standard", weight: 1, notes: "", price: 0, status: "pending" });
    setModalOpen(true);
  };

  const openEdit = (sh: any) => {
    setEditing(sh);
    setForm({ ...sh });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiPatch(`/api/shipments/${editing.id}`, form);
        toast.success("تم تحديث الشحنة");
      } else {
        await apiPost("/api/shipments", form);
        toast.success("تم إنشاء الشحنة");
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message || "خطأ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشحنة؟")) return;
    try {
      await apiDelete(`/api/shipments/${id}`);
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const quickStatus = async (sh: any, newStatus: string) => {
    try {
      await apiPatch(`/api/shipments/${sh.id}`, { status: newStatus, note: "تحديث سريع من اللوحة" });
      toast.success("تم تحديث الحالة");
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث برقم التتبع أو الاسم أو الهاتف..." className="h-10 pr-9" />
        </div>
        <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="h-10 w-full sm:w-44"><Filter className="w-4 h-4 ml-2" /><SelectValue placeholder="كل الحالات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 h-10">
          <Plus className="w-4 h-4" /> شحنة جديدة
        </Button>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-40" />
            <p>لا توجد شحنات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 sticky top-0 z-10">
                <tr className="text-right">
                  <th className="px-4 py-3 font-semibold">رقم التتبع</th>
                  <th className="px-4 py-3 font-semibold">المستلم</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">المحافظة</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">الخدمة</th>
                  <th className="px-4 py-3 font-semibold">السعر</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold hidden xl:table-cell">التاريخ</th>
                  <th className="px-4 py-3 font-semibold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((sh: any) => (
                  <tr key={sh.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{sh.trackingNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{sh.receiverName}</div>
                      <div className="text-xs text-muted-foreground">{sh.receiverPhone}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{sh.governorate}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{sh.service}</td>
                    <td className="px-4 py-3 font-semibold">{formatEGP(sh.price)}</td>
                    <td className="px-4 py-3">
                      <Select defaultValue={sh.status} onValueChange={(v) => quickStatus(sh, v)}>
                        <SelectTrigger className="h-8 w-36 text-xs border-0">
                          <SelectValue>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[sh.status] || ""}`}>
                              {STATUS_LABELS[sh.status] || sh.status}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{formatDateTime(sh.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(sh)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => remove(sh.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {editing ? "تعديل الشحنة" : "شحنة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">اسم المرسل</Label>
                <Input value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">هاتف المرسل</Label>
                <Input value={form.senderPhone} onChange={(e) => setForm({ ...form, senderPhone: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">عنوان المرسل</Label>
                <Input value={form.senderAddress} onChange={(e) => setForm({ ...form, senderAddress: e.target.value })} className="h-10" />
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">اسم المستلم *</Label>
                <Input value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">هاتف المستلم *</Label>
                <Input value={form.receiverPhone} onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">عنوان المستلم</Label>
                <Input value={form.receiverAddress} onChange={(e) => setForm({ ...form, receiverAddress: e.target.value })} className="h-10" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">المحافظة *</Label>
                <Select value={form.governorate} onValueChange={(v) => setForm({ ...form, governorate: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {govData?.governorates?.map((g: any) => <SelectItem key={g.name} value={g.name}>{g.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الخدمة *</Label>
                <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {svcData?.services?.map((s: any) => <SelectItem key={s.name} value={s.name}>{s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الوزن (كجم)</Label>
                <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">السعر (ج.م)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-10" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? "حفظ التعديلات" : "إنشاء الشحنة"}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
