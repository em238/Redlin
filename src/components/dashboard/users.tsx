"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Pencil, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { useAppStore } from "@/lib/store";
import { useDashboardT } from "@/lib/i18n";

type RoleItem = { id: string; name: string; nameAr: string; isSystemRole: boolean };
type UserItem = { id: string; email: string; name: string; roleId: string | null; roleName: string | null; roleNameAr: string | null; status: string; avatar: string | null; lastLoginAt: string | null };

export function DashboardUsers() {
  const { isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const currentUser = useAppStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "", status: "active", avatar: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiGet<{ users: UserItem[] }>("/api/users"),
  });
  const users = data?.users ?? [];

  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => apiGet<{ roles: RoleItem[] }>("/api/roles"),
  });
  const roles = rolesData?.roles ?? [];

  const openCreate = () => { setEditing(null); setForm({ name: "", email: "", password: "", roleId: "", status: "active", avatar: "" }); setModalOpen(true); };
  const openEdit = (u: UserItem) => { setEditing(u); setForm({ name: u.name, email: u.email, password: "", roleId: u.roleId || "", status: u.status, avatar: u.avatar || "" }); setModalOpen(true); };

  const save = async () => {
    if (!form.name || !form.email) { toast.error(L("الاسم والبريد مطلوبان", "Name and email required")); return; }
    if (!editing && !form.password) { toast.error(L("كلمة المرور مطلوبة", "Password required")); return; }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, roleId: form.roleId || null, status: form.status, avatar: form.avatar || null };
      if (form.password) payload.password = form.password;
      if (editing) { await apiPatch(`/api/users/${editing.id}`, payload); toast.success(L("تم التحديث", "Updated")); }
      else { await apiPost("/api/users", { ...payload, password: form.password }); toast.success(L("تم الإنشاء", "Created")); }
      setModalOpen(false); qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) { toast.error(e.message || L("خطأ", "Error")); } finally { setSaving(false); }
  };

  const remove = async (u: UserItem) => {
    if (currentUser?.id === u.id) { toast.error(L("لا يمكنك حذف حسابك", "Cannot delete yourself")); return; }
    if (!confirm(L("حذف هذا المستخدم؟", "Delete this user?"))) return;
    try { await apiDelete(`/api/users/${u.id}`); toast.success(L("تم الحذف", "Deleted")); qc.invalidateQueries({ queryKey: ["admin-users"] }); } catch (e: any) { toast.error(e.message); }
  };

  const toggleStatus = async (u: UserItem) => {
    if (currentUser?.id === u.id) return;
    try { await apiPatch(`/api/users/${u.id}`, { status: u.status === "active" ? "inactive" : "active" }); qc.invalidateQueries({ queryKey: ["admin-users"] }); } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("إدارة مستخدمي لوحة التحكم", "Dashboard user management")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {L("داخلي", "Internal")}
        </span>
      </div>

      {/* Current admin badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold shrink-0">
          {currentUser?.name?.charAt(0).toUpperCase() || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {currentUser?.name}
            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
              {L("المدير المسؤول", "Admin")}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</div>
        </div>
        <Button onClick={openCreate} size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> {L("مستخدم جديد", "Add User")}
        </Button>
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-slate-400 dark:text-slate-500"><UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />{L("لا يوجد مستخدمون", "No users")}</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{u.name?.charAt(0)?.toUpperCase()}</span>}
              </div>
              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  {u.name}
                  {currentUser?.id === u.id && <Badge variant="outline" className="text-[9px] py-0 h-3.5 bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">{L("أنت", "You")}</Badge>}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">{u.email}</div>
              </div>
              {/* Role badge */}
              <Badge variant="outline" className="hidden sm:flex gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900 shrink-0">
                {isAr ? (u.roleNameAr || u.roleName || L("مدير", "Admin")) : (u.roleName || L("Admin", "Admin"))}
              </Badge>
              {/* Status toggle */}
              <Switch checked={u.status === "active"} onCheckedChange={() => toggleStatus(u)} disabled={currentUser?.id === u.id} className="shrink-0" />
              {/* Actions */}
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400" disabled={currentUser?.id === u.id} onClick={() => remove(u)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
              {editing ? L("تعديل مستخدم", "Edit User") : L("مستخدم جديد", "Add User")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الاسم", "Name")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={L("الاسم الكامل", "Full name")} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("البريد", "Email")}</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{editing ? L("كلمة المرور (اتركها فارغة)", "Password (leave blank)") : L("كلمة المرور", "Password")}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("الدور", "Role")}</Label>
              <Select value={form.roleId || "none"} onValueChange={(v) => setForm({ ...form, roleId: v === "none" ? "" : v })}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{L("مدير افتراضي", "Default Admin")}</SelectItem>
                  {roles.map((r) => <SelectItem key={r.id} value={r.id}>{isAr ? (r.nameAr || r.name) : r.name}{r.isSystemRole && " 🔒"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <FileUpload label={L("الصورة الرمزية", "Avatar")} accept="image/*" currentUrl={form.avatar || null} onUploaded={(url) => setForm({ ...form, avatar: url })} type="image" />
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
