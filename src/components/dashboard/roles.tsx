"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, ShieldCheck, Pencil, Lock, Users as UsersIcon,
  KeyRound, Crown, CheckCheck, ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

type PermissionMap = Record<string, string[]>;

type RoleItem = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  isSystemRole: boolean;
  permissions: PermissionMap;
  userCount: number;
  createdAt: string;
};

const MODULES: { key: string; ar: string; en: string; actions: string[]; icon: any }[] = [
  { key: "hero", ar: "البانر الرئيسي", en: "Hero Banner", actions: ["read", "edit"], icon: Crown },
  { key: "about", ar: "من نحن", en: "About", actions: ["read", "edit"], icon: UsersIcon },
  { key: "services", ar: "الخدمات", en: "Services", actions: ["create", "read", "edit", "delete"], icon: ShieldCheck },
  { key: "how-it-works", ar: "كيف نعمل", en: "How It Works", actions: ["read", "edit"], icon: ShieldCheck },
  { key: "videos", ar: "المعرض", en: "Videos", actions: ["create", "read", "edit", "delete"], icon: ShieldCheck },
  { key: "partners", ar: "الشركاء", en: "Partners", actions: ["create", "read", "edit", "delete"], icon: ShieldCheck },
  { key: "map", ar: "الخريطة", en: "Map", actions: ["read", "edit"], icon: ShieldCheck },
  { key: "contact", ar: "تواصل", en: "Contact", actions: ["read", "edit"], icon: ShieldCheck },
  { key: "reviews", ar: "التقييمات", en: "Reviews", actions: ["read", "approve", "reject", "delete"], icon: ShieldCheck },
  { key: "users", ar: "المستخدمون", en: "Users", actions: ["create", "read", "edit", "delete"], icon: UsersIcon },
  { key: "roles", ar: "الأدوار", en: "Roles", actions: ["create", "read", "edit", "delete"], icon: KeyRound },
];

const ACTION_LABELS: Record<string, { ar: string; en: string }> = {
  create: { ar: "إنشاء", en: "Create" },
  read: { ar: "قراءة", en: "Read" },
  edit: { ar: "تعديل", en: "Edit" },
  delete: { ar: "حذف", en: "Delete" },
  approve: { ar: "موافقة", en: "Approve" },
  reject: { ar: "رفض", en: "Reject" },
};

const emptyForm = {
  name: "",
  nameAr: "",
  description: "",
  permissions: {} as PermissionMap,
};

