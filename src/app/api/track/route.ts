import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNo = (searchParams.get("no") || "").trim().toUpperCase();
  if (!trackingNo) return Response.json({ error: "رقم التتبع مطلوب" }, { status: 400 });

  const shipment = await db.shipment.findUnique({ where: { trackingNo } });
  if (!shipment) return Response.json({ error: "لم يتم العثور على شحنة بهذا الرقم" }, { status: 404 });

  let history: { status: string; at: string; note?: string }[] = [];
  try { history = shipment.history ? JSON.parse(shipment.history) : []; } catch {}

  const statusLabels: Record<string, string> = {
    pending: "بانتظار الاستلام",
    picked_up: "تم الاستلام",
    in_transit: "قيد الشحن",
    out_for_delivery: "خارج للتوصيل",
    delivered: "تم التسليم",
    returned: "مرتجع",
    cancelled: "ملغي",
  };

  return Response.json({
    shipment: {
      trackingNo: shipment.trackingNo,
      status: shipment.status,
      statusLabel: statusLabels[shipment.status] || shipment.status,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      governorate: shipment.governorate,
      service: shipment.service,
      weight: shipment.weight,
      price: shipment.price,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    },
    history: history.map((h) => ({ ...h, label: statusLabels[h.status] || h.status })),
  });
}
export const dynamic = "force-dynamic";
