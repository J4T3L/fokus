# Dokumentasi Detail Fitur - Fokus Studio & Rental

Dokumen ini berisi detail teknis dan alur kerja (workflow) untuk seluruh fitur yang ada pada platform **Fokus Studio & Rental**.

---

## 1. Kalender Ketersediaan Studio (Studio Availability Calendar)
Sistem penjadwalan studio foto yang mencegah tabrakan jadwal pemesanan secara otomatis.

* **Alur Klien**: 
  1. Klien masuk ke halaman booking studio.
  2. Memilih tanggal sewa melalui date picker.
  3. Sistem memicu pemanggilan API ketersediaan untuk tanggal tersebut.
  4. Jam/slot yang sudah dipesan oleh orang lain akan dinonaktifkan (disabled) dengan indikator visual merah.
  5. Klien hanya dapat memilih slot jam yang kosong (ditandai warna hijau/transparan).
* **Validasi Server**:
  * API: `GET` [app/api/bookings/availability/route.ts](file:///home/superbia/Website/capture/app/api/bookings/availability/route.ts)
  * Menghitung irisan waktu sewa aktif dan menyisipkan jeda pendinginan (*cooldown*) selama 30 menit antar sesi pemesanan untuk proses sterilisasi studio.
* **Status Pemesanan**: `PENDING` -> `CONFIRMED` -> `IN_USE` -> `COMPLETED`.

---

## 2. Validasi Stok Kamera & Alat (Equipment Stock Validation)
Sistem pembatas kuantitas sewa kamera/lensa berdasarkan ketersediaan fisik barang di gudang pada tanggal tertentu.

* **Alur Klien**:
  1. Klien memasukkan kamera/lensa ke keranjang belanja dan menentukan tanggal mulai & selesai sewa.
  2. Saat menekan tombol checkout, sistem melakukan verifikasi ke server.
* **Validasi Server**:
  * API: `POST` [app/api/orders/route.ts](file:///home/superbia/Website/capture/app/api/orders/route.ts)
  * Logika pencarian stok terpakai:
    $$\text{Status Order} \notin \{\text{CANCELLED}, \text{COMPLETED}\}$$
    $$\text{Tanggal Sewa Overlap: } \text{order.startDate} \le \text{requested.endDate} \land \text{order.endDate} \ge \text{requested.startDate}$$
  * Menjumlahkan seluruh kuantitas alat sejenis yang sedang disewa pada tanggal tersebut.
  * Jika $(\text{Stok Terpakai} + \text{Jumlah Diminta}) > \text{Stok Fisik Gudang}$, server mengembalikan status code `400` dengan pesan peringatan terperinci mengenai alat mana yang melebihi batas kuota.

---

## 3. Cart Drawer Terintegrasi (Global Cart Drawer)
Keranjang belanja dinamis berbasis sidebar yang dapat diakses langsung dari mana saja.

* **Fitur Utama**:
  * Diintegrasikan langsung pada [app/components/Navbar.tsx](file:///home/superbia/Website/capture/app/components/Navbar.tsx).
  * Menampilkan ringkasan kamera, lensa, dan jasa fotografer yang dipilih beserta rentang tanggal sewa.
  * Pembaruan kuantitas barang secara instan (real-time increment/decrement).
  * Perhitungan subtotal tagihan otomatis tanpa memuat ulang halaman (*zero-refresh layout*).

---

## 4. Simulator Payment Gateway (Mock Gateway Checkout)
Simulasi pembayaran tagihan instan untuk meniru alur integrasi payment gateway produksi (seperti Midtrans Snap).

* **Alur Klien**:
  1. Klien membuka halaman *Orders & Bookings* di dashboard mereka.
  2. Pada pesanan berstatus *Menunggu Pembayaran*, muncul tombol **Pay Now**.
  3. Tombol membuka modal checkout interaktif ([PaymentSimulator.tsx](file:///home/superbia/Website/capture/app/components/PaymentSimulator.tsx)).
  4. Pilihan metode pembayaran:
     * **Virtual Account Bank (BCA / Mandiri)**: Menghasilkan nomor VA otomatis berdasarkan ID Pesanan dan menampilkan petunjuk transfer.
     * **QRIS**: Menampilkan pola kode QR simulasi dinamis.
  5. Tombol pengujian **"Bayar Sekarang (Simulasi)"** mengirimkan POST ke endpoint webhook backend.
* **Integrasi Backend Webhook**:
  * API: `POST` [app/api/payments/webhook/route.ts](file:///home/superbia/Website/capture/app/api/payments/webhook/route.ts)
  * Memproses payload simulator, mengubah status order menjadi `PROCESSING` (atau `CONFIRMED` untuk studio booking), dan mencatat rekaman payment berstatus `CONFIRMED` di database.
  * Menampilkan layar centang hijau sukses dan memperbarui antarmuka pengguna secara otomatis.

---

## 5. Sistem Ulasan & Testimoni Dinamis (Testimonials & Rating)
Fitur umpan balik bintang bagi klien pasca sewa untuk membangun reputasi platform.

* **Alur Klien**:
  1. Pesanan yang statusnya diubah oleh admin menjadi *Selesai* (*COMPLETED*) akan memunculkan tombol **★ Beri Ulasan**.
  2. Mengaktifkan modal ulasan interaktif ([ReviewModal.tsx](file:///home/superbia/Website/capture/app/components/ReviewModal.tsx)) dengan pilihan 1 hingga 5 bintang.
  3. Klien memasukkan komentar teks dan mengirimkannya ke server.
* **Integrasi Database & Homepage**:
  * API: [app/api/testimonials/route.ts](file:///home/superbia/Website/capture/app/api/testimonials/route.ts)
  * Ulasan yang dikirimkan langsung tersimpan ke database.
  * Halaman depan / Landing Page ([app/components/Testimonials.tsx](file:///home/superbia/Website/capture/app/components/Testimonials.tsx)) secara otomatis melakukan pemuatan ulasan dari database secara dinamis. Jika belum ada ulasan di database, sistem menggunakan 3 testimoni default sebagai fallback.

---

## 6. Laporan Keuangan & Grafik SVG Admin (Financial Analytics)
Panel kendali laporan keuangan khusus admin untuk memantau performa bisnis secara visual dan mengunduh rekaman transaksi.

* **Grafik Pendapatan SVG**:
  * Dibuat menggunakan SVG murni tanpa dependensi library eksternal (menjaga performa tetap ringan).
  * Menggambar diagram garis perkembangan keuntungan bulanan secara otomatis berdasarkan 6 bulan terakhir.
  * Dilengkapi titik data (*markers*), label nominal (dalam jutaan rupiah), serta area gradien halus oranye di bawah garis grafik.
* **Ekspor CSV Keuangan**:
  * Tombol sekali klik **"Unduh Laporan (.csv)"** pada dashboard admin.
  * Mengekspor ID transaksi, nama penyewa, tanggal transaksi, kategori layanan, serta nilai rupiah nominal sewa.
  * Menyertakan UTF-8 BOM agar file CSV dapat dibuka di Microsoft Excel komputer lokal tanpa mengalami masalah pemisah kolom (separator).

---

## 7. Fitur Ganti Password Akun (Account Password Settings)
Fitur keamanan terenkripsi bagi pengguna untuk memperbarui kata sandi mereka secara langsung dari profil pengaturan.

* **Alur Klien**:
  1. Pengguna masuk ke halaman **Settings** di dasbor.
  2. Pada panel **Keamanan & Sandi**, isi kolom kata sandi lama, kata sandi baru, dan konfirmasi kata sandi baru.
  3. Klik **Simpan Sandi**. Pesan sukses atau gagal akan dimuat secara dinamis.
* **Validasi Server**:
  * API: `POST` [app/api/auth/change-password/route.ts](file:///home/superbia/Website/capture/app/api/auth/change-password/route.ts)
  * Memvalidasi bahwa password lama yang dimasukkan cocok dengan password terenkripsi di database menggunakan `bcryptjs.compare`.
  * Memastikan password baru memiliki panjang minimal 6 karakter.
  * Mengenkripsi password baru menggunakan salt rounds sebanyak 10 tingkat sebelum menyimpan pembaruan ke database.

