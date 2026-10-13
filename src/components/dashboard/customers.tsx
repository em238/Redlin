"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Phone, MapPin, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiGet, formatDate } from "@/lib/api";

export function DashboardCustomers() {
  const { data, isLoading } = useQuery({ queryKey: ["customers"], queryFn: () => apiGet<any>("/api/customers") });
  const customers = data?.customers ?? [];

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (customers.length === 0) {
    return (
      <Card className="flex flex-col items-center py-16 text-muted-foreground">
        <Users className="w-12 h-12 mb-3 opacity-40" />
        <p>لا يوجد عملاء بعد</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {customers.map((c: any) => (
        <Card key={c.id} className="p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-bold text-lg">
              {c.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground">عميل منذ {formatDate(c.createdAt)}</div>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono" dir="ltr">{c.phone}</span>
            </div>
            {c.email && (
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Mail className="w-3.5 h-3.5 text-primary" /> {c.email}
              </div>
            )}
            {(c.city || c.governorate) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {[c.city, c.governorate].filter(Boolean).join("، ")}
              </div>
            )}
            {c.address && <p className="text-xs text-muted-foreground italic mt-2 line-clamp-2">{c.address}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}
