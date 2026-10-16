"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Pencil, ShieldCheck, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

type RoleItem = { id: string; name: string; nameAr: string; description: string; descriptionAr: string; descriptionEn: string; isSystemRole: boolean; permissions: string; userCount: number };

const MODULES = [
  { key: "hero", labelAr: "الهيرو", labelEn: "Hero", actions: ["read", "edit"] },
  { key: "about", labelAr: "من نحن", labelEn: "About", actions: ["read", "edit"] },
  { key: "services", labelAr: "الخدمات", labelEn: "Services", actions: ["create", "read", "edit", "delete"] },
  { key: "how-it-works", labelAr: "كيف نعمل", labelEn: "How It Works", actions: ["read", "edit"] },
  { key: "videos", labelAr: "الفيديوهات", labelEn: "Videos", actions: ["create", "read", "edit", "delete"] },
  { key: "partners", labelAr: "الشركاء", labelEn: "Partners", actions: ["create", "read", "edit", "delete"] },
  { key: "map", labelAr: "الخريطة", labelEn: "Map", actions: ["read", "edit"] },
  { key: "contact", labelAr: "التواصل", labelEn: "Contact", actions: ["read", "edit"] },
  { key: "reviews", labelAr: "الآراء", labelEn: "Reviews", actions: ["read", "approve", "reject", "delete"] },
  { key: "users", labelAr: "المستخدمون", labelEn: "Users", actions: ["create", "read", "edit", "delete"] },
  { key: "roles", labelAr: "الأدوار", labelEn: "Roles", actions: ["create", "read", "edit", "delete"] },
];

export function DashboardRoles() {
  const { isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", nameAr: "", description: "", descriptionAr: "", descriptionEn: "", permissions: {} as Record<string, string[]> });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => apiGet<{ roles: RoleItem[] }>("/api/roles"),
  });
  const roles = data?.roles ?? [];

  const openCreate = () => { setEditing(null); setForm({ name: "", nameAr: "", description: "", descriptionAr: "", descriptionEn: "", permissions: {} }); setModalOpen(true); };
  const openEdit = (r: RoleItem) => {
    setEditing(r);
    let perms = {};
    try { perms = JSON.parse(r.permissions || "{}"); } catch {}
    setForm({ name: r.name, nameAr: r.nameAr, description: r.description, descriptionAr: r.descriptionAr || "", descriptionEn: r.descriptionEn || "", permissions: perms });
    setModalOpen(true);
  };

  const togglePerm = (module: string, action: string) => {
    const current = form.permissions[module] || [];
    const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
    setForm({ ...form, permissions: { ...form.permissions, [module]: next } });
  };

  const toggleAllModule = (module: string, actions: string[]) => {
    const current = form.permissions[module] || [];
    const allSelected = actions.every((a) => current.includes(a));
    if (allSelected) {
      const { [module]: _, ...rest } = form.permissions;
      setForm({ ...form, permissions: rest });
    } else {
      setForm({ ...form, permissions: { ...form.permissions, [module]: actions } });
    }
  };

  const save = async () => {
    if (!form.name) { toast.error(L("الاسم مطلوب", "Name required")); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        description: form.description,
        descriptionAr: form.descriptionAr || "",
        descriptionEn: form.descriptionEn || "",
        permissions: JSON.stringify(form.permissions),
      };
      if (editing) { await apiPatch(`/api/roles/${editing.id}`, payload); toast.success(L("تم التحديث", "Updated")); }
      else { await apiPost("/api/roles", payload); toast.success(L("تم الإنشاء", "Created")); }
      setModalOpen(false); qc.invalidateQueries({ queryKey: ["admin-roles"] });
    } catch (e: any) { toast.error(e.message || L("خطأ", "Error")); } finally { setSaving(false); }
  };

  const remove = async (r: RoleItem) => {
    if (r.isSystemRole) { toast.error(L("لا يمكن حذف دور نظام", "Cannot delete system role")); return; }
    if (r.userCount > 0) { toast.error(L("لا يمكن حذف دور به مستخدمون", "Cannot delete role with users")); return; }
    if (!confirm(L("حذف هذا الدور؟", "Delete this role?"))) return;
    try { await apiDelete(`/api/roles/${r.id}`); toast.success(L("تم الحذف", "Deleted")); qc.invalidateQueries({ queryKey: ["admin-roles"] }); } catch (e: any) { toast.error(e.message); }
  };

  const permCount = (permsStr: string) => {
    try { const p = JSON.parse(permsStr || "{}"); return Object.values(p).flat().length; } catch { return 0; }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">{L("الأدوار والصلاحيات", "Roles & Permissions")}</span>
        </div>
        <Button onClick={openCreate} size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> {L("دور جديد", "Add Role")}
        </Button>
      </div>

      {/* Roles list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${r.isSystemRole ? "bg-amber-50 dark:bg-amber-950/50" : "bg-slate-100 dark:bg-slate-800"}`}>
                  {r.isSystemRole ? <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {isAr ? (r.nameAr || r.name) : r.name}
                    {r.isSystemRole && <Badge variant="outline" className="text-[9px] py-0 h-3.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900 gap-0.5"><Lock className="w-2.5 h-2.5" />{L("نظام", "System")}</Badge>}
                  </div>
                  {(isAr ? (r.descriptionAr || r.description) : (r.descriptionEn || r.description)) ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {isAr ? (r.descriptionAr || r.description) : (r.descriptionEn || r.description)}
                    </div>
                  ) : r.description ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{r.description}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">{r.userCount} {L("مستخدم", "users")}</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{permCount(r.permissions)} {L("صلاحية", "perms")}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400" disabled={r.isSystemRole || r.userCount > 0} onClick={() => remove(r)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
              {editing ? L("تعديل دور", "Edit Role") : L("دور جديد", "Add Role")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الاسم (EN)", "Name (EN)")}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Content Manager" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الاسم (AR)", "Name (AR)")}</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="مدير محتوى" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" dir="rtl" />
              </div>
            </div>

            {/* Bilingual description AR | EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Description (Arabic)")}
                </Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={2}
                  dir="rtl"
                  placeholder={L("مدير محتوى بمسؤولية كاملة", "Content manager with full responsibility")}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Description (English)")}
                </Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  rows={2}
                  dir="ltr"
                  placeholder="Content manager with full responsibility"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Legacy description */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الوصف الافتراضي (احتياطي)", "Legacy description (fallback)")}</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={1} className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الصلاحيات", "Permissions")}</Label>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {MODULES.map((m) => {
                  const current = form.permissions[m.key] || [];
                  const allSelected = m.actions.every((a) => current.includes(a));
                  return (
                    <div key={m.key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{isAr ? m.labelAr : m.labelEn}</span>
                        <button onClick={() => toggleAllModule(m.key, m.actions)} className="text-[10px] text-red-600 dark:text-red-400 hover:underline">
                          {allSelected ? L("إلغاء الكل", "Clear All") : L("تحديد الكل", "Select All")}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.actions.map((a) => {
                          const checked = current.includes(a);
                          return (
                            <button
                              key={a}
                              onClick={() => togglePerm(m.key, a)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                                checked
                                  ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900"
                                  : "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                              }`}
                            >
                              {a}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ", "Save") : L("إنشاء", "Create")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
