# Dokumentasi Detail Fitur - Fokus Studio & Rental

Dokumen ini berisi detail teknis dan alur kerja (workflow) untuk seluruh fitur yang ada pada platform **Fokus Studio & Rental**.

---

## 1. User Agreement / EULA Gate (Syarat & Kontrak Rental)
Sistem proteksi persetujuan Kontrak Sewa 4 pasal yang menjamin legalitas sewa sebelum proses pembayaran dan pengunggahan resi.

* **Alur Klien**:
  1. Klien membuka modal pembayaran pada pesanan yang berstatus *Menunggu Pembayaran*.
  2. Klien dapat mengklik link **EULA, Syarat & Kontrak Rental** untuk membuka modal perjanjian lengkap ([app/components/EulaModal.tsx](file:///Users/superbia/Website/fokus/app/components/EulaModal.tsx)).
  3. Klien wajib mengklik kotak centang persetujuan (*checkbox*).
  4. Apabila kotak belum di-centang, input pengunggahan resi bukti transfer dan tombol konfirmasi pembayaran **DIBLOKIR KETAT** (*disabled*).
* **Validasi Server & Database**:
  * API: `POST` [app/api/payments/webhook/route.ts](file:///Users/superbia/Website/fokus/app/api/payments/webhook/route.ts)
  * Menyimpan field `agreementAccepted: true` dan `agreementAcceptedAt: new Date()` pada record `Order`.

---

## 2. Pencatatan Timestamp Actual Pickup & Actual Return (Admin Tracking)
Pencatatan waktu real-time persis saat penyewa mengambil unit di studio dan saat mengembalikan unit.

* **Alur Admin**:
  1. Admin membuka halaman [app/dashboard/rentals/page.tsx](file:///Users/superbia/Website/fokus/app/dashboard/rentals/page.tsx).
  2. Untuk pesanan berstatus *Menunggu Pickup*, tombol **`📦 Catat Actual Pickup (Serahkan)`** mencatat timestamp `actualPickup = new Date()` dan mengubah status menjadi `ACTIVE`.
  3. Untuk pesanan aktif yang dikembalikan, admin menekan tombol **`✅ Terima Pengembalian & Inspeksi`** yang mencatat `actualReturn = new Date()`.
* **Tampilan Timeline**:
  * Menampilkan `Janji Sewa` (periode mengunci inventory), `✓ Actual Pickup`, dan `✓ Actual Return` pada kolom timeline monitoring sewa.

---

## 3. Status OVERDUE & Denda Keterlambatan (Late Fee Payment)
Pendeteksian otomatis keterlambatan pengembalian alat dan penagihan denda per jam.

* **Pendeteksian Server**:
  * API: `GET` [app/api/rentals/route.ts](file:///Users/superbia/Website/fokus/app/api/rentals/route.ts) & [app/api/orders/route.ts](file:///Users/superbia/Website/fokus/app/api/orders/route.ts)
  * Apabila `status == ACTIVE` atau `PROCESSING` dan `endDate < now`, status otomatis dikalkulasi sebagai `OVERDUE` dengan atribut `overdueHours` (jumlah jam keterlambatan).
* **Alur Klien (Bayar Denda)**:
  1. Pada dashboard penyewa ([app/dashboard/orders/page.tsx](file:///Users/superbia/Website/fokus/app/dashboard/orders/page.tsx)), pesanan *OVERDUE* memunculkan badge merah berkedip `🔴 OVERDUE` dan tombol **`💳 Bayar Denda / Fee`**.
  2. Mengaktifkan modal [PayFeeModal.tsx](file:///Users/superbia/Website/fokus/app/components/PayFeeModal.tsx).
  3. Klien dapat memilih metode pembayaran (Transfer Bank + Unggah Resi atau Bayar Tunai di Studio Kasir).
  4. API: `POST` [app/api/orders/[id]/pay-fee/route.ts](file:///Users/superbia/Website/fokus/app/api/orders/[id]/pay-fee/route.ts) mencatat transaksi pembayaran denda dan mengupdate `feeStatus = PAID`.

---

## 4. Fitur Extend Rental (Perpanjang Durasi Sewa)
Opsi fleksibel bagi penyewa untuk memperpanjang durasi sewa alat tanpa perlu membuat pesanan baru dari awal.

* **Alur Klien**:
  1. Klien menekan tombol **`⏳ Extend Rental`** di dashboard penyewa.
  2. Modal [ExtendRentalModal.tsx](file:///Users/superbia/Website/fokus/app/components/ExtendRentalModal.tsx) memuat daftar alat sewa dan tarif harian gabungan.
  3. Klien memilih opsi tambahan hari (+1, +2, +3, +5 hari).
  4. API `POST` [app/api/orders/[id]/extend/route.ts](file:///Users/superbia/Website/fokus/app/api/orders/[id]/extend/route.ts) memperbarui tanggal `endDate` baru dan menambahkan tagihan `extensionFee`.

---

## 5. Form Inspeksi Pengembalian Barang & Pemisahan Laporan Keuangan (Ledger Split)
Penilaian kondisi fisik unit sewa saat dikembalikan dan pemisahan buku kas laporan keuangan.

* **Alur Inspeksi Admin**:
  1. Tombol pengembalian membuka [ReturnInspectionModal.tsx](file:///Users/superbia/Website/fokus/app/components/ReturnInspectionModal.tsx) dengan 3 opsi:
     - 🟢 **Tidak Ada Kerusakan**: Pengembalian normal, status `COMPLETED`.
     - 🔴 **Ada Kerusakan**: Input catatan deskripsi kerusakan & estimasi biaya perbaikan (`damageFee`).
     - ❌ **Barang Hilang**: Menghitung 100% ganti rugi pembelian unit baru (`lossFee`).
* **Pemisahan Laporan Keuangan**:
  * API: `GET` [app/api/finance/route.ts](file:///Users/superbia/Website/fokus/app/api/finance/route.ts) & Halaman [app/dashboard/finance/page.tsx](file:///Users/superbia/Website/fokus/app/dashboard/finance/page.tsx).
  * **📊 Tab 1 (Buku Kas Persewaan Utama)**: Khusus merekam transaksi pendapatan murni sewa alat & studio foto serta refund pengembalian dana pembatalan.
  * **⚠️ Tab 2 (Buku Kas Denda, Kerusakan & Kehilangan)**: Khusus merekam transaksi denda keterlambatan (*overdue*), biaya perpanjangan (*extend*), denda perbaikan kerusakan, dan ganti rugi barang hilang.

---

## 6. Kalender Ketersediaan Studio (Studio Availability Calendar)
Sistem penjadwalan studio foto yang mencegah tabrakan jadwal pemesanan secara otomatis.

* **Alur Klien**: 
  1. Klien masuk ke halaman booking studio.
  2. Memilih tanggal sewa melalui date picker.
  3. Jam/slot yang sudah dipesan oleh orang lain akan dinonaktifkan (disabled) dengan indikator visual merah.
  4. Klien hanya dapat memilih slot jam yang kosong.
* **Validasi Server**:
  * API: `GET` [app/api/bookings/availability/route.ts](file:///Users/superbia/Website/fokus/app/api/bookings/availability/route.ts)
  * Menghitung irisan waktu sewa aktif dan menyisipkan jeda pendinginan (*cooldown*) selama 30 menit antar sesi pemesanan untuk proses sterilisasi studio.

---

## 7. Validasi Stok Kamera & Alat (Equipment Stock Validation)
Sistem pembatas kuantitas sewa kamera/lensa berdasarkan ketersediaan fisik barang di gudang pada tanggal tertentu.

* **Alur Klien**:
  1. Klien memasukkan kamera/lensa ke keranjang belanja dan menentukan tanggal mulai & selesai sewa.
  2. Saat menekan tombol checkout, sistem melakukan verifikasi ke server.
* **Validasi Server**:
  * API: `POST` [app/api/orders/route.ts](file:///Users/superbia/Website/fokus/app/api/orders/route.ts)
  * Logika pencarian stok terpakai pada tanggal overlapping.
  * Jika $(\text{Stok Terpakai} + \text{Jumlah Diminta}) > \text{Stok Fisik Gudang}$, server mengembalikan status code `400` dengan pesan peringatan.

---

## 8. Simulator Payment Gateway & Pembayaran Tunai (Cash)
Simulasi pembayaran tagihan instan untuk meniru alur integrasi payment gateway produksi.

* **Metode Pembayaran**:
  * **Virtual Account Bank (BCA / Mandiri)**: Nomor VA otomatis & instruksi transfer.
  * **QRIS**: Kode QR simulasi dinamis.
  * **💵 Bayar Tunai di Studio (Cash)**: Opsi pembayaran langsung di kasir studio.
* **Unggah Bukti Transfer**:
  * Input upload foto resi bukti transfer (`/api/upload`) wajib dilampirkan untuk pembayaran transfer.
