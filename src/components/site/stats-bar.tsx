"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Map, Users, Building2 } from "lucide-react";
import { apiGet } from "@/lib/api";

const ICONS: Record<string, any> = { package: Package, map: Map, users: Users, building: Building2 };

export function StatsBar() {
  const { data } = useQuery({
    queryKey: ["site-stats"],
    queryFn: () => apiGet<{ stats: { id: string; label: string; value: string; icon: string }[] }>("/api/site"),
  });

  const stats = data?.stats ?? [
    { id: "1", label: "شحنة تم توصيلها", value: "850K+", icon: "package" },
    { id: "2", label: "محافظة نغطّيها", value: "27", icon: "map" },
    { id: "3", label: "عميل سعيد", value: "12K+", icon: "users" },
    { id: "4", label: "فرع ومستودع", value: "40+", icon: "building" },
  ];

  return (
    <section className="relative -mt-16 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = ICONS[s.icon] || Package;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-2xl border border-border/60 shadow-xl shadow-black/5 p-5 sm:p-6 text-center hover:shadow-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-gradient-red">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground font-medium">{s.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
