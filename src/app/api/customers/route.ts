import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await db.customer.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ customers });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const customer = await db.customer.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        governorate: body.governorate || null,
      },
    });
    return Response.json({ customer });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
