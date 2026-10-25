import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const existing = await db.shipment.findUnique({ where: { id } });
    if (!existing) return jsonError("الشحنة غير موجودة", 404);

    const { status, note, ...rest } = body;
    let history: any[] = [];
    try { history = existing.history ? JSON.parse(existing.history) : []; } catch {}
    if (status && status !== existing.status) {
      history.push({ status, at: new Date().toISOString(), note: note || "تحديث الحالة" });
    }
    const updated = await db.shipment.update({
      where: { id },
      data: { ...rest, status: status ?? existing.status, history: JSON.stringify(history) },
    });
    return Response.json({ shipment: updated });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في تحديث الشحنة", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.shipment.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في حذف الشحنة", 500);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const shipment = await db.shipment.findUnique({ where: { id } });
    if (!shipment) return jsonError("الشحنة غير موجودة", 404);
    return Response.json({ shipment });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
