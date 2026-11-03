import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { calculateCart, readCart, removePurchasedFromCart, createOrder } from '../api/orders.js'
import { rupiah, pickupTime } from '../utils/format.js'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [cart] = useState(() => location.state?.directItems || readCart())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const totals = useMemo(() => calculateCart(cart), [cart])
  const merchant = cart[0]?.product
  const sameMerchant = cart.length > 0 && cart.every((item) => Number(item.product?.merchant_id) === Number(merchant?.merchant_id))
  const pickupDeadline = cart.reduce((earliest, item) => {
    const current = item.product?.pickup_deadline
    if (!current) return earliest
    if (!earliest || new Date(current.replace(' ', 'T')) < new Date(earliest.replace(' ', 'T'))) return current
    return earliest
  }, '')

  useEffect(() => { if (!cart.length) navigate('/cart', { replace: true }) }, [cart.length, navigate])

  async function submitOrder() {
    setLoading(true); setError('')
    try {
      const result = await createOrder(cart)
      removePurchasedFromCart(cart)
      navigate(`/pesanan/${result.order.id}`, { replace: true, state: { order: result.order } })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!cart.length) return null
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to={location.state?.directItems ? '/explore' : '/cart'} className="text-sm font-bold text-coffee">← Kembali</Link>
      <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-coffee">Pastikan detail makanan dan pesanan sudah benar.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Merchant & pickup</h2><p className="mt-3 font-bold">{merchant?.merchant_name}</p><p className="mt-1 text-sm text-coffee">{merchant?.merchant_address || 'Alamat merchant akan dikonfirmasi saat pickup.'}</p><p className="mt-2 text-sm text-coffee">Area: {merchant?.merchant_area || '—'}</p><p className="mt-3 rounded-xl bg-latte p-3 text-sm">Batas pickup pesanan: <strong>{pickupDeadline ? pickupTime(pickupDeadline) : 'Belum tersedia'}</strong>.</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Detail makanan ({totals.itemTypes} jenis)</h2><div className="mt-4 divide-y divide-latte">{cart.map((item) => <div key={item.id} className="flex justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-semibold">{item.product.name}</p><p className="text-sm text-coffee">{item.quantity} porsi × {rupiah(item.product.discount_price)}</p></div><strong className="whitespace-nowrap">{rupiah(item.quantity * item.product.discount_price)}</strong></div>)}</div></div>
          <div className="rounded-2xl border border-caramel/50 bg-[#fff8ed] p-5"><div className="flex gap-3"><span className="text-2xl" aria-hidden="true">💵</span><div><h2 className="font-bold">Pembayaran saat pickup</h2><p className="mt-1 text-sm leading-relaxed text-coffee">Tidak ada payment gateway. Tunjukkan kode pesanan kepada merchant dan lakukan pembayaran langsung saat mengambil makanan.</p></div></div></div>
        </section>
        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Total pembayaran</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-coffee">Subtotal</span><strong>{rupiah(totals.subtotal)}</strong></div><div className="flex justify-between"><span className="text-coffee">Biaya layanan</span><strong>{rupiah(totals.serviceFee)}</strong></div><div className="border-t border-dashed border-latte pt-3"><div className="flex justify-between text-base"><strong>Total</strong><strong className="text-caramel-dark">{rupiah(totals.total)}</strong></div></div></div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#f8e4df] p-3 text-sm text-urgent">{error}</p>}
          {!sameMerchant && <p className="mt-4 text-sm text-urgent">Produk harus berasal dari satu merchant untuk checkout bersamaan.</p>}
          <button type="button" onClick={submitOrder} disabled={loading || !sameMerchant} className="mt-6 min-h-12 w-full rounded-full bg-mocha px-4 font-extrabold text-cream hover:bg-mocha-dark disabled:opacity-50">{loading ? 'Memproses pesanan...' : 'Konfirmasi Pesanan'}</button>
          <p className="mt-3 text-center text-xs text-coffee">Dengan menekan tombol, stok akan diperiksa dan pesanan disimpan.</p>
        </aside>
      </div>
    </main>
  )
}
