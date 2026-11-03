const express = require('express');
const db = require('../db');

const router = express.Router();

// Kolom yang dikirim ke frontend (produk + info merchant)
const SELECT_PRODUCT = `
  SELECT
    p.id, p.name, p.category, p.description, p.photo_url,
    p.normal_price, p.discount_price, p.stock, p.pickup_deadline,
    ROUND((p.normal_price - p.discount_price) / p.normal_price * 100) AS discount_percent,
    u.id AS merchant_id, u.business_name AS merchant_name,
    u.address AS merchant_address, u.area AS merchant_area
  FROM products p
  JOIN users u ON u.id = p.merchant_id
`;

// Produk dianggap tersedia kalau stok masih ada dan batas pickup belum lewat
const AVAILABLE = 'p.stock > 0 AND p.pickup_deadline > NOW()';

// GET /api/products
// Query opsional: ?search=roti&category=Minuman&min_price=5000&max_price=20000&sort=cheapest
router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, sort } = req.query;

    const conditions = [AVAILABLE];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR u.business_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }
    if (min_price) {
      conditions.push('p.discount_price >= ?');
      params.push(Number(min_price));
    }
    if (max_price) {
      conditions.push('p.discount_price <= ?');
      params.push(Number(max_price));
    }

    const orderBy = {
      cheapest: 'p.discount_price ASC',
      discount: 'discount_percent DESC',
      deadline: 'p.pickup_deadline ASC',
    }[sort] || 'p.created_at DESC';

    const sql = `${SELECT_PRODUCT} WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: err.message });
  }
});

// GET /api/products/recommended
// Rekomendasi di Home: diskon terbesar, yang batas pickup-nya paling dekat didahulukan
router.get('/recommended', async (req, res) => {
  try {
    const sql = `${SELECT_PRODUCT} WHERE ${AVAILABLE}
      ORDER BY discount_percent DESC, p.pickup_deadline ASC
      LIMIT 4`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil rekomendasi', error: err.message });
  }
});

// GET /api/products/categories
// Daftar kategori + jumlah produk yang tersedia
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.category, COUNT(*) AS total FROM products p
       WHERE ${AVAILABLE} GROUP BY p.category ORDER BY p.category`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: err.message });
  }
});

module.exports = router;
