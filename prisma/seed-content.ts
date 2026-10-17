import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding Hero Images + Partners...");

  // Hero images (use the 5 generated site images)
  const heroImages = [
    { url: "/images/hero-truck.png", title: "شاحنة Redline على الطريق السريع", order: 0 },
    { url: "/images/fleet.png", title: "أسطول Redline عند الفجر", order: 1 },
    { url: "/images/warehouse.png", title: "مستودعات Redline", order: 2 },
    { url: "/images/operations.png", title: "مركز العمليات", order: 3 },
    { url: "/images/courier.png", title: "مندوب التوصيل", order: 4 },
  ];
  for (const h of heroImages) {
    const existing = await db.heroImage.findFirst({ where: { url: h.url } });
    if (!existing) {
      await db.heroImage.create({ data: h });
    }
  }
  console.log(`✓ ${heroImages.length} hero images seeded`);

  // Partners
  const partners = [
    { name: "TechStore", logo: "/images/partner-1.png", icon: "smartphone", color: "#2563eb", website: "https://example.com", order: 0 },
    { name: "FashionHub", logo: "/images/partner-2.png", icon: "shirt", color: "#ec4899", website: "https://example.com", order: 1 },
    { name: "Adel Trading", logo: "/images/partner-3.png", icon: "briefcase", color: "#d97706", website: "https://example.com", order: 2 },
    { name: "Nour Crafts", logo: "/images/partner-4.png", icon: "palette", color: "#9333ea", website: "https://example.com", order: 3 },
    { name: "Ibrahim Group", logo: "/images/partner-5.png", icon: "building", color: "#0d9488", website: "https://example.com", order: 4 },
    { name: "MegaMart", logo: "/images/partner-6.png", icon: "store", color: "#16a34a", website: "https://example.com", order: 5 },
    { name: "QuickShip", logo: "/images/partner-7.png", icon: "truck", color: "#dc2626", website: "https://example.com", order: 6 },
    { name: "GlobalTech", logo: "/images/partner-8.png", icon: "cpu", color: "#4f46e5", website: "https://example.com", order: 7 },
  ];
  for (const p of partners) {
    const existing = await db.partner.findFirst({ where: { name: p.name } });
    if (!existing) {
      await db.partner.create({ data: p });
    }
  }
  console.log(`✓ ${partners.length} partners seeded`);

  console.log("✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
