// Semua request pesanan ke backend ada di sini

async function orderRequest(path, options = {}) {
  const res = await fetch(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Permintaan pesanan gagal')
  // Menyesuaikan format respons backend kamu ({ success: true, data: [...] })
  return data.success ? data.data : data
}

// Mengambil riwayat pesanan konsumen
export function getConsumerOrders(consumerId) {
  return orderRequest(`/api/orders/consumer/${consumerId}`)
}

// Mengambil daftar pesanan masuk untuk merchant
export function getMerchantOrders(merchantId) {
  return orderRequest(`/api/orders/merchant/${merchantId}`)
}

// Memperbarui status pesanan (Konfirmasi, Siap Diambil, Selesai, Dibatalkan)
export function updateOrderStatus(orderId, status, cancelReason = null) {
  return orderRequest(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, cancel_reason: cancelReason }),
  })
}

// Mengambil ringkasan pesanan terbaru untuk dashboard merchant
export function getMerchantDashboardOrders(merchantId) {
  return orderRequest(`/api/orders/merchant/${merchantId}`)
}