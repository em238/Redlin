import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return jsonError("البريد وكلمة المرور مطلوبان", 400);

    const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || user.password !== String(password)) {
      return jsonError("بيانات الدخول غير صحيحة", 401);
    }

    const token = createSession(user.id);
    const res = Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
    return res;
  } catch (e) {
    return jsonError("خطأ في تسجيل الدخول", 500);
  }
}
export const dynamic = "force-dynamic";
