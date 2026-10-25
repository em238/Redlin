import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { trackingNo: { contains: q } },
        { senderName: { contains: q } },
        { receiverName: { contains: q } },
        { receiverPhone: { contains: q } },
      ];
    }

    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return Response.json({ shipments });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في جلب الشحنات", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      senderName, senderPhone, senderAddress,
      receiverName, receiverPhone, receiverAddress,
      governorate, service, weight, notes, price, status,
    } = body;

    if (!receiverName || !receiverPhone || !governorate || !service) {
      return jsonError("بيانات الشحنة غير مكتملة", 400);
    }

    const trackingNo = "RED" + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 100));
    const shipment = await db.shipment.create({
      data: {
        trackingNo,
        senderName: senderName || "Redline Warehouse",
        senderPhone: senderPhone || "019000",
        senderAddress: senderAddress || "5th Settlement, New Cairo",
        receiverName, receiverPhone,
        receiverAddress: receiverAddress || "",
        governorate, service,
        weight: weight ? Number(weight) : 1,
        notes: notes || "",
        price: price ? Number(price) : 0,
        status: status || "pending",
        history: JSON.stringify([{ status: status || "pending", at: new Date().toISOString(), note: "تم إنشاء الشحنة" }]),
      },
    });
    return Response.json({ shipment });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في إنشاء الشحنة", 500);
  }
}
export const dynamic = "force-dynamic";
