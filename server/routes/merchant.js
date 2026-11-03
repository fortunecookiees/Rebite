const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db');

const router = express.Router();
const CATEGORIES = ['Roti & Pastry', 'Nasi & Lauk', 'Kue & Dessert', 'Minuman', 'Snack'];
const SELECT_PRODUCT = `SELECT id, merchant_id, name, category, description, photo_url,
  normal_price, discount_price, stock, pickup_deadline, created_at, updated_at
  FROM products`;

// TODO integrasi dengan middleware autentikasi Della: merchantId harus berasal dari req.user.id,
// bukan dari parameter URL. Pemeriksaan role di bawah belum menggantikan autentikasi.
async function requireMerchant(req, res, next) {
  const merchantId = Number(req.params.merchantId);
  if (!Number.isInteger(merchantId) || merchantId < 1) {
    return res.status(400).json({ message: 'ID merchant tidak valid' });
  }
  try {
    const [rows] = await db.query("SELECT id FROM users WHERE id = ? AND role = 'merchant'", [merchantId]);
    if (!rows.length) return res.status(403).json({ message: 'Akun merchant tidak ditemukan' });
    req.merchantId = merchantId;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Gagal memverifikasi merchant', error: err.message });
  }
}

function validateProduct(body) {
  const name = String(body.name || '').trim();
  const category = String(body.category || '');
  const description = String(body.description || '').trim();
  const normalPrice = Number(body.normal_price);
  const discountPrice = Number(body.discount_price);
  const stock = Number(body.stock);
  const deadline = String(body.pickup_deadline || '').trim();
  if (!name || name.length > 100) return 'Nama produk wajib diisi (maksimal 100 karakter)';
  if (!CATEGORIES.includes(category)) return 'Kategori produk tidak valid';
  if (!Number.isInteger(normalPrice) || normalPrice <= 0) return 'Harga normal harus berupa angka bulat lebih dari 0';
  if (!Number.isInteger(discountPrice) || discountPrice <= 0 || discountPrice >= normalPrice) return 'Harga diskon harus lebih dari 0 dan lebih rendah dari harga normal';
  if (!Number.isInteger(stock) || stock < 0) return 'Stok harus berupa bilangan bulat minimal 0';
  if (!deadline || Number.isNaN(new Date(deadline).getTime()) || new Date(deadline).getTime() <= Date.now()) return 'Batas pickup harus berupa waktu yang masih akan datang';
  if (description.length > 5000) return 'Deskripsi maksimal 5000 karakter';
  return null;
}

function values(body) {
  return [String(body.name).trim(), body.category, String(body.description || '').trim() || null,
    body.photo_url || null, Number(body.normal_price), Number(body.discount_price), Number(body.stock),
    String(body.pickup_deadline).replace('T', ' ') + (String(body.pickup_deadline).length === 16 ? ':00' : '')];
}

router.use('/:merchantId', requireMerchant);

// GET /api/merchant/:merchantId/dashboard
router.get('/:merchantId/dashboard', async (req, res) => {
  try {
    const id = req.merchantId;
    const [[productStats]] = await db.query(`SELECT COUNT(*) AS total_products,
      SUM(stock > 0 AND pickup_deadline > NOW()) AS available_products,
      COALESCE(SUM(stock), 0) AS total_stock FROM products WHERE merchant_id = ?`, [id]);
    const [[orderStats]] = await db.query(`SELECT COUNT(*) AS total_orders,
      SUM(status = 'Pesanan Baru') AS new_orders,
      SUM(status = 'Siap Diambil') AS ready_orders,
      SUM(status = 'Selesai') AS completed_orders,
      COALESCE(SUM(CASE WHEN status = 'Selesai' THEN total ELSE 0 END), 0) AS completed_revenue
      FROM orders WHERE merchant_id = ?`, [id]);
    const [recentOrders] = await db.query(`SELECT o.id, o.order_code, o.total, o.status, o.created_at,
      u.name AS consumer_name FROM orders o JOIN users u ON u.id = o.consumer_id
      WHERE o.merchant_id = ? ORDER BY o.created_at DESC LIMIT 5`, [id]);
    const [merchantRows] = await db.query('SELECT business_name FROM users WHERE id = ?', [id]);
    res.json({ merchant_name: merchantRows[0].business_name, products: productStats, orders: orderStats, recent_orders: recentOrders });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard', error: err.message });
  }
});

// GET /api/merchant/:merchantId/products
router.get('/:merchantId/products', async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_PRODUCT} WHERE merchant_id = ? ORDER BY created_at DESC`, [req.merchantId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk merchant', error: err.message });
  }
});

// POST /api/merchant/:merchantId/products
router.post('/:merchantId/products', async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const [result] = await db.query(`INSERT INTO products
      (merchant_id, name, category, description, photo_url, normal_price, discount_price, stock, pickup_deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.merchantId, ...values(req.body)]);
    const [rows] = await db.query(`${SELECT_PRODUCT} WHERE id = ? AND merchant_id = ?`, [result.insertId, req.merchantId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan produk', error: err.message });
  }
});

// PUT /api/merchant/:merchantId/products/:productId
router.put('/:merchantId/products/:productId', async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId < 1) return res.status(400).json({ message: 'ID produk tidak valid' });
  try {
    const [result] = await db.query(`UPDATE products SET name=?, category=?, description=?, photo_url=?,
      normal_price=?, discount_price=?, stock=?, pickup_deadline=? WHERE id=? AND merchant_id=?`,
      [...values(req.body), productId, req.merchantId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    const [rows] = await db.query(`${SELECT_PRODUCT} WHERE id = ? AND merchant_id = ?`, [productId, req.merchantId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui produk', error: err.message });
  }
});

// DELETE /api/merchant/:merchantId/products/:productId
router.delete('/:merchantId/products/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId < 1) return res.status(400).json({ message: 'ID produk tidak valid' });
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ? AND merchant_id = ?', [productId, req.merchantId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'Produk sudah memiliki riwayat pesanan, jadi tidak dapat dihapus. Ubah stok menjadi 0 agar tidak tampil di katalog.' });
    res.status(500).json({ message: 'Gagal menghapus produk', error: err.message });
  }
});

// Upload foto tanpa dependensi tambahan: client mengirim raw image/*.
router.put('/:merchantId/photo', async (req, res) => {
  const type = req.headers['content-type'] || '';
  const allowed = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
  if (!allowed[type]) return res.status(415).json({ message: 'Format foto harus JPG, PNG, atau WebP' });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ message: 'File foto kosong' });
  if (req.body.length > 5 * 1024 * 1024) return res.status(413).json({ message: 'Ukuran foto maksimal 5 MB' });
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `merchant-${req.merchantId}-${Date.now()}${allowed[type]}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.body);
    res.status(201).json({ photo_url: `/uploads/${filename}` });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan foto', error: err.message });
  }
});

module.exports = router;
