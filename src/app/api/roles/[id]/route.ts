import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/roles/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
    const { id } = await params;
    const r = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!r) return jsonError("الدور غير موجود", 404);
    return Response.json({
      role: {
        id: r.id,
        name: r.name,
        nameAr: r.nameAr,
        description: r.description,
        isSystemRole: r.isSystemRole,
        permissions: r.permissions ? JSON.parse(r.permissions) : {},
        userCount: r._count?.users ?? 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      },
    });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// PATCH /api/roles/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, nameAr, description, permissions } = body;

    const existing = await db.role.findUnique({ where: { id } });
    if (!existing) return jsonError("الدور غير موجود", 404);

    const data: any = {};

    // Name (unique)
    if (name !== undefined && name !== existing.name) {
      const newName = String(name).trim();
      if (!newName) return jsonError("اسم الدور مطلوب", 400);
      const clash = await db.role.findUnique({ where: { name: newName } });
      if (clash && clash.id !== id) return jsonError("اسم الدور مستخدم بالفعل", 400);
      data.name = newName;
    }

    if (nameAr !== undefined) data.nameAr = String(nameAr);
    if (description !== undefined) data.description = String(description);

    // Permissions — system roles cannot have empty perms
    if (permissions !== undefined) {
      let perms: Record<string, string[]> = {};
      if (permissions && typeof permissions === "object") {
        for (const [mod, actions] of Object.entries(permissions)) {
          if (Array.isArray(actions)) {
            perms[mod] = actions.filter((a) => typeof a === "string");
          }
        }
      }
      const totalActions = Object.values(perms).reduce((acc, arr) => acc + arr.length, 0);
      if (existing.isSystemRole && totalActions === 0) {
        return jsonError("لا يمكن إزالة جميع الصلاحيات من دور النظام", 400);
      }
      data.permissions = JSON.stringify(perms);
    }

    // Block changing isSystemRole from frontend
    const updated = await db.role.update({ where: { id }, data, include: { _count: { select: { users: true } } } });
    return Response.json({
      role: {
        id: updated.id,
        name: updated.name,
        nameAr: updated.nameAr,
        description: updated.description,
        isSystemRole: updated.isSystemRole,
        permissions: JSON.parse(updated.permissions || "{}"),
        userCount: updated._count?.users ?? 0,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

// DELETE /api/roles/[id] — block deletion of system roles & roles with users
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) return jsonError("الدور غير موجود", 404);
    if (existing.isSystemRole) {
      return jsonError("لا يمكن حذف أدوار النظام", 400);
    }
    if ((existing._count?.users ?? 0) > 0) {
      return jsonError("لا يمكن حذف دور مرتبط بمستخدمين", 400);
    }
    await db.role.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
