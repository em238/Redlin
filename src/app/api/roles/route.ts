import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/roles — list all roles with user count
export async function GET() {
  try {
    try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
    const roles = await db.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: [{ isSystemRole: "desc" }, { createdAt: "asc" }],
    });
    const safe = roles.map((r) => ({
      id: r.id,
      name: r.name,
      nameAr: r.nameAr,
      description: r.description,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      isSystemRole: r.isSystemRole,
      permissions: r.permissions ? JSON.parse(r.permissions) : {},
      userCount: r._count?.users ?? 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    return Response.json({ roles: safe });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/roles — create new role
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, nameAr, description, descriptionAr, descriptionEn, permissions } = body;
    if (!name) return jsonError("اسم الدور مطلوب", 400);

    const existing = await db.role.findUnique({ where: { name: String(name).trim() } });
    if (existing) return jsonError("اسم الدور مستخدم بالفعل", 400);

    // Validate permissions object structure
    let perms: Record<string, string[]> = {};
    if (permissions && typeof permissions === "object") {
      for (const [mod, actions] of Object.entries(permissions)) {
        if (Array.isArray(actions)) {
          perms[mod] = actions.filter((a) => typeof a === "string");
        }
      }
    }

    const role = await db.role.create({
      data: {
        name: String(name).trim(),
        nameAr: nameAr ? String(nameAr) : "",
        description: description ? String(description) : "",
        descriptionAr: descriptionAr ? String(descriptionAr) : "",
        descriptionEn: descriptionEn ? String(descriptionEn) : "",
        isSystemRole: false, // never allow creating system roles
        permissions: JSON.stringify(perms),
      },
      include: { _count: { select: { users: true } } },
    });

    return Response.json({
      role: {
        id: role.id,
        name: role.name,
        nameAr: role.nameAr,
        description: role.description,
        descriptionAr: role.descriptionAr,
        descriptionEn: role.descriptionEn,
        isSystemRole: role.isSystemRole,
        permissions: JSON.parse(role.permissions || "{}"),
        userCount: role._count?.users ?? 0,
        createdAt: role.createdAt,
      },
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
