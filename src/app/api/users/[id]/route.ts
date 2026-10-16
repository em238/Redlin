import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/users/[id] — fetch one user
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
    const { id } = await params;
    const u = await db.user.findUnique({ where: { id }, include: { roleRef: true } });
    if (!u) return jsonError("المستخدم غير موجود", 404);
    return Response.json({
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        roleId: u.roleId,
        roleName: u.roleRef?.name ?? null,
        roleNameAr: u.roleRef?.nameAr ?? null,
        isSystemRole: u.roleRef?.isSystemRole ?? false,
        status: u.status,
        avatar: u.avatar,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      },
    });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// PATCH /api/users/[id] — update user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, roleId, status, avatar, lastLoginAt } = body;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return jsonError("المستخدم غير موجود", 404);

    // Email uniqueness check if changing
    let emailLower: string | undefined;
    if (email && email !== existing.email) {
      emailLower = String(email).toLowerCase().trim();
      const clash = await db.user.findUnique({ where: { email: emailLower } });
      if (clash && clash.id !== id) return jsonError("البريد الإلكتروني مستخدم بالفعل", 400);
    }

    // Resolve role reference if provided
    let roleRef: { id: string; name: string } | null = null;
    if (roleId !== undefined && roleId !== null && roleId !== "") {
      roleRef = await db.role.findUnique({ where: { id: String(roleId) }, select: { id: true, name: true } });
      if (!roleRef) return jsonError("الدور المحدد غير موجود", 400);
    }

    const data: any = {};
    if (name !== undefined) data.name = String(name).trim();
    if (emailLower) data.email = emailLower;
    if (password) data.password = String(password);
    if (status !== undefined) {
      if (!["active", "inactive", "suspended"].includes(status)) {
        return jsonError("قيمة الحالة غير صالحة", 400);
      }
      data.status = status;
    }
    if (avatar !== undefined) data.avatar = avatar || null;
    if (lastLoginAt !== undefined) data.lastLoginAt = lastLoginAt;
    if (roleId !== undefined) {
      data.roleId = roleRef ? roleRef.id : null;
      if (roleRef) data.role = roleRef.name;
    }

    const updated = await db.user.update({ where: { id }, data, include: { roleRef: true } });

    return Response.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        roleId: updated.roleId,
        roleName: updated.roleRef?.name ?? null,
        roleNameAr: updated.roleRef?.nameAr ?? null,
        isSystemRole: updated.roleRef?.isSystemRole ?? false,
        status: updated.status,
        avatar: updated.avatar,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
      },
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

// DELETE /api/users/[id] — delete user (prevent self deletion)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await params;
    if (currentUser.id === id) {
      return jsonError("لا يمكنك حذف حسابك الخاص", 400);
    }
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return jsonError("المستخدم غير موجود", 404);
    await db.user.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
