# ReBite

Website tugas akhir Technopreneurship (Universitas Tarumanagara). ReBite mempertemukan merchant makanan (cafe, bakery, restoran) yang punya makanan surplus dengan konsumen (mahasiswa/pekerja muda 18–35 tahun) yang mau beli makanan layak konsumsi dengan harga diskon. Tagline: "Good food deserves another bite".

## Alur bisnis
- Merchant upload makanan surplus: nama, foto, kategori, jumlah porsi, harga normal, harga diskon, batas waktu pengambilan.
- Konsumen cari dan filter makanan (kategori, harga, lokasi), lihat detail, masukkan ke keranjang.
- Checkout: total = (harga diskon × jumlah) + biaya layanan Rp1.000. Stok langsung berkurang, sistem membuat kode pesanan, status "Pesanan Baru".
- Tidak ada pembayaran online dan tidak ada delivery. Konsumen datang ke merchant sebelum batas waktu, tunjukkan kode pesanan, lalu bayar di tempat.
- Merchant mengubah status: Pesanan Baru → Siap Diambil → Selesai.

### Kondisi khusus
- Stok habis atau batas waktu pickup lewat → produk tidak tampil di katalog.
- Merchant tidak bisa memenuhi pesanan → status "Dibatalkan", stok dikembalikan.
- Konsumen tidak datang sampai batas waktu → status "Dibatalkan".

## Stack
- client/: React (Vite, JavaScript), react-router-dom, Tailwind CSS v4, motion (animasi), embla-carousel-react (carousel)
- server/: Node.js + Express, mysql2 (query SQL biasa, pakai placeholder ?)
- Database: MySQL lewat XAMPP. Schema + data contoh di server/database/schema.sql
- Vite proxy meneruskan /api dan /uploads ke http://localhost:5000

## Database
- users: id, name, email, password (bcrypt), role ('konsumen' | 'merchant'), phone, business_name, address, area
- products: id, merchant_id → users, name, category, description, photo_url, normal_price, discount_price, stock, pickup_deadline
- orders: id, order_code, consumer_id, merchant_id, subtotal, service_fee, total, status, cancel_reason, pickup_deadline
- order_items: id, order_id, product_id, product_name, price, quantity

Kategori: 'Roti & Pastry', 'Nasi & Lauk', 'Kue & Dessert', 'Minuman', 'Snack'.

## Pembagian tugas (tiap orang FE + BE + DB)
- Della: autentikasi & akun (login, register, profil, logout, role, hash password, batasi akses per role)
- Fortuna: Home & Explore (banner, kategori, rekomendasi, kartu produk, search & filter, hanya produk tersedia)
- Syr: detail produk, keranjang, checkout (hitung total, validasi stok, simpan orders + order_items, kurangi stok secara konsisten)
- Dina: dashboard merchant & kelola produk (CRUD, validasi harga/stok/waktu pickup, upload foto)
- Vanes: My Orders konsumen & Manage Orders merchant (status pesanan, konfirmasi/penolakan, validasi perubahan status)

## Aturan
- Endpoint baru dibuat di server/routes/<nama>.js lalu didaftarkan di server/index.js.
- Halaman baru di client/src/pages/, route didaftarkan di client/src/App.jsx.
- Pakai warna tema dari client/src/index.css (blok @theme, palet Dark Mocha × Caramel), lewat class Tailwind seperti `bg-mocha`, `text-coffee`:
  - `cream` #F8F2E9 (±40%): background utama halaman.
  - `mocha` #49352D (±25%): logo, navbar, footer, heading, tombol utama. `mocha-dark` untuk hover dan teks di atas caramel.
  - `latte` #E7D3BA (±15%): background kartu & section, border tipis.
  - `caramel` #C18B60 (±12%): CTA, stiker diskon, promo, badge. Cuma aksen, jangan jadi background besar.
  - `coffee` #795541 (±8%): teks sekunder, icon, hover.
  - `caramel-dark`: teks harga diskon. `urgent`: merah untuk "waktu hampir habis".
- Kontras: di atas mocha/coffee pakai teks cream; di atas caramel pakai teks mocha-dark (jangan putih atau mocha biasa). Jangan pakai caramel langsung sebagai warna teks, pakai caramel-dark.
- font-display untuk judul.
- Tombol/link yang bisa diklik minimal 44px (`min-h-11`) supaya enak dipakai di HP.
- Animasi pakai `motion/react`. Animasi gerak otomatis mati kalau user set reduce motion (MotionConfig di main.jsx); untuk animasi khusus cek `useReducedMotion()`.
- Teks di UI pakai Bahasa Indonesia.
- Jangan ubah struktur tabel tanpa bilang ke Fortuna, karena dipakai seluruh tim.
- Terminal Windows PowerShell versi lama: jangan pakai &&, pisah perintah per baris.
