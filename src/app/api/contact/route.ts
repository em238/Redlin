import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/contact — public form submission
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) return jsonError("الاسم والبريد والرسالة مطلوبة", 400);
    const msg = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });
    return Response.json({ ok: true, id: msg.id });
  } catch {
    return jsonError("خطأ في إرسال الرسالة", 500);
  }
}

// GET /api/contact — admin lists all messages (newest first)
export async function GET() {
  try {
    await import("@/lib/auth").then(async (m) => { await m.requireAdmin(); });
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ messages });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
