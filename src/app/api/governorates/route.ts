import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/governorates — list governorates (active only by default, all if ?all=1)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    const governorates = await db.governorate.findMany({
      where: all ? {} : { active: true },
      orderBy: [{ zone: "asc" }, { name: "asc" }],
    });
    return Response.json({ governorates });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/governorates — create a new governorate
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["name", "nameAr", "zone", "basePrice", "etaHours", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (data.zone === undefined) data.zone = "A";
    if (data.basePrice === undefined) data.basePrice = 30;
    if (data.etaHours === undefined) data.etaHours = 48;
    if (data.active === undefined) data.active = true;
    const governorate = await db.governorate.create({ data: data as any });
    return Response.json({ governorate });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
