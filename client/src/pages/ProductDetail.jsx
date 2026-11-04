import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, addToCart } from '../api/orders.js'
import { rupiah, pickupTime, timeLeft, isUrgent } from '../utils/format.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    getProduct(id)
      .then((data) => { if (active) setProduct(data) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-16 text-center text-coffee">Memuat detail makanan...</main>
  if (error || !product) return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="text-urgent">{error || 'Produk tidak ditemukan.'}</p>
      <Link className="mt-5 inline-flex rounded-full bg-mocha px-5 py-3 font-bold text-cream" to="/explore">Kembali ke Explore</Link>
    </main>
  )

  const available = Number(product.stock) > 0 && new Date(product.pickup_deadline.replace(' ', 'T')) > new Date()
  const urgent = isUrgent(product.pickup_deadline)
  function handleAdd() {
    addToCart(product, quantity)
    setNotice('Berhasil ditambahkan ke keranjang!')
  }

  function handleBuyNow() {
    // Beli sekarang langsung ke checkout tanpa mengubah isi keranjang.
    navigate('/checkout', { state: { directItems: [{ id: product.id, quantity, product }] } })
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/explore" className="text-sm font-bold text-coffee hover:text-mocha">← Kembali ke Explore</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-3xl bg-latte">
          {product.photo_url ? <img src={product.photo_url} alt={product.name} className="aspect-square w-full object-cover" /> : (
            <div className="grid aspect-square place-items-center bg-[#dcc09d] p-8 text-center">
              <div><span className="text-6xl" aria-hidden="true">🍽️</span><p className="mt-4 font-display text-xl font-bold">{product.category}</p><p className="text-sm text-coffee">Foto belum tersedia</p></div>
            </div>
          )}
        </div>
        <section className="flex flex-col">
          <span className="w-fit rounded-full bg-latte px-3 py-1 text-xs font-bold text-coffee">{product.category}</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-coffee">Dari <strong className="text-mocha">{product.merchant_name}</strong> · {product.merchant_area}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-caramel-dark">{rupiah(product.discount_price)}</span>
            <s className="text-coffee">{rupiah(product.normal_price)}</s>
            <span className="rounded-full bg-caramel px-3 py-1 text-xs font-extrabold text-mocha-dark">Hemat {product.discount_percent}%</span>
          </div>
          <div className="mt-7 rounded-2xl border border-latte bg-white p-4">
            <p className="font-bold">Tentang makanan</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-coffee">{product.description || 'Makanan surplus pilihan dari merchant ReBite.'}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-latte p-4"><p className="text-xs font-bold uppercase tracking-wide text-coffee">Stok tersedia</p><p className="mt-1 text-xl font-extrabold">{product.stock} porsi</p></div>
            <div className={`rounded-2xl p-4 ${urgent ? 'bg-[#f8e4df] text-urgent' : 'bg-latte'}`}><p className="text-xs font-bold uppercase tracking-wide">Batas pickup</p><p className="mt-1 text-xl font-extrabold">{pickupTime(product.pickup_deadline)}</p><p className="text-xs">{timeLeft(product.pickup_deadline)}</p></div>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <span className="font-bold">Jumlah</span>
            <div className="flex items-center rounded-full border-2 border-latte bg-white">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-xl font-bold" aria-label="Kurangi jumlah">−</button>
              <span className="min-w-8 text-center font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(Number(product.stock), q + 1))} disabled={quantity >= Number(product.stock)} className="grid h-11 w-11 place-items-center text-xl font-bold disabled:opacity-30" aria-label="Tambah jumlah">+</button>
            </div>
            <span className="ml-auto text-sm text-coffee">Maks. {product.stock}</span>
          </div>
          {notice && <p role="status" className="mt-4 rounded-xl bg-[#e8f2e5] p-3 text-sm font-semibold text-[#315b32]">{notice}</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={handleAdd} disabled={!available} className="min-h-12 rounded-full bg-caramel px-5 font-extrabold text-mocha-dark transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">+ Keranjang</button>
            <button type="button" onClick={handleBuyNow} disabled={!available} className="min-h-12 rounded-full bg-mocha px-5 font-extrabold text-cream transition hover:bg-mocha-dark disabled:cursor-not-allowed disabled:opacity-50">Beli sekarang</button>
          </div>
          {!available && <p className="mt-3 text-sm font-semibold text-urgent">Produk sudah tidak tersedia atau melewati batas pickup.</p>}
          <p className="mt-4 text-xs text-coffee">Pembayaran dilakukan langsung kepada merchant saat pengambilan pesanan.</p>
        </section>
      </div>
    </main>
  )
}
