import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password || undefined,
  database: url.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============================================
  // Cleanup Existing Data (Bookings, Orders, & Studios)
  // ============================================
  console.log("🧹 Cleaning up existing bookings, orders, and studios...");
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.studioBooking.deleteMany({});
  await prisma.studio.deleteMany({});
  console.log("  ✓ Cleanup complete.");

  // ============================================
  // 1. Users
  // ============================================
  console.log("👥 Creating users...");
  const adminPass = await bcrypt.hash("admin123", 10);
  const superPass = await bcrypt.hash("super123", 10);
  const userPass = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fokus.id" },
    update: {
      phone: "081234567890",
      address: "Gedung Fokus Studio Lt. 3, Jakarta Pusat",
    },
    create: {
      name: "Admin Fokus",
      email: "admin@fokus.id",
      password: adminPass,
      phone: "081234567890",
      role: "ADMIN",
      address: "Gedung Fokus Studio Lt. 3, Jakarta Pusat",
    },
  });

  const superuser = await prisma.user.upsert({
    where: { email: "super@fokus.id" },
    update: {
      phone: "081234567891",
      address: "Jl. Merdeka No. 101, Jakarta Pusat",
    },
    create: {
      name: "Super User",
      email: "super@fokus.id",
      password: superPass,
      phone: "081234567891",
      role: "SUPERUSER",
      address: "Jl. Merdeka No. 101, Jakarta Pusat",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user@fokus.id" },
    update: {
      phone: "081234567892",
      address: "Jl. Melati No. 15, Bandung",
    },
    create: {
      name: "John Doe",
      email: "user@fokus.id",
      password: userPass,
      phone: "081234567892",
      role: "USER",
      address: "Jl. Melati No. 15, Bandung",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "anisa@gmail.com" },
    update: {
      phone: "081298765432",
      address: "Jl. Anggrek No. 42, Surabaya",
    },
    create: {
      name: "Anisa Rahmawati",
      email: "anisa@gmail.com",
      password: userPass,
      phone: "081298765432",
      role: "USER",
      address: "Jl. Anggrek No. 42, Surabaya",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "budi@gmail.com" },
    update: {
      phone: "081345678901",
      address: "Jl. Kenanga No. 8, Yogyakarta",
    },
    create: {
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: userPass,
      phone: "081345678901",
      role: "USER",
      address: "Jl. Kenanga No. 8, Yogyakarta",
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: "dewi@gmail.com" },
    update: {
      phone: "081456789012",
      address: "Jl. Kamboja No. 23, Medan",
    },
    create: {
      name: "Dewi Lestari",
      email: "dewi@gmail.com",
      password: userPass,
      phone: "081456789012",
      role: "USER",
      address: "Jl. Kamboja No. 23, Medan",
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: "rizky@gmail.com" },
    update: {
      phone: "081567890123",
      address: "Jl. Dahlia No. 7, Semarang",
    },
    create: {
      name: "Rizky Pratama",
      email: "rizky@gmail.com",
      password: userPass,
      phone: "081567890123",
      role: "USER",
      address: "Jl. Dahlia No. 7, Semarang",
    },
  });

  console.log(`  ✓ 7 users verified/created`);

  // ============================================
  // 2. Categories
  // ============================================
  console.log("📂 Creating categories...");
  const categories = await Promise.all(
    [
      { name: "Kamera Mirrorless", slug: "mirrorless" },
      { name: "Kamera DSLR", slug: "dslr" },
      { name: "Lensa", slug: "lensa" },
      { name: "Lighting", slug: "lighting" },
      { name: "Aksesoris", slug: "aksesoris" },
      { name: "Stabilizer", slug: "stabilizer" },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  console.log(`  ✓ ${categories.length} categories created`);

  // ============================================
  // 3. Equipment
  // ============================================
  console.log("📷 Creating equipment...");
  const catMap: Record<string, string> = {};
  categories.forEach((c) => (catMap[c.slug] = c.id));

  const equipmentData = [
    { name: "Canon EOS R5", slug: "canon-eos-r5", brand: "Canon", type: "Camera", specs: "45MP · 8K Video · IBIS · Dual Card Slots", pricePerDay: 350000, stock: 3, available: 2, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Canon EOS R6 Mark II", slug: "canon-eos-r6-ii", brand: "Canon", type: "Camera", specs: "24MP · 4K60 · 40fps · IBIS", pricePerDay: 280000, stock: 4, available: 3, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Sony A7 IV", slug: "sony-a7-iv", brand: "Sony", type: "Camera", specs: "33MP · 4K60 · Real-time AF Tracking", pricePerDay: 300000, stock: 5, available: 4, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Sony A7S III", slug: "sony-a7s-iii", brand: "Sony", type: "Camera", specs: "12MP · 4K120 · S-Log3 · S-Cinetone", pricePerDay: 400000, stock: 2, available: 1, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Sony A7R V", slug: "sony-a7r-v", brand: "Sony", type: "Camera", specs: "61MP · 8K · AI AF · IBIS", pricePerDay: 450000, stock: 2, available: 2, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Nikon Z6 III", slug: "nikon-z6-iii", brand: "Nikon", type: "Camera", specs: "24MP · 4K120 · N-Log · Blackout-Free EVF", pricePerDay: 250000, stock: 3, available: 3, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Fujifilm X-T5", slug: "fujifilm-xt5", brand: "Fujifilm", type: "Camera", specs: "40MP · 6.2K · Film Simulation · Compact", pricePerDay: 200000, stock: 4, available: 3, image: "/camera-rental.png", categoryId: catMap["mirrorless"] },
    { name: "Canon EOS 5D Mark IV", slug: "canon-5d-iv", brand: "Canon", type: "Camera", specs: "30MP · 4K · Dual Pixel AF", pricePerDay: 200000, stock: 3, available: 2, image: "/camera-rental.png", categoryId: catMap["dslr"] },
    { name: "Nikon D850", slug: "nikon-d850", brand: "Nikon", type: "Camera", specs: "45MP · 4K · 153 AF Points", pricePerDay: 250000, stock: 2, available: 2, image: "/camera-rental.png", categoryId: catMap["dslr"] },
    { name: "Sony FE 24-70mm f/2.8 GM II", slug: "sony-fe-24-70-gm2", brand: "Sony", type: "Lens", specs: "Zoom · f/2.8 · G Master · Weather Sealed", pricePerDay: 150000, stock: 4, available: 3, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", categoryId: catMap["lensa"] },
    { name: "Canon RF 70-200mm f/2.8L IS", slug: "canon-rf-70-200", brand: "Canon", type: "Lens", specs: "Telephoto · f/2.8 · L-Series · IS", pricePerDay: 175000, stock: 3, available: 2, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", categoryId: catMap["lensa"] },
    { name: "Sony FE 85mm f/1.4 GM", slug: "sony-fe-85-gm", brand: "Sony", type: "Lens", specs: "Portrait · f/1.4 · G Master · Bokeh", pricePerDay: 120000, stock: 3, available: 3, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", categoryId: catMap["lensa"] },
    { name: "Canon RF 50mm f/1.2L", slug: "canon-rf-50-12l", brand: "Canon", type: "Lens", specs: "Prime · f/1.2 · L-Series · Dream Lens", pricePerDay: 200000, stock: 2, available: 2, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", categoryId: catMap["lensa"] },
    { name: "Sigma 35mm f/1.4 DG DN Art", slug: "sigma-35-14-art", brand: "Sigma", type: "Lens", specs: "Wide · f/1.4 · Art Series · Sharp", pricePerDay: 100000, stock: 3, available: 3, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", categoryId: catMap["lensa"] },
    { name: "Godox AD600Pro", slug: "godox-ad600pro", brand: "Godox", type: "Lighting", specs: "600W · TTL · HSS · 2.4G Wireless", pricePerDay: 120000, stock: 4, available: 3, image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80", categoryId: catMap["lighting"] },
    { name: "Profoto B10 Plus", slug: "profoto-b10-plus", brand: "Profoto", type: "Lighting", specs: "500W · AirTTL · Continuous LED", pricePerDay: 200000, stock: 2, available: 2, image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80", categoryId: catMap["lighting"] },
    { name: "Godox SL200II", slug: "godox-sl200ii", brand: "Godox", type: "Lighting", specs: "200W LED · Bowens Mount · Silent Fan", pricePerDay: 80000, stock: 6, available: 5, image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&q=80", categoryId: catMap["lighting"] },
    { name: "DJI RS 3 Pro", slug: "dji-rs3-pro", brand: "DJI", type: "Stabilizer", specs: "3-Axis Gimbal · 4.5kg Payload · LiDAR", pricePerDay: 150000, stock: 3, available: 2, image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&q=80", categoryId: catMap["stabilizer"] },
    { name: "DJI RS 4", slug: "dji-rs4", brand: "DJI", type: "Stabilizer", specs: "3-Axis · Native Vertical · AI Tracking", pricePerDay: 180000, stock: 2, available: 2, image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&q=80", categoryId: catMap["stabilizer"] },
    { name: "V-Mount Battery Kit", slug: "v-mount-kit", brand: "SmallRig", type: "Accessory", specs: "150Wh × 2 · Charger · D-Tap", pricePerDay: 50000, stock: 5, available: 4, image: "https://images.unsplash.com/photo-1621259182978-f09e5e2ae090?w=600&q=80", categoryId: catMap["aksesoris"] },
  ];

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { slug: eq.slug },
      update: {
        image: eq.image,
      },
      create: eq,
    });
  }
  console.log(`  ✓ ${equipmentData.length} equipment items created`);

  // ============================================
  // 4. Studios (Only Studio A is kept)
  // ============================================
  console.log("🏠 Creating studio (Studio A only)...");
  const studios = [
    { name: "Studio A - White Room", slug: "studio-a", description: "Studio minimalis dengan backdrop putih, cocok untuk portrait, fashion, dan foto produk. Lantai epoxy putih glossy.", pricePerHour: 200000, capacity: 8, facilities: JSON.stringify(["Backdrop putih", "Godox SL200 ×3", "Softbox 120cm", "Ring Light 18\"", "Meja produk", "Ruang ganti"]), image: "/studio-rental.png" },
  ];

  for (const s of studios) {
    await prisma.studio.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${studios.length} studios created`);

  // ============================================
  // 5. Photography Services
  // ============================================
  console.log("📸 Creating services...");
  const services = [
    { name: "Paket Wedding Basic", slug: "wedding-basic", category: "Wedding", priceStart: 5000000, duration: "6-8 jam", includes: JSON.stringify(["1 fotografer", "200+ foto edited", "All file hi-res digital", "Cetak 20 foto 4R"]) },
    { name: "Paket Wedding Premium", slug: "wedding-premium", category: "Wedding", priceStart: 12000000, duration: "Full day", includes: JSON.stringify(["2 fotografer + 1 videografer", "500+ foto edited", "Cinematic highlight video 3-5 min", "Album hardcover 40 halaman", "All file hi-res digital", "Pre-wedding session"]) },
    { name: "Prewedding Outdoor", slug: "prewedding-outdoor", category: "Prewedding", priceStart: 3000000, duration: "4-5 jam", includes: JSON.stringify(["1 fotografer", "2 lokasi", "100+ foto edited", "All file hi-res digital", "MUA included"]) },
    { name: "Foto Produk Basic", slug: "produk-basic", category: "Product", priceStart: 1500000, duration: "3-4 jam", includes: JSON.stringify(["30 produk", "White background", "2 angle per produk", "Editing warna & retouching"]) },
    { name: "Foto Produk Lifestyle", slug: "produk-lifestyle", category: "Product", priceStart: 3500000, duration: "5-6 jam", includes: JSON.stringify(["20 produk", "Styled set & props", "3-4 angle per produk", "Model hand/flat lay", "Editing premium"]) },
    { name: "Fashion Editorial", slug: "fashion-editorial", category: "Fashion", priceStart: 5000000, duration: "4-6 jam", includes: JSON.stringify(["1 fotografer senior", "Indoor/outdoor", "30+ foto edited", "Retouching premium", "Wardrobe consultation"]) },
    { name: "Dokumentasi Event", slug: "event-documentation", category: "Event", priceStart: 2500000, duration: "4-8 jam", includes: JSON.stringify(["1-2 fotografer", "100+ foto edited", "Same day edit (5 foto)", "All file hi-res digital"]) },
    { name: "Portrait Session", slug: "portrait-session", category: "Portrait", priceStart: 800000, duration: "1-2 jam", includes: JSON.stringify(["1 fotografer", "Indoor/outdoor", "20+ foto edited", "All file hi-res digital"]) },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${services.length} services created`);

  // ============================================
  // 6 & 7. Sample Orders & Studio Bookings (Dihapus/Biarkan Kosong)
  // ============================================
  console.log("🗓️  Schedules & bookings left completely empty.");

  // ============================================
  // 8. Testimonials
  // ============================================
  console.log("⭐ Creating testimonials...");
  const testimonials = [
    { userId: user2.id, text: "Hasil foto wedding kami luar biasa! Tim fotografer sangat profesional dan sabar mengarahkan pose. Sangat puas dengan hasilnya.", rating: 5 },
    { userId: user3.id, text: "Sudah beberapa kali sewa kamera di sini. Peralatan selalu dalam kondisi prima dan pelayanannya sangat ramah. Highly recommended!", rating: 5 },
    { userId: user4.id, text: "Studio-nya keren banget, lengkap dengan lighting profesional. Cocok banget untuk photoshoot produk brand kami. Pasti balik lagi!", rating: 5 },
    { userId: user5.id, text: "Koleksi lensa dan kameranya lengkap. Proses rentalnya juga mudah dan cepat. Solusi terbaik untuk project video saya.", rating: 5 },
    { userId: user2.id, text: "Paket prewedding-nya worth it banget! Fotografernya kreatif, MUA-nya juga bagus. Hasilnya melebihi ekspektasi.", rating: 5 },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`  ✓ ${testimonials.length} testimonials created`);

  // ============================================
  // 9. Portfolio
  // ============================================
  console.log("🖼️  Creating portfolio...");
  const portfolios = [
    { title: "Wedding Anisa & Reza", category: "Wedding", image: "/portfolio-wedding.png", isFeatured: true },
    { title: "Luxury Cosmetics Shoot", category: "Product", image: "/portfolio-product.png", isFeatured: true },
    { title: "Urban Fashion Editorial", category: "Fashion", image: "/portfolio-fashion.png", isFeatured: true },
    { title: "Studio Portrait Session", category: "Portrait", image: "/studio-rental.png", isFeatured: true },
    { title: "Golden Hour Portraits", category: "Portrait", image: "/photo-service.png", isFeatured: true },
    { title: "Camera Gear Collection", category: "Product", image: "/camera-rental.png", isFeatured: false },
  ];

  for (const p of portfolios) {
    await prisma.portfolio.create({ data: p });
  }
  console.log(`  ✓ ${portfolios.length} portfolio items created`);

  // ============================================
  // 10. Contact Messages
  // ============================================
  console.log("💬 Creating contact messages...");
  const messages = [
    { name: "Sarah Putri", phone: "082112345678", service: "Sewa Kamera", message: "Halo, saya ingin sewa Canon R5 untuk tanggal 20-22 April. Apakah masih tersedia? Terima kasih." },
    { name: "Ahmad Fauzi", email: "ahmad@gmail.com", phone: "081398765432", service: "Jasa Fotografi", message: "Mohon info untuk paket dokumentasi event kantor tanggal 25 April untuk 200 orang. Budget sekitar 5 juta." },
    { name: "Lisa Permata", phone: "085612345678", service: "Sewa Studio", message: "Mau booking Studio C untuk content creation brand fashion saya. Bisa tanggal 17 April jam 10-14?" },
  ];

  for (const m of messages) {
    await prisma.contactMessage.create({ data: m });
  }
  console.log(`  ✓ ${messages.length} contact messages created`);

  // ============================================
  // 11. Settings
  // ============================================
  console.log("⚙️  Creating settings...");
  const settings = [
    { key: "site_name", value: "FOKUS" },
    { key: "site_description", value: "Sewa Kamera, Studio & Jasa Fotografi Profesional" },
    { key: "contact_phone", value: "+62 812-3456-7890" },
    { key: "contact_email", value: "hello@fokus.id" },
    { key: "contact_address", value: "Jl. Fotografi No. 42, Jakarta Selatan" },
    { key: "operating_hours", value: "Senin - Sabtu, 09:00 - 21:00" },
    { key: "instagram", value: "https://instagram.com/fokus.id" },
    { key: "tiktok", value: "https://tiktok.com/@fokus.id" },
    { key: "youtube", value: "https://youtube.com/@fokus.id" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} settings created`);

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
