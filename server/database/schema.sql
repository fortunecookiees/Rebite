-- ReBite database
-- Import lewat phpMyAdmin: tab Import -> pilih file ini -> Go

CREATE DATABASE IF NOT EXISTS rebite;
USE rebite;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Della: autentikasi & akun
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- hash bcrypt
  role ENUM('konsumen', 'merchant') NOT NULL,
  phone VARCHAR(20),
  business_name VARCHAR(100),              -- khusus merchant
  address VARCHAR(255),                    -- khusus merchant (lokasi usaha)
  area VARCHAR(50),                        -- contoh: Tanjung Duren, Grogol
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dina: produk merchant
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  merchant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('Roti & Pastry', 'Nasi & Lauk', 'Kue & Dessert', 'Minuman', 'Snack') NOT NULL,
  description TEXT,
  photo_url VARCHAR(255),
  normal_price INT NOT NULL,
  discount_price INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  pickup_deadline DATETIME NOT NULL,       -- batas waktu pengambilan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Syr & Vanes: pesanan (bayar di tempat saat pickup)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,  -- ditunjukkan saat pickup
  consumer_id INT NOT NULL,
  merchant_id INT NOT NULL,
  subtotal INT NOT NULL,
  service_fee INT NOT NULL DEFAULT 1000,
  total INT NOT NULL,
  status ENUM('Pesanan Baru', 'Siap Diambil', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Pesanan Baru',
  cancel_reason VARCHAR(255),
  pickup_deadline DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consumer_id) REFERENCES users(id),
  FOREIGN KEY (merchant_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,      -- disimpan biar riwayat aman kalau produk dihapus
  price INT NOT NULL,                      -- harga diskon saat dipesan
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================================================
-- DATA CONTOH
-- Semua akun password-nya: password123
-- =========================================================

INSERT INTO users (id, name, email, password, role, phone, business_name, address, area) VALUES
(1, 'Andi Pratama', 'andi@mail.com', '$2b$10$gTUrP1qDUEDv23U7dI4lfOlH/bXsGwboK9MxoJmqFozEg7.32qJ2K', 'konsumen', '081234567801', NULL, NULL, 'Grogol'),
(2, 'Rina Wijaya', 'roti@mail.com', '$2b$10$gTUrP1qDUEDv23U7dI4lfOlH/bXsGwboK9MxoJmqFozEg7.32qJ2K', 'merchant', '081234567802', 'Roti Pagi Bakery', 'Jl. Tanjung Duren Raya No. 12', 'Tanjung Duren'),
(3, 'Budi Santoso', 'kopi@mail.com', '$2b$10$gTUrP1qDUEDv23U7dI4lfOlH/bXsGwboK9MxoJmqFozEg7.32qJ2K', 'merchant', '081234567803', 'Kopi Seberang', 'Jl. Kyai Tapa No. 45', 'Grogol'),
(4, 'Siti Aminah', 'warung@mail.com', '$2b$10$gTUrP1qDUEDv23U7dI4lfOlH/bXsGwboK9MxoJmqFozEg7.32qJ2K', 'merchant', '081234567804', 'Warung Bu Siti', 'Jl. Jelambar Baru No. 8', 'Jelambar');

-- Batas pickup dibuat relatif dari waktu import, jadi produk masih tampil.
-- Kalau sudah lewat, import ulang file ini.
INSERT INTO products (merchant_id, name, category, description, photo_url, normal_price, discount_price, stock, pickup_deadline) VALUES
(2, 'Roti Sobek Cokelat', 'Roti & Pastry', 'Roti sobek isi cokelat, dipanggang pagi ini.', NULL, 28000, 15000, 6, DATE_ADD(NOW(), INTERVAL 4 HOUR)),
(2, 'Croissant Butter', 'Roti & Pastry', 'Croissant butter renyah, sisa produksi hari ini.', NULL, 22000, 12000, 8, DATE_ADD(NOW(), INTERVAL 4 HOUR)),
(2, 'Donat Gula Isi 3', 'Kue & Dessert', 'Paket 3 donat gula halus.', NULL, 18000, 9000, 5, DATE_ADD(NOW(), INTERVAL 3 HOUR)),
(3, 'Banana Bread Slice', 'Kue & Dessert', 'Potongan banana bread dengan walnut.', NULL, 25000, 13000, 4, DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(3, 'Es Kopi Susu Literan', 'Minuman', 'Kopi susu gula aren 1 liter, dibuat hari ini.', NULL, 65000, 39000, 3, DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(3, 'Sandwich Tuna', 'Snack', 'Sandwich tuna mayo, simpan di kulkas.', NULL, 32000, 18000, 5, DATE_ADD(NOW(), INTERVAL 3 HOUR)),
(4, 'Nasi Ayam Bakar', 'Nasi & Lauk', 'Nasi, ayam bakar, sambal, dan lalapan.', NULL, 30000, 17000, 7, DATE_ADD(NOW(), INTERVAL 5 HOUR)),
(4, 'Nasi Rendang', 'Nasi & Lauk', 'Nasi putih dengan rendang sapi dan sayur.', NULL, 35000, 20000, 4, DATE_ADD(NOW(), INTERVAL 5 HOUR)),
-- dua produk ini sengaja TIDAK boleh tampil di katalog (buat ngetes filter)
(4, 'Tahu Isi (habis)', 'Snack', 'Stok sudah habis.', NULL, 15000, 8000, 0, DATE_ADD(NOW(), INTERVAL 5 HOUR)),
(2, 'Roti Tawar (lewat waktu)', 'Roti & Pastry', 'Batas pickup sudah lewat.', NULL, 20000, 10000, 5, DATE_SUB(NOW(), INTERVAL 1 HOUR));
