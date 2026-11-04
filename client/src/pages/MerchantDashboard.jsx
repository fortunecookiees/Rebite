import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { getMerchantDashboard, getMerchantId } from '../api/products.js'
import { rupiah } from '../utils/format.js'

export default function MerchantDashboard() {
  const merchantId = getMerchantId()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMerchantDashboard(merchantId)
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [merchantId])

  const stats = data ? [
    { label: 'Total produk', value: data.products.total_products || 0, note: `${data.products.available_products || 0} tersedia`, icon: '▤' },
    { label: 'Total stok', value: data.products.total_stock || 0, note: 'Porsi siap dijual', icon: '◫' },
    { label: 'Pesanan baru', value: data.orders.new_orders || 0, note: 'Menunggu konfirmasi', icon: '◷' },
    { label: 'Siap diambil', value: data.orders.ready_orders || 0, note: 'Menunggu konsumen', icon: '✓' },
  ] : []

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-caramel-dark">Ruang merchant</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Dashboard</h1>
          <p className="mt-2 text-coffee">{data?.merchant_name ? `Halo, ${data.merchant_name}!` : 'Pantau produk dan pesanan tokomu di sini.'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/merchant/products" className="inline-flex min-h-12 items-center justify-center rounded-full bg-latte px-6 font-bold text-mocha transition hover:brightness-95">+ Kelola produk</Link>
          <Link to="/merchant/orders" className="inline-flex min-h-12 items-center justify-center rounded-full bg-mocha px-6 font-bold text-cream transition hover:bg-mocha-dark"> Kelola Pesanan</Link>
        </div>
      </div>

      {error && <div role="alert" className="mt-7 rounded-2xl border border-urgent/40 bg-white p-5 text-urgent">{error}. Pastikan MySQL dan backend aktif, lalu cek akun merchant yang digunakan.</div>}
      {loading ? <div className="mt-8 rounded-3xl bg-white p-8 text-coffee">Memuat ringkasan toko...</div> : data && <>
        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, index) => <motion.article key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="rounded-3xl border border-latte bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-coffee">{stat.label}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-latte font-display text-lg">{stat.icon}</span></div>
            <p className="mt-4 font-display text-4xl font-extrabold tabular-nums">{stat.value}</p>
            <p className="mt-1 text-xs text-coffee">{stat.note}</p>
          </motion.article>)}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-mocha p-6 text-cream sm:p-8">
            <p className="text-sm font-semibold text-cream/70">Pendapatan pesanan selesai</p>
            <p className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{rupiah(data.orders.completed_revenue || 0)}</p>
            <p className="mt-3 text-sm text-cream/70">Berdasarkan pesanan dengan status Selesai.</p>
          </div>
          <div className="rounded-3xl border border-latte bg-latte p-6 sm:p-8">
            <p className="font-display text-xl font-bold">Ringkasan pesanan</p>
            <div className="mt-4 flex items-center justify-between border-b border-mocha/10 py-2"><span className="text-sm text-coffee">Total pesanan</span><b>{data.orders.total_orders || 0}</b></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm text-coffee">Pesanan selesai</span><b>{data.orders.completed_orders || 0}</b></div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-latte bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-latte p-5 sm:px-7"><div><h2 className="font-display text-xl font-bold">Pesanan terbaru</h2><p className="mt-1 text-sm text-coffee">Aktivitas pesanan yang masuk ke tokomu.</p></div><span className="rounded-full bg-latte px-3 py-1 text-xs font-bold">5 terbaru</span></div>
          {data.recent_orders.length ? <div className="divide-y divide-latte">{data.recent_orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7"><div><p className="font-bold">{order.order_code}</p><p className="mt-1 text-sm text-coffee">{order.consumer_name} · {new Date(order.created_at).toLocaleString('id-ID')}</p></div><div className="text-right"><p className="font-bold">{rupiah(order.total)}</p><span className="mt-1 inline-block rounded-full bg-latte px-3 py-1 text-xs font-semibold">{order.status}</span></div></div>)}</div> : <p className="p-7 text-sm text-coffee">Belum ada pesanan untuk toko ini.</p>}
        </section>
      </>}
      <p className="mt-6 text-xs text-coffee">Mode demo menggunakan akun merchant contoh #2 jika sesi login belum tersedia.</p>
    </main>
  )
}