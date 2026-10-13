"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Loader2, Pencil, Trash2, X, Package, Filter,
  Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckSquare, Square, Phone, MapPin, Scale, Tag, Calendar, Clock, User, Banknote
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerShipment, setDrawerShipment] = useState<any>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
  const allShipments = data?.shipments ?? [];

  // Pagination
  const totalPages = Math.max(1, Math.ceil(allShipments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedShipments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allShipments.slice(start, start + pageSize);
  }, [allShipments, currentPage, pageSize]);

  const allSelected = pagedShipments.length > 0 && pagedShipments.every((s: any) => selected.has(s.id));

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) pagedShipments.forEach((s: any) => next.delete(s.id));
    else pagedShipments.forEach((s: any) => next.add(s.id));
    setSelected(next);
  };

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

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`حذف ${selected.size} شحنة؟`)) return;
    let ok = 0;
    for (const id of selected) {
      try { await apiDelete(`/api/shipments/${id}`); ok++; } catch {}
    }
    toast.success(`تم حذف ${ok} شحنة`);
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["shipments"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
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

  const exportCSV = () => {
    const headers = ["trackingNo", "receiverName", "receiverPhone", "governorate", "service", "weight", "price", "status", "createdAt"];
    const rows = allShipments.map((s: any) => headers.map((h) => `"${String(s[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redline-shipments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الشحنات إلى CSV");
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="بحث برقم التتبع أو الاسم أو الهاتف..." className="h-10 pr-9" />
          </div>
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-10 w-full sm:w-44"><Filter className="w-4 h-4 ml-2" /><SelectValue placeholder="كل الحالات" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} className="h-10 gap-2">
            <Download className="w-4 h-4" /> تصدير CSV
          </Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 h-10">
            <Plus className="w-4 h-4" /> شحنة جديدة
          </Button>
        </div>
        {/* Bulk actions bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                <span className="text-sm font-semibold">تم اختيار {selected.size} شحنة</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setSelected(new Set())}>إلغاء</Button>
                  <Button variant="outline" size="sm" className="h-8 text-rose-600" onClick={bulkDelete}>
                    <Trash2 className="w-3.5 h-3.5" /> حذف المحدد
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : pagedShipments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-40" />
            <p>لا توجد شحنات مطابقة</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-right">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleAll} className="flex items-center">
                        {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">رقم التتبع</th>
                    <th className="px-4 py-3 font-semibold">المستلم</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">المحافظة</th>
                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">الخدمة</th>
                    <th className="px-4 py-3 font-semibold">السعر</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                    <th className="px-4 py-3 font-semibold text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedShipments.map((sh: any) => (
                    <tr key={sh.id} className={`border-t border-border hover:bg-muted/30 transition-colors ${selected.has(sh.id) ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(sh.id)}>
                          {selected.has(sh.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerShipment(sh)} className="font-mono font-bold text-primary hover:underline">
                          {sh.trackingNo}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{sh.receiverName}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{sh.receiverPhone}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">{sh.governorate}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{sh.service}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{formatEGP(sh.price)}</td>
                      <td className="px-4 py-3">
                        <Select defaultValue={sh.status} onValueChange={(v) => quickStatus(sh, v)}>
                          <SelectTrigger className="h-8 w-36 text-xs border-0 hover:bg-muted">
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
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDrawerShipment(sh)} title="عرض">
                            <Search className="w-4 h-4" />
                          </Button>
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>عرض</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[8, 12, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span>من {allShipments.length} شحنة</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setPage(1)}>
                  <ChevronsRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm font-medium">صفحة {currentPage} من {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
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
                <Input value={form.senderPhone} onChange={(e) => setForm({ ...form, senderPhone: e.target.value })} className="h-10" dir="ltr" />
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
                <Input value={form.receiverPhone} onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })} className="h-10" dir="ltr" />
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

      {/* Detail Drawer */}
      <AnimatePresence>
        {drawerShipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerShipment(null)}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex justify-start"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md h-full bg-card shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-l from-primary to-red-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-white/80">رقم التتبع</div>
                    <div className="text-2xl font-black font-mono" dir="ltr">{drawerShipment.trackingNo}</div>
                  </div>
                  <button onClick={() => setDrawerShipment(null)} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-slow-pulse" />
                  {STATUS_LABELS[drawerShipment.status] || drawerShipment.status}
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> المستلم</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {drawerShipment.receiverName}</div>
                    <div className="flex items-center gap-2" dir="ltr"><Phone className="w-4 h-4 text-primary" /> {drawerShipment.receiverPhone}</div>
                    {drawerShipment.receiverAddress && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary mt-0.5" /> <span>{drawerShipment.receiverAddress}</span></div>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> المرسل</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {drawerShipment.senderName}</div>
                    <div className="flex items-center gap-2" dir="ltr"><Phone className="w-4 h-4 text-primary" /> {drawerShipment.senderPhone}</div>
                    {drawerShipment.senderAddress && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary mt-0.5" /> <span>{drawerShipment.senderAddress}</span></div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <MapPin className="w-4 h-4 text-primary mb-1" />
                    <div className="text-xs text-muted-foreground">المحافظة</div>
                    <div className="font-bold text-sm">{drawerShipment.governorate}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Tag className="w-4 h-4 text-primary mb-1" />
                    <div className="text-xs text-muted-foreground">الخدمة</div>
                    <div className="font-bold text-sm">{drawerShipment.service}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Scale className="w-4 h-4 text-primary mb-1" />
                    <div className="text-xs text-muted-foreground">الوزن</div>
                    <div className="font-bold text-sm tabular-nums">{drawerShipment.weight} كجم</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Banknote className="w-4 h-4 text-primary mb-1" />
                    <div className="text-xs text-muted-foreground">السعر</div>
                    <div className="font-bold text-sm tabular-nums">{formatEGP(drawerShipment.price)}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="font-semibold">{formatDateTime(drawerShipment.createdAt)}</span>
                </div>
                {drawerShipment.notes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">ملاحظات</div>
                    <p className="text-sm">{drawerShipment.notes}</p>
                  </div>
                )}

                {/* Timeline */}
                {(() => {
                  let history: any[] = [];
                  try { history = drawerShipment.history ? JSON.parse(drawerShipment.history) : []; } catch {}
                  if (history.length === 0) return null;
                  return (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> سجل الحالة</h4>
                      <div className="relative pr-6 space-y-4">
                        <div className="absolute right-3 top-2 bottom-2 w-0.5 bg-border" />
                        {history.map((h, i) => (
                          <div key={i} className="relative">
                            <div className={`absolute right-0 -mr-6 w-4 h-4 rounded-full border-2 ${i === history.length - 1 ? "bg-primary border-primary" : "bg-background border-border"}`} />
                            <div className="font-semibold text-sm">{STATUS_LABELS[h.status] || h.status}</div>
                            {h.note && <div className="text-xs text-muted-foreground mt-0.5">{h.note}</div>}
                            <div className="text-xs text-muted-foreground mt-0.5">{formatDateTime(h.at)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => { setDrawerShipment(null); openEdit(drawerShipment); }} className="flex-1 gap-2">
                    <Pencil className="w-4 h-4" /> تعديل
                  </Button>
                  <Button variant="outline" onClick={() => setDrawerShipment(null)}>إغلاق</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
