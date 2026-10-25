import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const governorateName = searchParams.get("governorate");
    const serviceName = searchParams.get("service");
    const weight = parseFloat(searchParams.get("weight") || "1");

    if (!governorateName || !serviceName) return jsonError("المحافظة والخدمة مطلوبة", 400);

    const gov = await db.governorate.findUnique({ where: { name: governorateName } });
    if (!gov) return jsonError("المحافظة غير موجودة", 404);

    const svc = await db.service.findUnique({ where: { name: serviceName } });
    if (!svc) return jsonError("الخدمة غير موجودة", 404);

    const base = gov.basePrice;
    const weightFee = Math.max(0, (weight - 1)) * 5; // first kg free-ish
    const subtotal = (base + weightFee) * svc.multiplier;
    const price = Math.round(subtotal * 100) / 100;

    return Response.json({
      price,
      breakdown: {
        base: base,
        weightFee: Math.round(weightFee * 100) / 100,
        serviceMultiplier: svc.multiplier,
      },
      etaHours: gov.etaHours,
      etaDays: Math.ceil(gov.etaHours / 24),
    });
  } catch {
    return jsonError("خطأ في حساب السعر", 500);
  }
}
export const dynamic = "force-dynamic";
