"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Trash2, Mail, MailOpen, Phone, AtSign, Tag, Clock,
  Inbox, Filter, Reply, X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { apiGet, apiPatch, apiDelete, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export function DashboardMessages() {
  const { isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => apiGet<{ messages: Message[] }>("/api/contact"),
  });

  const messages = data?.messages ?? [];
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.isRead) return false;
    if (filter === "read" && !m.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject || "").toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  };

  const markRead = async (msg: Message, read: boolean) => {
    try {
      await apiPatch(`/api/contact/${msg.id}`, { isRead: read });
      invalidate();
      if (selected?.id === msg.id) {
        setSelected({ ...msg, isRead: read });
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (msg: Message) => {
    if (!confirm(L("حذف هذه الرسالة؟", "Delete this message?"))) return;
    try {
      await apiDelete(`/api/contact/${msg.id}`);
      toast.success(L("تم الحذف", "Deleted"));
      if (selected?.id === msg.id) setSelected(null);
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.isRead) {
      markRead(msg, true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("صندوق الرسائل الواردة", "Inbox — Contact Messages")}
        </span>
        <Badge className="bg-primary/10 text-primary border-primary/30 gap-1.5">
          <Inbox className="w-3 h-3" />
          {unreadCount} {L("غير مقروءة", "unread")}
        </Badge>
      </div>

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{L("الرسائل والاستفسارات", "Messages & Inquiries")}</h3>
            <p className="text-sm text-muted-foreground">
              {L("إدارة رسائل نموذج التواصل من الزوار", "Manage contact form submissions from visitors")}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: messages.length, l: L("إجمالي", "Total"), c: "text-gradient-red" },
          { v: unreadCount, l: L("غير مقروءة", "Unread"), c: "text-amber-600" },
          { v: messages.length - unreadCount, l: L("مقروءة", "Read"), c: "text-emerald-600" },
        ].map((s, i) => (
          <Card key={i} className="p-4 text-center">
            <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-primary text-white gap-2" : "gap-2"}
            >
              <Filter className="w-3.5 h-3.5" />
              {f === "all" ? L("الكل", "All") : f === "unread" ? L("غير مقروءة", "Unread") : L("مقروءة", "Read")}
            </Button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={L("بحث بالاسم أو البريد أو الموضوع...", "Search by name, email, or subject...")}
          className="h-9 flex-1"
        />
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-bold">{L("لا توجد رسائل", "No messages")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {L("ستظهر رسائل الزوار هنا عند استلامها", "Visitor messages will appear here when received")}
          </p>
        </Card>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card
                  className={`p-4 cursor-pointer hover:shadow-md transition-all ${!msg.isRead ? "border-primary/40 bg-primary/5" : "border-border"}`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="flex items-start gap-3">
                    {/* Read/Unread indicator */}
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!msg.isRead ? "bg-primary" : "bg-transparent"}`} />

                    {/* Avatar circle with initial */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${!msg.isRead ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-semibold text-sm truncate ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {msg.name}
                          </span>
                          {!msg.isRead && (
                            <Badge className="bg-primary/10 text-primary text-[9px] py-0 h-4 shrink-0">
                              {L("جديد", "New")}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0" dir="ltr">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        {msg.subject && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{msg.subject}</span>
                          </span>
                        )}
                        <span className="truncate" dir="ltr">{msg.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {msg.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markRead(msg, !msg.isRead)}
                        title={msg.isRead ? L("تعليم كغير مقروء", "Mark as unread") : L("تعليم كمقروء", "Mark as read")}
                      >
                        {msg.isRead ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:text-rose-700"
                        onClick={() => remove(msg)}
                        title={L("حذف", "Delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Message Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  {selected.subject || L("رسالة جديدة", "New Message")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Sender info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-600 p-[2px] shrink-0">
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary font-bold text-lg">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold">{selected.name}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1" dir="ltr">
                        <AtSign className="w-3 h-3" /> {selected.email}
                      </span>
                      {selected.phone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3" /> {selected.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1" dir="ltr">
                        <Clock className="w-3 h-3" /> {formatDate(selected.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message body */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                      <Reply className="w-4 h-4" />
                      {L("رد عبر البريد", "Reply via Email")}
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => markRead(selected, !selected.isRead)}
                    className="gap-2"
                  >
                    {selected.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    {selected.isRead ? L("تعليم كغير مقروء", "Mark unread") : L("تعليم كمقروء", "Mark read")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => remove(selected)}
                    className="text-rose-600 hover:text-rose-700 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {L("حذف", "Delete")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
