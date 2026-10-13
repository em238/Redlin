// Frontend fetch helpers

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { method: "GET", headers: { "Content-Type": "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export async function apiPatch<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export function formatEGP(n: number) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(n) + " ج.م";
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(d: string | Date) {
  return new Date(d).toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "بانتظار الاستلام",
  picked_up: "تم الاستلام",
  in_transit: "قيد الشحن",
  out_for_delivery: "خارج للتوصيل",
  delivered: "تم التسليم",
  returned: "مرتجع",
  cancelled: "ملغي",
  confirmed: "مؤكد",
  processing: "قيد المعالجة",
  new: "جديد",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  picked_up: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  in_transit: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  out_for_delivery: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  returned: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  cancelled: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
  confirmed: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
  processing: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  new: "bg-primary/15 text-primary border-primary/30",
};
