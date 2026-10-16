"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, UserCog, Pencil, Search, ShieldCheck, ShieldOff,
  Ban, CheckCircle2, Mail, Clock, Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

type RoleItem = {
  id: string;
  name: string;
  nameAr: string;
  isSystemRole: boolean;
  userCount: number;
};

type UserItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId: string | null;
  roleName: string | null;
  roleNameAr: string | null;
  isSystemRole: boolean;
  status: "active" | "inactive" | "suspended";
  avatar: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  manager: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  editor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  viewer: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  default: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  status: "active" as "active" | "inactive" | "suspended",
  avatar: "",
};

export function DashboardUsers() {
  const { isAr } = useT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const currentUser = useAppStore((s) => s.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" ||
        (roleFilter === "none" ? !u.roleId : u.roleId === roleFilter);
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "", // empty = keep current
      roleId: u.roleId || "",
      status: u.status,
      avatar: u.avatar || "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.email) {
      toast.error(L("الاسم والبريد مطلوبان", "Name and email are required"));
      return;
    }
    if (!editing && !form.password) {
      toast.error(L("كلمة المرور مطلوبة", "Password is required"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload: any = {
          name: form.name,
          email: form.email,
          roleId: form.roleId || null,
          status: form.status,
          avatar: form.avatar || null,
        };
        if (form.password) payload.password = form.password;
        await apiPatch(`/api/users/${editing.id}`, payload);
        toast.success(L("تم تحديث المستخدم", "User updated"));
      } else {
        await apiPost("/api/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          roleId: form.roleId || null,
          status: form.status,
          avatar: form.avatar || null,
        });
        toast.success(L("تم إنشاء المستخدم", "User created"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: UserItem) => {
    if (currentUser?.id === u.id) {
      toast.error(L("لا يمكنك حذف حسابك الخاص", "You cannot delete your own account"));
      return;
    }
    if (!confirm(L("تأكيد حذف هذا المستخدم؟", "Confirm delete this user?"))) return;
    try {
      await apiDelete(`/api/users/${u.id}`);
      toast.success(L("تم حذف المستخدم", "User deleted"));
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleStatus = async (u: UserItem) => {
    if (currentUser?.id === u.id) {
      toast.error(L("لا يمكنك تعديل حالتك", "You cannot change your own status"));
      return;
    }
    const next = u.status === "active" ? "inactive" : "active";
    try {
      await apiPatch(`/api/users/${u.id}`, { status: next });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const roleBadge = (u: UserItem) => {
    const label = u.roleNameAr || u.roleName || u.role || "—";
    const key = (u.roleName || u.role || "").toLowerCase();
    const cls = ROLE_COLORS[key] || ROLE_COLORS.default;
    return (
      <Badge variant="outline" className={`gap-1 ${cls}`}>
        {u.isSystemRole && <Lock className="w-3 h-3" />}
        {label}
      </Badge>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: any; cls: string; ar: string; en: string }> = {
      active: { icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", ar: "نشط", en: "Active" },
      inactive: { icon: ShieldOff, cls: "bg-slate-500/15 text-slate-300 border-slate-500/30", ar: "غير نشط", en: "Inactive" },
      suspended: { icon: Ban, cls: "bg-rose-500/15 text-rose-300 border-rose-500/30", ar: "موقوف", en: "Suspended" },
    };
    const s = map[status] || map.inactive;
    const Icon = s.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${s.cls}`}>
        <Icon className="w-3 h-3" /> {L(s.ar, s.en)}
      </Badge>
    );
  };

  const lastActive = (u: UserItem) => {
    if (!u.lastLoginAt) return L("لم يسجل دخول", "Never logged in");
    const d = new Date(u.lastLoginAt);
    return d.toLocaleString(isAr ? "ar-EG" : "en-US", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <UserCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("إدارة المستخدمين", "User Management")}</h3>
              <p className="text-sm text-muted-foreground">{L("المستخدمون والصلاحيات والأدوار", "Users, permissions, and roles")}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إضافة مستخدم", "Add User")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { v: users.length, l: L("إجمالي", "Total"), c: "text-primary" },
          { v: users.filter((u) => u.status === "active").length, l: L("نشط", "Active"), c: "text-emerald-500" },
          { v: users.filter((u) => u.status === "suspended").length, l: L("موقوف", "Suspended"), c: "text-rose-500" },
          { v: roles.length, l: L("الأدوار", "Roles"), c: "text-amber-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={L("بحث بالاسم أو البريد...", "Search by name or email...")}
            className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 ps-9 rtl:ps-3 rtl:pe-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-10 w-full md:w-48 bg-slate-950/60 border-slate-700 text-slate-100">
            <SelectValue placeholder={L("كل الأدوار", "All Roles")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("كل الأدوار", "All Roles")}</SelectItem>
            <SelectItem value="none">{L("بدون دور", "No Role")}</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {isAr ? (r.nameAr || r.name) : r.name}
                {r.isSystemRole && " 🔒"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full md:w-40 bg-slate-950/60 border-slate-700 text-slate-100">
            <SelectValue placeholder={L("كل الحالات", "All Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("كل الحالات", "All Status")}</SelectItem>
            <SelectItem value="active">{L("نشط", "Active")}</SelectItem>
            <SelectItem value="inactive">{L("غير نشط", "Inactive")}</SelectItem>
            <SelectItem value="suspended">{L("موقوف", "Suspended")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold text-slate-200">{L("لا يوجد مستخدمون", "No users found")}</p>
          <p className="text-sm text-slate-400 mt-1">{L("جرّب تغيير البحث أو الفلاتر", "Try adjusting filters or search")}</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/80 sticky top-0 z-10">
                <tr className="text-slate-400 text-xs">
                  <th className="text-start font-semibold px-4 py-3">{L("المستخدم", "User")}</th>
                  <th className="text-start font-semibold px-4 py-3">{L("الدور", "Role")}</th>
                  <th className="text-start font-semibold px-4 py-3">{L("الحالة", "Status")}</th>
                  <th className="text-start font-semibold px-4 py-3">{L("آخر نشاط", "Last Active")}</th>
                  <th className="text-end font-semibold px-4 py-3">{L("إجراءات", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-slate-300">{u.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                              {u.name}
                              {currentUser?.id === u.id && (
                                <Badge variant="outline" className="text-[10px] py-0 h-4 bg-primary/15 text-primary border-primary/30">
                                  {L("أنت", "You")}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> <span dir="ltr" className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{roleBadge(u)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={u.status === "active"}
                            onCheckedChange={() => toggleStatus(u)}
                            disabled={currentUser?.id === u.id}
                            title={L("تبديل الحالة", "Toggle status")}
                          />
                          {statusBadge(u.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {lastActive(u)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 bg-slate-800/60 border-slate-700 hover:bg-slate-700 text-slate-200"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="w-3.5 h-3.5" /> {L("تعديل", "Edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-slate-800/60 border-slate-700 hover:bg-rose-600/20 hover:text-rose-300 text-slate-200"
                            disabled={currentUser?.id === u.id}
                            onClick={() => remove(u)}
                            title={currentUser?.id === u.id ? L("لا يمكن حذف حسابك", "Cannot delete your own account") : L("حذف", "Delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editing ? L("تعديل مستخدم", "Edit User") : L("إضافة مستخدم جديد", "Add New User")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("الاسم", "Name")}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={L("الاسم الكامل", "Full name")}
                  className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("البريد الإلكتروني", "Email")}</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">
                {editing ? L("كلمة المرور (اتركها فارغة للإبقاء)", "Password (leave blank to keep)") : L("كلمة المرور", "Password")}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="h-10 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                dir="ltr"
              />
            </div>

            <FileUpload
              label={L("الصورة الرمزية", "Avatar")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              currentUrl={form.avatar || null}
              onUploaded={(url) => setForm({ ...form, avatar: url })}
              type="image"
            />
            <Input
              value={form.avatar || ""}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder={L("أو الصق رابط الصورة", "Or paste avatar URL")}
              className="h-9 text-xs bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
              dir="ltr"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("الدور", "Role")}</Label>
                <Select value={form.roleId || "none"} onValueChange={(v) => setForm({ ...form, roleId: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-10 w-full bg-slate-950/60 border-slate-700 text-slate-100">
                    <SelectValue placeholder={L("اختر دوراً", "Select a role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{L("بدون دور (مدير افتراضي)", "No role (default admin)")}</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {isAr ? (r.nameAr || r.name) : r.name}
                        {r.isSystemRole && " 🔒"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">{L("الحالة", "Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-10 w-full bg-slate-950/60 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{L("نشط", "Active")}</SelectItem>
                    <SelectItem value="inactive">{L("غير نشط", "Inactive")}</SelectItem>
                    <SelectItem value="suspended">{L("موقوف", "Suspended")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save Changes") : L("إنشاء المستخدم", "Create User")}
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
