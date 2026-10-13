import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "redline_session";

// Simple in-memory session store (token -> userId)
const sessions = new Map<string, string>();

export function createSession(userId: string): string {
  const token =
    Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
  sessions.set(token, userId);
  return token;
}

export function destroySession(token: string | undefined) {
  if (token) sessions.delete(token);
}

export async function getSessionUser(): Promise<{ id: string; email: string; name: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
