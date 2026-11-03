import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { rupiah, pickupTime } from '../utils/format.js'

export default function OrderConfirmation() {
  const { id } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order) return
    let active = true
    fetch(`/api/orders/${id}`).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Pesanan tidak ditemukan.')
      if (active) setOrder(data)
    }).catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [id, order])

  if (error) return <main className="mx-auto max-w-2xl px-4 py-16 text-center text-urgent">{error}</main>
  if (!order) return <main className="mx-auto max-w-2xl px-4 py-16 text-center text-coffee">Memuat pesanan...</main>

  return <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f2e5] text-3xl text-[#315b32]">✓</div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-coffee">ReBite · Pesanan berhasil</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Terima kasih!</h1>
      <p className="mt-2 text-coffee">Pesananmu sudah diteruskan ke merchant.</p>
      <div className="mt-7 rounded-2xl bg-latte p-5"><p className="text-xs font-bold uppercase tracking-wide text-coffee">Kode pesanan</p><p className="mt-1 font-display text-3xl font-extrabold tracking-wider">{order.order_code}</p><p className="mt-2 text-xs text-coffee">Tunjukkan kode ini saat mengambil pesanan.</p></div>
      <div className="mt-6 space-y-3 text-left"><div className="flex justify-between gap-3"><span className="text-coffee">Merchant</span><strong className="text-right">{order.merchant_name}</strong></div><div className="flex justify-between gap-3"><span className="text-coffee">Pickup sebelum</span><strong>{pickupTime(order.pickup_deadline)}</strong></div><div className="flex justify-between gap-3"><span className="text-coffee">Status</span><strong>{order.status || 'Pesanan Baru'}</strong></div><div className="flex justify-between gap-3 border-t border-dashed border-latte pt-3 text-lg"><strong>Total bayar</strong><strong className="text-caramel-dark">{rupiah(order.total)}</strong></div></div>
      <div className="mt-6 rounded-xl bg-[#fff8ed] p-4 text-left text-sm leading-relaxed text-coffee">Pembayaran dilakukan langsung saat pickup di merchant. Pastikan mengambil pesanan sebelum batas waktu yang tertera.</div>
      <Link to="/explore" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-mocha px-7 font-bold text-cream hover:bg-mocha-dark">Cari makanan lainnya</Link>
    </section>
  </main>
}
