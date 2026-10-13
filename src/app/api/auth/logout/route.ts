import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieHeader = ` ${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", cookieHeader.trim().replace("; ", ";"));
  destroySession(undefined);
  return res;
}