export function DashboardRoles() {
  const { isAr } = useT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => apiGet<{ roles: RoleItem[] }>("/api/roles"),
  });
  const roles = data?.roles ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, permissions: {} });
    setModalOpen(true);
  };

  const openEdit = (r: RoleItem) => {
    setEditing(r);
    setForm({
      name: r.name,
      nameAr: r.nameAr,
      description: r.description,
      permissions: { ...(r.permissions || {}) },
    });
    setModalOpen(true);
  };

  const toggleAction = (moduleKey: string, action: string) => {
    setForm((prev: any) => {
      const perms = { ...(prev.permissions || {}) };
      const current = new Set(perms[moduleKey] || []);
      if (current.has(action)) current.delete(action);
      else current.add(action);
      const arr = Array.from(current);
      if (arr.length === 0) delete perms[moduleKey];
      else perms[moduleKey] = arr;
      return { ...prev, permissions: perms };
    });
  };

  const toggleModuleAll = (moduleKey: string, allActions: string[]) => {
    setForm((prev: any) => {
      const perms = { ...(prev.permissions || {}) };
      const current = new Set(perms[moduleKey] || []);
      const hasAll = allActions.every((a) => current.has(a));
      if (hasAll) delete perms[moduleKey];
      else perms[moduleKey] = [...allActions];
      return { ...prev, permissions: perms };
    });
  };

  const selectAllPermissions = () => {
    setForm((prev: any) => {
      const perms: PermissionMap = {};
      for (const m of MODULES) perms[m.key] = [...m.actions];
      return { ...prev, permissions: perms };
    });
  };

  const clearAllPermissions = () => {
    if (editing?.isSystemRole) {
      toast.error(L("لا يمكن إزالة جميع الصلاحيات من دور النظام", "Cannot clear all permissions for system role"));
      return;
    }
    setForm((prev: any) => ({ ...prev, permissions: {} }));
  };

  const save = async () => {
    if (!form.name) {
      toast.error(L("اسم الدور مطلوب", "Role name is required"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPatch(`/api/roles/${editing.id}`, {
          name: form.name,
          nameAr: form.nameAr,
          description: form.description,
          permissions: form.permissions,
        });
        toast.success(L("تم تحديث الدور", "Role updated"));
      } else {
        await apiPost("/api/roles", {
          name: form.name,
          nameAr: form.nameAr,
          description: form.description,
          permissions: form.permissions,
        });
        toast.success(L("تم إنشاء الدور", "Role created"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: RoleItem) => {
    if (r.isSystemRole) {
      toast.error(L("لا يمكن حذف أدوار النظام", "Cannot delete system roles"));
      return;
    }
    if (r.userCount > 0) {
      toast.error(L(`لا يمكن الحذف — ${r.userCount} مستخدم مرتبط`, `Cannot delete — ${r.userCount} users assigned`));
      return;
    }
    if (!confirm(L("تأكيد حذف هذا الدور؟", "Confirm delete this role?"))) return;
    try {
      await apiDelete(`/api/roles/${r.id}`);
      toast.success(L("تم حذف الدور", "Role deleted"));
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const permSummary = (perms: PermissionMap) => {
    const modules = Object.keys(perms).filter((k) => (perms[k]?.length ?? 0) > 0).length;
    const total = Object.values(perms).reduce((a, arr) => a + (arr?.length ?? 0), 0);
    return { modules, total };
  };

  const totalActions = useMemo(() => MODULES.reduce((a, m) => a + m.actions.length, 0), []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("الأدوار والصلاحيات", "Roles & Permissions")}</h3>
              <p className="text-sm text-muted-foreground">{L("إدارة الأدوار وتحديد الصلاحيات لكل وحدة", "Manage roles and module-level permissions")}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إنشاء دور", "Create Role")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { v: roles.length, l: L("إجمالي الأدوار", "Total Roles"), c: "text-primary" },
          { v: roles.filter((r) => r.isSystemRole).length, l: L("أدوار النظام", "System Roles"), c: "text-amber-500" },
          { v: roles.reduce((a, r) => a + r.userCount, 0), l: L("إجمالي التعيينات", "Total Assignments"), c: "text-emerald-500" },
          { v: MODULES.length, l: L("الوحدات", "Modules"), c: "text-sky-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : roles.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <KeyRound className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold text-slate-200">{L("لا يوجد أدوار", "No roles found")}</p>
          <p className="text-sm text-slate-400 mt-1">{L("أنشئ أول دور لتبدأ", "Create your first role to get started")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {roles.map((r, i) => {
              const summary = permSummary(r.permissions);
              const Icon = r.isSystemRole ? Lock : KeyRound;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="p-5 h-full flex flex-col gap-3 bg-slate-900/60 border-slate-800 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.isSystemRole ? "bg-amber-500/15" : "bg-primary/15"}`}>
                          <Icon className={`w-5 h-5 ${r.isSystemRole ? "text-amber-400" : "text-primary"}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 truncate flex items-center gap-1.5">
                            {isAr ? (r.nameAr || r.name) : r.name}
                            {r.isSystemRole && (
                              <Badge variant="outline" className="text-[10px] py-0 h-4 bg-amber-500/15 text-amber-300 border-amber-500/30 gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> {L("نظام", "System")}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate" dir="ltr">{r.name}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 gap-1 shrink-0">
                        <UsersIcon className="w-3 h-3" /> {r.userCount}
                      </Badge>
                    </div>

                    {r.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">{r.description}</p>
                    )}

                    {/* Permissions summary */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{L("الصلاحيات", "Permissions")}</span>
                        <span className="text-slate-300 font-mono">
                          {summary.modules}/{MODULES.length} {L("وحدات", "modules")} • {summary.total}/{totalActions} {L("صلاحية", "actions")}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-red-600 rounded-full transition-all"
                          style={{ width: `${totalActions ? (summary.total / totalActions) * 100 : 0}%` }}
                        />
                      </div>
                      {summary.modules > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Object.keys(r.permissions).filter((k) => (r.permissions[k]?.length ?? 0) > 0).slice(0, 4).map((m) => {
                            const mod = MODULES.find((x) => x.key === m);
                            if (!mod) return null;
                            return (
                              <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {isAr ? mod.ar : mod.en}
                              </span>
                            );
                          })}
                          {summary.modules > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              +{summary.modules - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 mt-auto pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 gap-1 bg-slate-800/60 border-slate-700 hover:bg-slate-700 text-slate-200"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="w-3.5 h-3.5" /> {L("تعديل", "Edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-slate-800/60 border-slate-700 hover:bg-rose-600/20 hover:text-rose-300 text-slate-200"
                        disabled={r.isSystemRole || r.userCount > 0}
                        onClick={() => remove(r)}
                        title={
                          r.isSystemRole
                            ? L("لا يمكن حذف أدوار النظام", "Cannot delete system role")
                            : r.userCount > 0
                            ? L(`مرتبط بـ ${r.userCount} مستخدم`, `Assigned to ${r.userCount} users`)
                            : L("حذف", "Delete")
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <KeyRound className="w-5 h-5 text-primary" />
              {editing ? L("تعديل دور", "Edit Role") : L("إنشاء دور جديد", "Create New Role")}
              {editing?.isSystemRole && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 gap-1">
                  <Lock className="w-3 h-3" /> {L("دور نظام", "System Role")}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("الاسم (إنجليزي)", "Name (English)")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="manager"
                  className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("الاسم (عربي)", "Name (Arabic)")}</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  placeholder="مدير"
                  className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">{L("الوصف", "Description")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={L("وصف مختصر لمسؤوليات هذا الدور...", "Brief description of this role's responsibilities...")}
                className="bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[60px]"
                rows={2}
              />
            </div>

            {/* Permission matrix */}
            <div className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{L("مصفوفة الصلاحيات", "Permission Matrix")}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800" onClick={selectAllPermissions}>
                    <CheckCheck className="w-3.5 h-3.5" /> {L("تحديد الكل", "Select All")}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800" onClick={clearAllPermissions}>
                    {L("مسح الكل", "Clear All")}
                  </Button>
                </div>
              </div>

              <Accordion type="multiple" className="px-2">
                {MODULES.map((m) => {
                  const selected = form.permissions?.[m.key] || [];
                  const allSelected = m.actions.every((a) => selected.includes(a));
                  const Icon = m.icon;
                  return (
                    <AccordionItem key={m.key} value={m.key} className="border-slate-800">
                      <AccordionTrigger className="hover:bg-slate-800/40 px-2 no-underline">
                        <div className="flex items-center gap-2.5 w-full">
                          <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                          <div className="flex-1 text-start">
                            <div className="text-sm font-semibold text-slate-100">{isAr ? m.ar : m.en}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.key}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-slate-800 text-slate-300 border-slate-700">
                            {selected.length}/{m.actions.length}
                          </Badge>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleModuleAll(m.key, m.actions); }}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                              allSelected
                                ? "bg-primary/15 text-primary border-primary/30"
                                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            {allSelected ? L("إلغاء الكل", "Unselect All") : L("تحديد الكل", "Select All")}
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {m.actions.map((a) => {
                            const checked = selected.includes(a);
                            const lbl = ACTION_LABELS[a] || { ar: a, en: a };
                            return (
                              <label
                                key={a}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer transition-colors ${
                                  checked
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/40"
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => toggleAction(m.key, a)}
                                  className="border-slate-600"
                                />
                                <span className="text-xs text-slate-200">{isAr ? lbl.ar : lbl.en}</span>
                                <span className="text-[10px] text-slate-500 font-mono ms-auto">{a}</span>
                              </label>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save Changes") : L("إنشاء الدور", "Create Role")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                {L("إلغاء", "Cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
