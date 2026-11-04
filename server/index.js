const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
// Foto merchant dikirim sebagai raw image/*, maksimal 5 MB.
app.use('/api/merchant', express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Cek server & koneksi database
app.get('/api', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM products');
    res.json({ message: 'ReBite API jalan', total_products: rows[0].total });
  } catch (err) {
    res.status(500).json({ message: 'Gagal konek ke database', error: err.message });
  }
});

// Route tiap anggota didaftarin di sini
app.use('/api/products', require('./routes/products')); // Fortuna: katalog
app.use('/api/merchant', require('./routes/merchant')); // Dina: dashboard & produk merchant
app.use('/api/orders', require('./routes/orders')); // Vanesa: pesanan konsumen & merchant

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
