import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/users — list all users with their role
export async function GET() {
  try {
    try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
    const users = await db.user.findMany({
      include: { roleRef: true },
      orderBy: { createdAt: "desc" },
    });
    const safe = users.map((u) => ({
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
      updatedAt: u.updatedAt,
    }));
    return Response.json({ users: safe });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/users — create new user
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, email, password, roleId, status, avatar } = body;

    if (!name || !email || !password) {
      return jsonError("الاسم والبريد وكلمة المرور مطلوبة", 400);
    }
    const emailLower = String(email).toLowerCase().trim();

    // Check for existing email
    const existing = await db.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return jsonError("البريد الإلكتروني مستخدم بالفعل", 400);
    }

    // Resolve role reference if provided
    let roleRef: { id: string; name: string } | null = null;
    if (roleId) {
      roleRef = await db.role.findUnique({ where: { id: String(roleId) }, select: { id: true, name: true } });
      if (!roleRef) return jsonError("الدور المحدد غير موجود", 400);
    }

    const user = await db.user.create({
      data: {
        name: String(name).trim(),
        email: emailLower,
        password: String(password),
        role: roleRef ? roleRef.name : "admin",
        roleId: roleRef ? roleRef.id : null,
        status: status === "inactive" || status === "suspended" ? status : "active",
        avatar: avatar || null,
      },
      include: { roleRef: true },
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleId: user.roleId,
        roleName: user.roleRef?.name ?? null,
        roleNameAr: user.roleRef?.nameAr ?? null,
        isSystemRole: user.roleRef?.isSystemRole ?? false,
        status: user.status,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
