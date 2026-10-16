import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/governorates/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const governorate = await db.governorate.findUnique({ where: { id } });
    if (!governorate) return jsonError("المحافظة غير موجودة", 404);
    return Response.json({ governorate });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// PATCH /api/governorates/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["name", "nameAr", "zone", "basePrice", "etaHours", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const governorate = await db.governorate.update({ where: { id }, data });
    return Response.json({ governorate });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

// DELETE /api/governorates/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.governorate.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
