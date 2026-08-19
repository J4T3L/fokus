# Fokus Studio & Rental Platform

Fokus Studio & Rental adalah aplikasi web modern berbasis Next.js untuk penyewaan studio foto, kamera, lensa, serta penyewaan jasa fotografer secara online. Aplikasi ini dilengkapi sistem verifikasi ketersediaan studio secara real-time, validasi stok sewa alat, payment gateway simulator, EULA gate checklist, pencatatan timestamp pickup/return, penanganan keterlambatan (*OVERDUE*), perpanjangan sewa (*Extend Rental*), inspeksi pengembalian barang, dan pemisahan dasbor analitik keuangan.

---

## 🚀 Fitur Utama

1. **User Agreement / EULA Gate**: Modal & checkbox persetujuan Kontrak Sewa 4 pasal (wajib di-centang sebelum mengunggah resi bukti transfer/konfirmasi bayar).
2. **Pencatatan Timestamp Actual Pickup & Actual Return**: Log waktu presisi pencatatan admin saat alat diambil (*pickup*) dan dikembalikan (*return*).
3. **Status OVERDUE & Pembayaran Denda**: Otomatisasi status `OVERDUE` beserta penghitung jam keterlambatan, dan modal bayar denda (Transfer/Cash) untuk penyewa.
4. **Perpanjang Sewa (Extend Rental)**: Opsi fleksibel perpanjangan durasi sewa sekelompok alat dengan akumulasi tarif harian otomatis.
5. **Form Inspeksi Pengembalian Barang**: Penilaian kondisi unit saat dikembalikan: 🟢 *Tidak ada Kerusakan*, 🔴 *Ada Kerusakan* (estimasi perbaikan), ❌ *Barang Hilang* (ganti rugi 100% barang baru).
6. **Pemisahan Laporan Keuangan (Ledger Split)**: Dasbor keuangan terpisah antara **Buku Kas Persewaan Utama** (sewa murni & refund) vs **Buku Kas Denda, Kerusakan & Kehilangan**.
7. **Metode Pembayaran Tunai (Cash)**: Opsi pembayaran langsung di studio kasir disamping Transfer Virtual Account Bank & QRIS.
8. **Kalender Ketersediaan Studio**: Menghindari tabrakan waktu sewa dengan jeda sterilisasi *cooldown* 30 menit.
9. **Validasi Stok Alat**: Mengontrol kuantitas sewa kamera/lensa berdasarkan tanggal overlapping.
10. **Cart Drawer Terintegrasi**: Keranjang belanja modular di sidebar global.
11. **Simulator Webhook Pembayaran & Upload Resi**: Simulasi VA bank, QRIS, & Tunai dengan instant update database via webhook & upload foto bukti transfer.
12. **Ulasan & Rating Bintang**: Mengumpulkan umpan balik klien untuk ditampilkan dinamis di beranda depan.
13. **Laporan Keuangan & Grafik SVG**: Dashboard grafik interaktif dan tombol ekspor data transaksi ke spreadsheet CSV.

> [!NOTE]
> Untuk dokumentasi detail mekanisme kerja backend dan alur klien dari setiap fitur, silakan baca [FITUR.md](./FITUR.md).

---

## 🛠️ Tech Stack & Prasyarat

* **Frontend & Backend**: Next.js (App Router), React, Vanilla CSS / TailwindCSS
* **Database & ORM**: MySQL & Prisma ORM
* **State Management**: React Context (AuthContext)
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
# Koneksi Database MySQL
DATABASE_URL="mysql://root@localhost:3306/fokus"

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
Jalankan perintah Prisma untuk membuat tabel database MySQL dan mengisi data awal (dummy/seed data):
```bash
# Push schema Prisma ke MySQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

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
| **Admin** | `admin@fokus.id` | `admin123` | Mencatat actual pickup/return, memilih inspeksi kondisi barang, melihat laporan keuangan terpisah, mengekspor laporan keuangan CSV, dan mengelola order. |
| **User** | `user@fokus.id` | `user123` | Menyutujui EULA, simulasi booking studio, memilih sewa alat, checkout, mengunggah bukti tf, bayar denda, extend rental, dan memberi ulasan bintang. |
| **Super User** | `super@fokus.id` | `super123` | Mengakses metrik status server internal. |

---

## 🗂️ Struktur Direktori Utama

* `/app` - Halaman utama Next.js, API Route handler, dan Context Providers.
* `/app/components` - Komponen UI reusable (Navbar, PaymentSimulator, EulaModal, ExtendRentalModal, PayFeeModal, ReturnInspectionModal, dll).
* `/app/dashboard` - Antarmuka halaman Dashboard khusus User dan Admin (`/orders`, `/rentals`, `/finance`, `/equipment`, `/studios`, dll).
* `/prisma` - Berkas konfigurasi skema Prisma (`schema.prisma`) dan skrip seeder database (`seed.ts`).
* `/public` - Aset gambar statis, foto upload resi (`/public/uploads`), dan berkas statis lainnya.
