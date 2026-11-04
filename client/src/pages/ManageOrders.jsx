import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMerchantOrders, updateOrderStatus } from '../api/orders.js'
import { rupiah } from '../utils/format.js'
import { getMerchantId } from '../api/products.js'

export default function ManageOrders() {
  const merchantId = getMerchantId()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('Semua')

  async function loadOrders() {
    setLoading(true)
    try { 
      setOrders(await getMerchantOrders(merchantId))
      setError('') 
    } catch (err) { 
      setError(err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => {
    let active = true
    getMerchantOrders(merchantId)
      .then((rows) => active && setOrders(rows))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [merchantId])

  async function handleStatusChange(orderId, newStatus) {
    setError('')
    setNotice('')
    try {
      await updateOrderStatus(orderId, newStatus)
      setNotice(`Status pesanan berhasil diperbarui menjadi ${newStatus}.`)
      await loadOrders()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredOrders = orders
    .filter(order => {
      if (activeTab === 'Semua') return true
      if (activeTab === 'Pesanan Baru') return order.status === 'Pesanan Baru'
      if (activeTab === 'Siap Diambil') return order.status === 'Siap Diambil'
      if (activeTab === 'Selesai / Batal') return order.status === 'Selesai' || order.status === 'Dibatalkan'
      return true
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/merchant/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-coffee transition-all hover:-translate-x-1 hover:text-mocha">
            ← Dashboard merchant
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-caramel-dark">Pesanan toko</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Kelola Pesanan</h1>
          <p className="mt-2 max-w-xl text-coffee">Pantau pesanan masuk dari konsumen dan perbarui status pengambilannya.</p>
        </div>
        <div className="rounded-2xl bg-latte/70 px-5 py-3 shadow-inner backdrop-blur-sm transition-transform hover:scale-105">
          <p className="text-xs text-coffee">Total pesanan</p>
          <p className="font-display text-2xl font-extrabold text-mocha">{orders.length}</p>
        </div>
      </div>

      {/* Alert Notifications */}
      {(error || notice) && (
        <div role="status" className={`mt-6 rounded-2xl border p-4 text-sm transition-all duration-300 animate-slideDown ${error ? 'border-urgent/40 bg-red-50 text-urgent' : 'border-green-800/20 bg-green-50 text-green-800'}`}>
          {error || notice}
        </div>
      )}

      {/* Navigasi Tab Status Pesanan */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-latte pb-4">
        {['Semua', 'Pesanan Baru', 'Siap Diambil', 'Selesai / Batal'].map((tab) => {
          const count = tab === 'Semua' ? orders.length : 
                        orders.filter(o => tab === 'Selesai / Batal' ? (o.status === 'Selesai' || o.status === 'Dibatalkan') : o.status === tab).length

          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                isActive 
                  ? 'bg-mocha text-cream shadow-md -translate-y-0.5' 
                  : 'bg-latte/60 text-coffee hover:bg-latte hover:text-mocha'
              }`}
            >
              {tab}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                isActive ? 'bg-cream/20 text-cream' : 'bg-coffee/10 text-coffee'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Content List */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Daftar pesanan ({activeTab})</h2>
          <span className="text-xs text-coffee/60">{filteredOrders.length} pesanan ditemukan</span>
        </div>
        
        {loading ? (
          <div className="mt-5 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 w-full animate-pulse rounded-3xl bg-latte/40" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-coffee/30 bg-white/50 p-12 text-center backdrop-blur-sm">
            <p className="text-sm font-semibold text-mocha">Belum ada pesanan</p>
            <p className="mt-1 text-xs text-coffee">Tidak ada pesanan masuk untuk kategori "{activeTab}".</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="group rounded-3xl border border-latte bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-mocha/20"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-latte/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-mocha transition-colors group-hover:text-caramel-dark">
                        #{order.order_code}
                      </span>
                      {order.status === 'Pesanan Baru' && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-coffee/70">
                      Dipesan pada: {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="mt-1 text-xs text-coffee">
                      Pemesan: <span className="font-semibold text-mocha">{order.consumer_name}</span> ({order.consumer_phone})
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-transform group-hover:scale-105 ${
                    order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                    order.status === 'Siap Diambil' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      order.status === 'Selesai' ? 'bg-green-600' :
                      order.status === 'Siap Diambil' ? 'bg-blue-600' :
                      order.status === 'Dibatalkan' ? 'bg-red-600' :
                      'bg-amber-600'
                    }`} />
                    {order.status}
                  </span>
                </div>

                {/* Rincian Item */}
                <div className="py-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-coffee/70">Rincian Item:</p>
                  <ul className="space-y-1.5 text-sm text-mocha">
                    {order.items && order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between rounded-lg px-2 py-1 transition-colors hover:bg-latte/30">
                        <span>{item.product_name} <span className="text-xs font-bold text-caramel-dark">(x{item.quantity})</span></span>
                        <span className="font-semibold">{rupiah(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Footer & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-latte/60 pt-4">
                  <div>
                    <p className="text-xs text-coffee/70">Total (Bayar di tempat):</p>
                    <p className="font-display text-xl font-extrabold text-mocha">{rupiah(order.total)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'Pesanan Baru' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'Siap Diambil')}
                        className="min-h-10 rounded-full bg-mocha px-5 text-xs font-bold text-cream shadow-sm transition-all duration-200 hover:bg-mocha-dark hover:shadow active:scale-95"
                      >
                        Set Siap Diambil
                      </button>
                    )}
                    {order.status === 'Siap Diambil' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'Selesai')}
                        className="min-h-10 rounded-full bg-green-700 px-5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-green-800 hover:shadow active:scale-95"
                      >
                        Selesaikan Pesanan
                      </button>
                    )}
                    {order.status !== 'Selesai' && order.status !== 'Dibatalkan' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'Dibatalkan')}
                        className="min-h-10 rounded-full border border-red-300 px-4 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-95"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}