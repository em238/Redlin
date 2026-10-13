import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ orders });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, governorate, service, weight, notes, price } = body;
    if (!customerName || !phone || !governorate || !service) {
      return jsonError("بيانات الطلب غير مكتملة", 400);
    }
    const order = await db.order.create({
      data: {
        customerName, phone, governorate, service,
        weight: weight ? Number(weight) : 1,
        notes: notes || "",
        price: price ? Number(price) : 0,
        status: "pending",
      },
    });
    return Response.json({ order });
  } catch {
    return jsonError("خطأ في إنشاء الطلب", 500);
  }
}
