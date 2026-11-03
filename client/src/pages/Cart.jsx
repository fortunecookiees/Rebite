import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateCart, readCart, removeFromCart, updateCartQuantity } from '../api/orders.js'
import { rupiah, pickupTime } from '../utils/format.js'

const SELECTED_KEY = 'rebite_selected_cart_items'
function initialSelection(cart) {
  try {
    const saved = JSON.parse(localStorage.getItem(SELECTED_KEY) || 'null')
    if (Array.isArray(saved)) return saved.map(Number).filter((id) => cart.some((item) => Number(item.id) === id))
  } catch { /* Gunakan pilihan default */ }
  return cart.map((item) => Number(item.id))
}

export default function Cart() {
  const [cart, setCart] = useState(readCart)
  const [selectedIds, setSelectedIds] = useState(() => initialSelection(readCart()))
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => {
      const nextCart = readCart()
      const previousIds = new Set(cart.map((item) => Number(item.id)))
      const addedIds = nextCart.filter((item) => !previousIds.has(Number(item.id))).map((item) => Number(item.id))
      setCart(nextCart)
      setSelectedIds((current) => [...new Set([...current.filter((id) => nextCart.some((item) => Number(item.id) === Number(id))), ...addedIds])])
    }
    window.addEventListener('rebite-cart-change', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('rebite-cart-change', sync); window.removeEventListener('storage', sync) }
  }, [cart])

  const selectedCart = useMemo(() => cart.filter((item) => selectedIds.includes(Number(item.id))), [cart, selectedIds])
  const groupedCart = useMemo(() => {
    const groups = new Map()
    cart.forEach((item) => {
      const product = item.product || {}
      const merchantKey = product.merchant_id != null
        ? `merchant-${product.merchant_id}`
        : `merchant-${product.merchant_name || 'unknown'}`
      if (!groups.has(merchantKey)) {
        groups.set(merchantKey, { key: merchantKey, name: product.merchant_name || 'Merchant', items: [] })
      }
      groups.get(merchantKey).items.push(item)
    })
    return [...groups.values()]
  }, [cart])
  const totals = useMemo(() => calculateCart(selectedCart), [selectedCart])
  const merchantIds = [...new Set(selectedCart.map((item) => Number(item.product?.merchant_id)))]
  const multipleMerchants = merchantIds.length > 1

  function toggleSelected(id) {
    setSelectedIds((current) => {
      const next = current.includes(Number(id)) ? current.filter((value) => value !== Number(id)) : [...current, Number(id)]
      localStorage.setItem(SELECTED_KEY, JSON.stringify(next))
      return next
    })
  }
  function toggleMerchantSelection(group) {
    const groupIds = group.items.map((item) => Number(item.id))
    const allSelected = groupIds.every((id) => selectedIds.includes(id))
    const next = allSelected
      ? selectedIds.filter((id) => !groupIds.includes(Number(id)))
      : [...new Set([...selectedIds, ...groupIds])]
    setSelectedIds(next)
    localStorage.setItem(SELECTED_KEY, JSON.stringify(next))
  }
  function changeQuantity(id, value) { updateCartQuantity(id, value); setCart(readCart()) }
  function remove(id) {
    removeFromCart(id)
    const next = selectedIds.filter((value) => value !== Number(id))
    setSelectedIds(next)
    localStorage.setItem(SELECTED_KEY, JSON.stringify(next))
    setCart(readCart())
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-coffee">ReBite · Pesanan kamu</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Keranjang <span className="text-2xl text-coffee">({cart.length} jenis)</span></h1>
      <p className="mt-2 text-coffee">Pilih makanan yang ingin kamu checkout. Pilihan lainnya akan tetap tersimpan.</p>
      {!cart.length ? (
        <div className="mt-8 rounded-3xl bg-white px-6 py-14 text-center shadow-sm"><span className="text-5xl" aria-hidden="true">🛒</span><h2 className="mt-4 font-display text-2xl font-bold">Keranjang masih kosong</h2><p className="mt-2 text-coffee">Yuk, temukan makanan surplus favoritmu.</p><Link to="/explore" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-mocha px-6 font-bold text-cream">Cari makanan</Link></div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-5">
            {groupedCart.map((group) => (
              <div key={group.key} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-latte px-4 py-3">
                  <span aria-hidden="true" className="text-lg">🏪</span>
                  <h2 className="min-w-0 flex-1 truncate font-bold">{group.name}</h2>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-coffee sm:text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Pilih semua produk dari ${group.name}`}
                      checked={group.items.every((item) => selectedIds.includes(Number(item.id)))}
                      ref={(element) => {
                        if (element) {
                          const selectedCount = group.items.filter((item) => selectedIds.includes(Number(item.id))).length
                          element.indeterminate = selectedCount > 0 && selectedCount < group.items.length
                        }
                      }}
                      onChange={() => toggleMerchantSelection(group)}
                      className="h-4 w-4 accent-[#684b3d]"
                    />
                    Pilih semua
                  </label>
                </div>
                <div className="divide-y divide-latte px-3 sm:px-4">
                  {group.items.map((item) => {
                    const product = item.product || {}
                    const lineTotal = Number(product.discount_price || 0) * item.quantity
                    return <article key={item.id} className="flex gap-3 py-4 first:pt-4 sm:gap-4">
                      <div className="flex items-start pt-1"><input aria-label={`Pilih ${product.name}`} type="checkbox" checked={selectedIds.includes(Number(item.id))} onChange={() => toggleSelected(item.id)} className="h-4 w-4 accent-[#684b3d]" /></div>
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-latte sm:h-28 sm:w-28">{product.photo_url ? <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl">🍽️</div>}</div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-display text-lg font-bold">{product.name || 'Produk'}</h3></div><button type="button" onClick={() => remove(item.id)} className="rounded-full px-2 py-1 text-sm font-bold text-urgent hover:bg-[#f8e4df]">Hapus</button></div>
                        <p className="mt-1 font-extrabold text-caramel-dark">{rupiah(product.discount_price)} <span className="text-xs font-normal text-coffee">/ porsi</span></p>
                        <p className="mt-1 text-xs text-coffee">Pickup sebelum {pickupTime(product.pickup_deadline)}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2"><button type="button" onClick={() => changeQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="grid h-8 w-8 place-items-center rounded-full bg-latte font-bold disabled:opacity-40">−</button><span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= Number(product.stock || 99)} className="grid h-8 w-8 place-items-center rounded-full bg-latte font-bold disabled:opacity-40">+</button><span className="ml-auto text-sm font-extrabold">Subtotal: {rupiah(lineTotal)}</span></div>
                      </div>
                    </article>
                  })}
                </div>
              </div>
            ))}
          </section>
          <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Ringkasan pesanan</h2><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-coffee">Jenis makanan dipilih</span><strong>{totals.itemTypes}</strong></div><div className="flex justify-between"><span className="text-coffee">Total porsi</span><strong>{totals.totalQuantity}</strong></div><div className="flex justify-between"><span className="text-coffee">Subtotal</span><strong>{rupiah(totals.subtotal)}</strong></div><div className="flex justify-between"><span className="text-coffee">Biaya layanan</span><strong>{rupiah(totals.serviceFee)}</strong></div><div className="border-t border-dashed border-latte pt-3"><div className="flex justify-between text-base"><strong>Total</strong><strong className="text-caramel-dark">{rupiah(totals.total)}</strong></div></div></div>
            {multipleMerchants && <p className="mt-4 rounded-xl bg-[#fff3df] p-3 text-xs leading-relaxed text-mocha-dark">Produk yang dipilih berasal dari beberapa merchant. Pilih produk dari satu merchant untuk checkout bersamaan.</p>}
            <button type="button" onClick={() => navigate('/checkout', { state: { directItems: selectedCart } })} disabled={!selectedCart.length || multipleMerchants} className="mt-6 min-h-12 w-full rounded-full bg-mocha px-5 font-extrabold text-cream hover:bg-mocha-dark disabled:cursor-not-allowed disabled:opacity-40">Checkout ({selectedCart.length})</button>
            <Link to="/explore" className="mt-3 flex min-h-10 items-center justify-center text-sm font-bold text-coffee underline underline-offset-4">Tambah makanan lain</Link><p className="mt-3 text-center text-xs text-coffee">Bayar langsung saat pickup di merchant.</p>
          </aside>
        </div>
      )}
    </main>
  )
}
