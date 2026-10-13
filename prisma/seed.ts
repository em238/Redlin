import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding Redline database...");

  // Admin user (password: admin123 - stored as plain for demo, in real app hash it)
  const existingUser = await db.user.findUnique({ where: { email: "admin@redline.eg" } });
  if (!existingUser) {
    await db.user.create({
      data: {
        email: "admin@redline.eg",
        name: "Redline Admin",
        password: "admin123",
        role: "admin",
      },
    });
    console.log("✓ Admin user created");
  }

  // Egypt's 27 governorates with shipping zones
  const governorates = [
    { name: "Cairo", nameAr: "القاهره", zone: "A", basePrice: 30, etaHours: 24 },
    { name: "Giza", nameAr: "الجيزه", zone: "A", basePrice: 30, etaHours: 24 },
    { name: "Alexandria", nameAr: "الاسكندريه", zone: "A", basePrice: 40, etaHours: 36 },
    { name: "Qalyubia", nameAr: "القليوبيه", zone: "A", basePrice: 35, etaHours: 24 },
    { name: "Port Said", nameAr: "بورسعيد", zone: "B", basePrice: 55, etaHours: 48 },
    { name: "Suez", nameAr: "السويس", zone: "B", basePrice: 55, etaHours: 48 },
    { name: "Dakahlia", nameAr: "الدقهليه", zone: "B", basePrice: 45, etaHours: 36 },
    { name: "Sharqia", nameAr: "الشرقيه", zone: "B", basePrice: 45, etaHours: 36 },
    { name: "Kafr El Sheikh", nameAr: "كفر الشيخ", zone: "B", basePrice: 50, etaHours: 48 },
    { name: "Gharbia", nameAr: "الغربيه", zone: "B", basePrice: 45, etaHours: 36 },
    { name: "Monufia", nameAr: "المنوفيه", zone: "B", basePrice: 40, etaHours: 36 },
    { name: "Beheira", nameAr: "البحيره", zone: "B", basePrice: 50, etaHours: 48 },
    { name: "Ismailia", nameAr: "الاسماعيليه", zone: "B", basePrice: 50, etaHours: 48 },
    { name: "Faiyum", nameAr: "الفيوم", zone: "C", basePrice: 55, etaHours: 60 },
    { name: "Beni Suef", nameAr: "بني سويف", zone: "C", basePrice: 55, etaHours: 60 },
    { name: "Minya", nameAr: "المنيا", zone: "C", basePrice: 60, etaHours: 72 },
    { name: "Asyut", nameAr: "اسيوط", zone: "C", basePrice: 65, etaHours: 72 },
    { name: "Sohag", nameAr: "سوهاج", zone: "C", basePrice: 70, etaHours: 72 },
    { name: "Qena", nameAr: "قنا", zone: "D", basePrice: 75, etaHours: 84 },
    { name: "Luxor", nameAr: "الاقصر", zone: "D", basePrice: 80, etaHours: 96 },
    { name: "Aswan", nameAr: "اسوان", zone: "D", basePrice: 90, etaHours: 96 },
    { name: "Red Sea", nameAr: "البحر الاحمر", zone: "D", basePrice: 85, etaHours: 96 },
    { name: "New Valley", nameAr: "الوادي الجديد", zone: "D", basePrice: 95, etaHours: 120 },
    { name: "Matrouh", nameAr: "مطروح", zone: "D", basePrice: 85, etaHours: 96 },
    { name: "North Sinai", nameAr: "شمال سيناء", zone: "D", basePrice: 90, etaHours: 96 },
    { name: "South Sinai", nameAr: "جنوب سيناء", zone: "D", basePrice: 90, etaHours: 96 },
    { name: "Damietta", nameAr: "دمياط", zone: "B", basePrice: 45, etaHours: 36 },
  ];

  for (const g of governorates) {
    await db.governorate.upsert({
      where: { name: g.name },
      update: {},
      create: g,
    });
  }
  console.log(`✓ ${governorates.length} governorates seeded`);

  // Services
  const services = [
    { name: "Standard", nameAr: "عادي", description: "توصيل خلال 48-96 ساعة بأفضل الأسعار", icon: "truck", multiplier: 1.0 },
    { name: "Express", nameAr: "ممتاز", description: "توصيل خلال 24-48 ساعة مع أولوية الشحن", icon: "zap", multiplier: 1.6 },
    { name: "Same Day", nameAr: "نفس اليوم", description: "توصيل في نفس اليوم داخل القاهرة الكبرى", icon: "rocket", multiplier: 2.3 },
    { name: "Freight", nameAr: "شحن ثقيل", description: "شحن البضائع والأغراض الثقيلة والكميات", icon: "package", multiplier: 1.4 },
    { name: "Cash on Delivery", nameAr: "دفع عند الاستلام", description: "استلام قيمة الشحنة عند التسليم للمستلم", icon: "banknote", multiplier: 1.1 },
    { name: "Returns", nameAr: "مرتجعات", description: "استرجاع الشحنات المرتجعة من العملاء", icon: "rotate-ccw", multiplier: 1.2 },
  ];
  for (const s of services) {
    await db.service.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log(`✓ ${services.length} services seeded`);

  // Testimonials
  const testimonials = [
    { name: "Ahmed Mansour", role: "صاحب متجر إلكترونيات", company: "TechStore EG", content: "خدمة ممتازة وسريعة! وصلت الشحنات لعملائي في كل محافظات مصر في الوقت المحدد. Redline غيّرت طريقة إدارة شحناتي تماماً.", rating: 5 },
    { name: "Sara El-Sayed", role: "مديرة مبيعات", company: "Fashion Hub", content: "أفضل شركة شحن تعاملت معها. الأسعار منافسة والخدمة احترافية. نظام التتبع ممتاز ويسهل عليّ متابعة كل شحنة.", rating: 5 },
    { name: "Mohamed Adel", role: "تاجر جملة", company: "Adel Trading", content: "شحن ثقيل وبضائع كثيرة ولم أواجه أي مشكلة. الفريق محترف والتوصيل دقيق. أنصح الجميع بـ Redline.", rating: 5 },
    { name: "Nour Hassan", role: "مؤسسة مشروع ناشئ", company: "Nour Crafts", content: "كمشروع صغير، Redline وفّرت لي حلول شحن مناسبة لميزانيتي مع جودة عالية. شكراً لكم على الاحترافية.", rating: 5 },
    { name: "Khaled Ibrahim", role: "مدير سلاسل الإمداد", company: "Ibrahim Group", content: "شراكة استراتيجية منذ سنتين. المرونة والسرعة في التعامل مع الكميات الكبيرة لا تضاهى. شركة موثوقة بكل المقاييس.", rating: 5 },
  ];
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log(`✓ ${testimonials.length} testimonials seeded`);

  // Site stats
  const stats = [
    { label: "شحنة تم توصيلها", value: "850K+", icon: "package" },
    { label: "محافظة نغطّيها", value: "27", icon: "map" },
    { label: "عميل سعيد", value: "12K+", icon: "users" },
    { label: "فرع ومستودع", value: "40+", icon: "building" },
  ];
  for (const s of stats) {
    await db.siteStat.create({ data: s });
  }
  console.log(`✓ ${stats.length} site stats seeded`);

  // Demo customers
  const customers = [
    { name: "Ahmed Mansour", phone: "01001234567", email: "ahmed@example.com", address: "Maadi, Cairo", city: "Cairo", governorate: "Cairo" },
    { name: "Sara El-Sayed", phone: "01112223344", email: "sara@example.com", address: "Smouha, Alexandria", city: "Alexandria", governorate: "Alexandria" },
    { name: "Mohamed Adel", phone: "01223344556", email: "mohamed@example.com", address: "Downtown, Giza", city: "Giza", governorate: "Giza" },
    { name: "Nour Hassan", phone: "01556677889", email: "nour@example.com", address: "Nasr City, Cairo", city: "Cairo", governorate: "Cairo" },
    { name: "Khaled Ibrahim", phone: "01099887766", email: "khaled@example.com", address: "Mansoura, Dakahlia", city: "Mansoura", governorate: "Dakahlia" },
  ];
  for (const c of customers) {
    await db.customer.create({ data: c });
  }
  console.log(`✓ ${customers.length} customers seeded`);

  // Demo shipments
  const statuses = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned"];
  const servicesList = ["Standard", "Express", "Same Day", "Freight"];
  const shipmentCount = 18;
  for (let i = 0; i < shipmentCount; i++) {
    const cust = customers[i % customers.length];
    const gov = governorates[i % governorates.length];
    const svc = servicesList[i % servicesList.length];
    const weight = Math.round((Math.random() * 15 + 1) * 10) / 10;
    const price = Math.round((gov.basePrice * (svc === "Express" ? 1.6 : svc === "Same Day" ? 2.3 : svc === "Freight" ? 1.4 : 1) + weight * 5) * 100) / 100;
    const trackingNo = "RED" + String(100000 + i + 1);
    await db.shipment.create({
      data: {
        trackingNo,
        senderName: "Redline Warehouse Cairo",
        senderPhone: "019000",
        senderAddress: "5th Settlement, New Cairo",
        receiverName: cust.name,
        receiverPhone: cust.phone,
        receiverAddress: cust.address,
        governorate: gov.name,
        service: svc,
        weight,
        price,
        status: statuses[i % statuses.length],
        history: JSON.stringify([
          { status: "pending", at: new Date(Date.now() - 86400000 * 3).toISOString(), note: "تم استلام الطلب" },
          { status: "picked_up", at: new Date(Date.now() - 86400000 * 2).toISOString(), note: "تم الاستلام من المرسل" },
          { status: "in_transit", at: new Date(Date.now() - 86400000).toISOString(), note: "الشحنة في الطريق" },
        ]),
        customerId: undefined,
      },
    });
  }
  console.log(`✓ ${shipmentCount} shipments seeded`);

  // Demo orders
  for (let i = 0; i < 8; i++) {
    const cust = customers[i % customers.length];
    const gov = governorates[i % governorates.length];
    const svc = servicesList[i % servicesList.length];
    const weight = Math.round((Math.random() * 12 + 1) * 10) / 10;
    const price = Math.round((gov.basePrice * 1.5 + weight * 5) * 100) / 100;
    await db.order.create({
      data: {
        customerName: cust.name,
        phone: cust.phone,
        governorate: gov.name,
        service: svc,
        weight,
        price,
        status: ["pending", "confirmed", "processing"][i % 3],
        notes: "طلب جديد من الموقع",
      },
    });
  }
  console.log(`✓ 8 orders seeded`);

  // Demo videos
  const videos = [
    { title: "Redline - قصة شحن", description: "تعرف على رحلة Redline من البداية حتى أصبحنا أكبر شركة شحن في مصر", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "promo", featured: true },
    { title: "شبكة التوصيل في 27 محافظة", description: "كيف نغطي كل محافظات مصر بأسرع وقت ممكن", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "logistics", featured: false },
  ];
  for (const v of videos) {
    await db.video.create({ data: v });
  }
  console.log(`✓ ${videos.length} videos seeded`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
