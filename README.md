# Fokus Studio & Rental Platform

Fokus Studio & Rental adalah aplikasi web modern berbasis Next.js untuk penyewaan studio foto, kamera, lensa, serta penyewaan jasa fotografer secara online. Aplikasi ini dilengkapi sistem verifikasi ketersediaan studio secara real-time, validasi stok sewa alat, payment gateway simulator, dan dasbor analitik keuangan.

---

## 🚀 Fitur Utama

1. **Kalender Ketersediaan Studio**: Menghindari tabrakan waktu sewa dengan jeda sterilisasi *cooldown* 30 menit.
2. **Validasi Stok Alat**: Mengontrol kuantitas sewa kamera/lensa berdasarkan tanggal overlapping.
3. **Cart Drawer Terintegrasi**: Keranjang belanja modular di sidebar global.
4. **Simulator Webhook Pembayaran**: Simulasi VA bank dan QRIS dengan instant update database via webhook.
5. **Ulasan & Rating Bintang**: Mengumpulkan umpan balik klien untuk ditampilkan dinamis di beranda depan.
6. **Laporan Keuangan & Grafik SVG**: Dashboard grafik interaktif dan tombol ekspor data transaksi ke spreadsheet CSV.

> [!NOTE]
> Untuk dokumentasi detail mekanisme kerja backend dan alur klien dari setiap fitur, silakan baca [FITUR.md](./FITUR.md).

---

## 🛠️ Tech Stack & Prasyarat

* **Frontend & Backend**: Next.js 15 (App Router), React, TailwindCSS
* **Database & ORM**: SQLite & Prisma ORM
* **State Management**: React Context (Auth, Cart)
* **Animasi**: IntersectionObserver Reveal Component
* **Runtime**: Node.js v18+

---

## 📦 Cara Inisiasi & Instalasi (Setup)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di lingkungan lokal Anda:

### 1. Klon Repositori & Instal Dependensi
```bash
# Clone repository
git clone https://github.com/mczaq/Fokus.git
cd Fokus

# Instal paket modul
npm install
```

### 2. Konfigurasi Environment Variable
Buat berkas `.env` di direktori utama (jika belum ada) dan sesuaikan konfigurasi environment:
```env
# Koneksi Database
DATABASE_URL="mysql://capture_user:password123@localhost:3306/capture"

# Kredensial Google OAuth 2.0 (Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### 💡 Mengaktifkan Fitur Google Sign-In (Login via Gmail)
Untuk mengaktifkan fungsionalitas Google Sign-In pada halaman Login & Registrasi:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Buka menu **APIs & Services > Credentials**.
4. Klik **Create Credentials** dan pilih **OAuth client ID**.
5. Konfigurasikan **OAuth consent screen** (pilih User Type: *External*, isi informasi dasar).
6. Pada jenis aplikasi, pilih **Web application**.
7. Tambahkan URL pengujian lokal Anda pada bagian:
   * **Authorized JavaScript origins**: `http://localhost:3000`
   * **Authorized redirect URIs**: `http://localhost:3000`
8. Salin **Client ID** yang dibuat (berformat `xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
9. Ubah nilai variabel `NEXT_PUBLIC_GOOGLE_CLIENT_ID` di dalam file `.env` Anda dengan Client ID tersebut.
10. Restart dev server (`npm run dev`). Halaman login & daftar kini otomatis mengaktifkan integrasi Google secara langsung.

### 3. Migrasi Database & Seeding Data
Jalankan perintah Prisma untuk membuat tabel database SQLite dan mengisi data awal (dummy/seed data):
```bash
# Sinkronisasi schema Prisma ke SQLite
npx prisma migrate dev --name init

# Jalankan seeder database
npx prisma db seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi berjalan.

---

## 🔑 Demo Akun Pengujian

Gunakan akun demo berikut pada halaman login untuk menguji berbagai akses level:

| Peran (Role) | Email | Password | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fokus.id` | `admin123` | Melihat grafik keuntungan SVG, mengekspor laporan keuangan CSV, dan mengelola order. |
| **User** | `user@fokus.id` | `user123` | Simulasi booking studio, memilih sewa alat, checkout, melakukan pembayaran VA/QRIS, dan memberi ulasan bintang. |
| **Super User** | `super@fokus.id` | `super123` | Mengakses metrik status server internal. |

---

## 🗂️ Struktur Direktori Utama

* `/app` - Halaman utama Next.js, API Route handler, dan Context Providers.
* `/app/components` - Komponen UI reusable (Navbar, CartDrawer, PaymentSimulator, dll).
* `/app/dashboard` - Antarmuka halaman Dashboard khusus User dan Admin.
* `/prisma` - Berkas konfigurasi skema Prisma (`schema.prisma`) dan skrip generator dummy data (`seed.ts`).
* `/public` - Aset gambar statis, ikon, dan berkas statis lainnya.
