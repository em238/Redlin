"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Mail, Phone, Trash2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiDelete, formatDateTime } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export function DashboardMessages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => apiGet<any>("/api/contact"),
  });
  const messages = data?.messages ?? [];

  const remove = async (id: string) => {
    if (!confirm("حذف الرسالة؟")) return;
    try {
      await apiDelete(`/api/contact/${id}`);
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["contact-messages"] });
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (messages.length === 0) {
    return (
      <Card className="flex flex-col items-center py-16 text-muted-foreground">
        <Inbox className="w-12 h-12 mb-3 opacity-40" />
        <p>لا توجد رسائل بعد</p>
      </Card>
    );
  }

  const sel = messages.find((m: any) => m.id === selected);

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-[70vh]">
      {/* List */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> الرسائل الواردة ({messages.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((m: any) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`w-full text-right p-4 border-b border-border hover:bg-muted/50 transition-colors ${selected === m.id ? "bg-primary/5 border-r-4 border-r-primary" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-sm truncate">{m.name}</div>
                {m.status === "new" && <Badge className="bg-primary text-primary-foreground text-[10px]">جديد</Badge>}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{m.subject}</div>
              <div className="text-xs text-muted-foreground truncate mt-1">{m.message}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{formatDateTime(m.createdAt)}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Detail */}
      <Card className="lg:col-span-2 p-6 overflow-y-auto">
        {sel ? (
          <div>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-lg">{sel.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatDateTime(sel.createdAt)}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => remove(sel.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="py-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold">
                    {sel.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{sel.name}</div>
                    <a href={`mailto:${sel.email}`} className="text-xs text-primary flex items-center gap-1 hover:underline" dir="ltr">
                      <Mail className="w-3 h-3" /> {sel.email}
                    </a>
                  </div>
                </div>
                {sel.phone && (
                  <a href={`tel:${sel.phone}`} className="flex items-center gap-2 text-sm hover:text-primary" dir="ltr">
                    <Phone className="w-4 h-4 text-primary" /> {sel.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">الرسالة</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{sel.message}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <a href={`mailto:${sel.email}?subject=رد: ${encodeURIComponent(sel.subject)}`}>
                <Button className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                  <Mail className="w-4 h-4" /> الرد بالبريد
                </Button>
              </a>
              {sel.phone && (
                <a href={`tel:${sel.phone}`}>
                  <Button variant="outline" className="gap-2"><Phone className="w-4 h-4" /> اتصال</Button>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Mail className="w-12 h-12 mb-3 opacity-30" />
            <p>اختر رسالة لعرض تفاصيلها</p>
          </div>
        )}
      </Card>
    </div>
  );
}
