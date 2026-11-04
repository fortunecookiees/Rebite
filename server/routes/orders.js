const express = require('express');
const router = express.Router();
const db = require('../db');

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