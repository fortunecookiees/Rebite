const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();
const SERVICE_FEE = 1000;

// POST /api/orders — harga dan stok selalu diverifikasi ulang di server.
router.post('/', async (req, res) => {
  // Gunakan ID konsumen dari sesi frontend; akun demo dipakai sebagai fallback sampai autentikasi terintegrasi.
  const consumerId = Number(req.body.consumer_id) || 1;
  const rawItems = req.body.items;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ message: 'Keranjang masih kosong.' });
  }

  const quantities = new Map();
  for (const item of rawItems) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: 'Produk atau jumlah pesanan tidak valid.' });
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [consumers] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND role = 'konsumen' FOR UPDATE", [consumerId]
    );
    if (!consumers.length) {
      await connection.rollback();
      return res.status(403).json({ message: 'Akun konsumen tidak ditemukan.' });
    }

    const ids = [...quantities.keys()];
    const placeholders = ids.map(() => '?').join(',');
    const [products] = await connection.query(
      `SELECT p.id, p.name, p.merchant_id, p.discount_price, p.stock, p.pickup_deadline,
              u.business_name AS merchant_name
       FROM products p JOIN users u ON u.id = p.merchant_id
       WHERE p.id IN (${placeholders}) FOR UPDATE`, ids
    );

    if (products.length !== ids.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Ada produk yang sudah tidak tersedia. Muat ulang keranjang.' });
    }

    const merchantIds = new Set(products.map((p) => Number(p.merchant_id)));
    if (merchantIds.size !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'Checkout hanya dapat dilakukan untuk produk dari satu merchant. Pisahkan keranjang berdasarkan merchant.' });
    }

    let subtotal = 0;
    let pickupDeadline = products[0].pickup_deadline;
    const orderItems = [];
    for (const product of products) {
      const quantity = quantities.get(Number(product.id));
      if (Number(product.stock) < quantity) {
        await connection.rollback();
        return res.status(409).json({ message: `Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}.` });
      }
      if (new Date(product.pickup_deadline.replace(' ', 'T')) <= new Date()) {
        await connection.rollback();
        return res.status(409).json({ message: `${product.name} sudah melewati batas waktu pickup.` });
      }
      const price = Number(product.discount_price);
      subtotal += price * quantity;
      if (new Date(product.pickup_deadline.replace(' ', 'T')) < new Date(pickupDeadline.replace(' ', 'T'))) {
        pickupDeadline = product.pickup_deadline;
      }
      orderItems.push({ product_id: product.id, product_name: product.name, price, quantity });
    }

    const serviceFee = SERVICE_FEE;
    const total = subtotal + serviceFee;
    const orderCode = `RB${Date.now().toString().slice(-8)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`.slice(0, 20);
    const merchantId = products[0].merchant_id;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_code, consumer_id, merchant_id, subtotal, service_fee, total, pickup_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderCode, consumerId, merchantId, subtotal, serviceFee, total, pickupDeadline]
    );

    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.product_name, item.price, item.quantity]
      );
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.commit();
    res.status(201).json({
      message: 'Pesanan berhasil dibuat. Pembayaran dilakukan saat pickup.',
      order: {
        id: orderResult.insertId, order_code: orderCode, consumer_id: consumerId,
        merchant_id: merchantId, merchant_name: products[0].merchant_name,
        items: orderItems, subtotal, service_fee: serviceFee, total,
        status: 'Pesanan Baru', pickup_deadline: pickupDeadline,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Pesanan gagal diproses. Silakan coba kembali.' });
  } finally {
    connection.release();
  }
});

// GET /api/orders/:id — detail pesanan untuk halaman konfirmasi.
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'ID pesanan tidak valid.' });
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.order_code, o.consumer_id, o.merchant_id, o.subtotal, o.service_fee,
              o.total, o.status, o.pickup_deadline, o.created_at, u.business_name AS merchant_name,
              u.address AS merchant_address, u.area AS merchant_area
       FROM orders o JOIN users u ON u.id = o.merchant_id WHERE o.id = ?`, [id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    const [items] = await db.query(
      'SELECT product_id, product_name, price, quantity FROM order_items WHERE order_id = ?', [id]
    );
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail pesanan.' });
  }
});

// BAGIAN vanesa: Riwayat Konsumen, Merchant & Update Status
// SISI KONSUMEN: Mengambil riwayat pesanan & Status Pesanan 
router.get('/consumer/:consumerId', async (req, res) => {
    try {
        const { consumerId } = req.params;
        // Mengambil data pesanan beserta info merchant
        const [orders] = await db.query(
            `SELECT o.*, u.business_name, u.address AS merchant_address 
             FROM orders o 
             JOIN users u ON o.merchant_id = u.id 
             WHERE o.consumer_id = ? 
             ORDER BY o.created_at DESC`,
            [consumerId]
        );

        // mengambil detail item barang untuk setiap pesanan
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memuat pesanan konsumen' });
    }
});

// SISI MERCHANT: Mengambil daftar pesanan masuk
router.get('/merchant/:merchantId', async (req, res) => {
    try {
        const { merchantId } = req.params;
        // Mengambil data pesanan masuk beserta info konsumen
        const [orders] = await db.query(
            `SELECT o.*, u.name AS consumer_name, u.phone AS consumer_phone 
             FROM orders o 
             JOIN users u ON o.consumer_id = u.id 
             WHERE o.merchant_id = ? 
             ORDER BY o.created_at DESC`,
            [merchantId]
        );

        // Mengambil detail item barang untuk setiap pesanan
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memuat pesanan merchant' });
    }
});

// Mengupdate status pesanan 
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancel_reason } = req.body; 

        // Validasi status agar sesuai dengan ENUM
        const validStatuses = ['Pesanan Baru', 'Siap Diambil', 'Selesai', 'Dibatalkan'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status pesanan tidak valid!' });
        }
        // Jika status dibatalkan, ada alasan pembatalan
        const reason = status === 'Dibatalkan' ? (cancel_reason || 'Dibatalkan oleh merchant/sistem') : null;

        // Eksekusi update ke tabel orders
        const [result] = await db.query(
            `UPDATE orders SET status = ?, cancel_reason = ?, updated_at = NOW() WHERE id = ?`,
            [status, reason, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan!' });
        }

        res.json({ 
            success: true, 
            message: `Status pesanan berhasil diperbarui menjadi "${status}"` 
        });
    } catch (error) {
        console.error('Error update order status:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status pesanan di database' });
    }
});

module.exports = router;