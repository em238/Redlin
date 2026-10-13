"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Headphones, Banknote, MapPinned, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "سرعة فائقة", desc: "توصيل في نفس اليوم داخل القاهرة الكبرى و48-96 ساعة لكل المحافظات" },
  { icon: ShieldCheck, title: "أمان مضمون", desc: "تأمين كامل على كل شحنة مع تعويض كامل عند أي طارئ" },
  { icon: BarChart3, title: "تتبع مباشر", desc: "نظام تتبع لحظي يخبرك بمكان شحنتك في كل خطوة" },
  { icon: MapPinned, title: "تغطية شاملة", desc: "27 محافظة و40+ فرع ومستودع في كل أنحاء مصر" },
  { icon: Banknote, title: "أسعار منافسة", desc: "أفضل الأسعار في السوق مع خصومات للكميات والشركات" },
  { icon: Headphones, title: "دعم 24/7", desc: "فريق دعم متكامل على مدار الساعة لخدمتك في أي وقت" },
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="/images/warehouse.png" alt="مستودعات Redline" fill sizes="(max-width:1024px) 100vw, 540px" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-4 sm:left-8 w-2/3 aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-background">
              <Image src="/images/operations.png" alt="مركز العمليات" fill sizes="360px" className="object-cover" />
            </div>
            <div className="absolute -top-6 -right-2 sm:-right-6 glass rounded-2xl border border-border/60 px-5 py-4 shadow-xl">
              <div className="text-3xl font-black text-gradient-red">+15</div>
              <div className="text-xs text-muted-foreground font-medium">سنة من الخبرة</div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
              من نحن
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Redline — <span className="text-gradient-red">عصب الشحن</span> في مصر
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              منذ أكثر من 15 عاماً، نبني Redline لنكون الشريك اللوجستي الموثوق للشركات والأفراد في مصر.
              شبكتنا تغطي 27 محافة بأكملها بأكثر من 40 فرعاً ومستودعاً، ونوفّر حلول شحن متكاملة
              بسرعة وأمان وأسعار تنافسية لا تضاهى.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              من البداية، آمنّا بأن الشحن ليس مجرد نقل طرود، بل التزام بالوعد. لذلك نستثمر في
              التكنولوجيا والبنية التحتية والكوادر البشرية لنضمن وصول كل شحنة في الوقت المحدد.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
