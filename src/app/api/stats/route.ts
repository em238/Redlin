import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [shipmentCount, orderCount, customerCount, videoCount, pendingShipments, deliveredShipments, totalRevenueAgg, recentShipments, recentOrders, statusCounts] = await Promise.all([
      db.shipment.count(),
      db.order.count(),
      db.customer.count(),
      db.video.count(),
      db.shipment.count({ where: { status: { in: ["pending", "picked_up", "in_transit", "out_for_delivery"] } } }),
      db.shipment.count({ where: { status: "delivered" } }),
      db.shipment.aggregate({ _sum: { price: true } }),
      db.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      db.shipment.groupBy({ by: ["status"], _count: true }),
    ]);

    // weekly shipments last 7 days
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = await db.shipment.count({ where: { createdAt: { gte: d, lt: next } } });
      days.push({ date: d.toISOString(), count });
    }

    // revenue last 6 months
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setMonth(d.getMonth() + 1);
      const agg = await db.shipment.aggregate({ _sum: { price: true }, where: { createdAt: { gte: d, lt: next }, status: "delivered" } });
      months.push({ label: d.toLocaleString("en-US", { month: "short" }), revenue: agg._sum.price ?? 0 });
    }

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => (statusMap[s.status] = s._count));

    return Response.json({
      counts: {
        shipments: shipmentCount,
        orders: orderCount,
        customers: customerCount,
        videos: videoCount,
        pending: pendingShipments,
        delivered: deliveredShipments,
      },
      revenue: totalRevenueAgg._sum.price ?? 0,
      weekly: days,
      monthlyRevenue: months,
      recentShipments,
      recentOrders,
      statusMap,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في جلب الإحصائيات", 500);
  }
}

// Create a new SiteStat (label/value/icon record used by the public site stats bar)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { label, value, icon } = body;
    if (!label || value === undefined || value === null) {
      return jsonError("القيمة والوصف مطلوبان", 400);
    }
    const stat = await db.siteStat.create({
      data: { label, value: String(value), icon: icon || "package" },
    });
    return Response.json({ stat });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
