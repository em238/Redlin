import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: subscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 255) {
      return jsonError("invalid email", 400);
    }
    const existing = await db.subscriber.findUnique({ where: { email } });
    if (!existing) await db.subscriber.create({ data: { email } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("error", 500);
  }
}

// Admin: list
export async function GET() {
  try {
    await requireAdmin();
    const items = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ items });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("unauthorized", 401);
    return jsonError("error", 500);
  }
}

// Admin: delete (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return jsonError("id required", 400);
    await db.subscriber.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("unauthorized", 401);
    return jsonError("error", 500);
  }
}