import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMerchantProduct, deleteMerchantProduct, getMerchantId, getMerchantProducts, updateMerchantProduct, uploadMerchantPhoto } from '../api/products.js'
import { rupiah, pickupTime } from '../utils/format.js'

const CATEGORIES = ['Roti & Pastry', 'Nasi & Lauk', 'Kue & Dessert', 'Minuman', 'Snack']
const emptyForm = () => {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return { name: '', category: CATEGORIES[0], description: '', photo_url: '', normal_price: '', discount_price: '', stock: '', pickup_deadline: d.toISOString().slice(0, 16) }
}
const toForm = (p) => ({ ...p, pickup_deadline: String(p.pickup_deadline).replace(' ', 'T').slice(0, 16) })

export default function ManageProducts() {
  const merchantId = getMerchantId()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await getMerchantProducts(merchantId)); setError('') }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    let active = true
    getMerchantProducts(merchantId)
      .then((rows) => active && setProducts(rows))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [merchantId])

  const visibleProducts = useMemo(() => products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())), [products, search])
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  function startEdit(product) {
    setEditingId(product.id)
    setForm(toForm(product))
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function resetForm() { setEditingId(null); setForm(emptyForm()); setError('') }

  async function handlePhoto(file) {
    if (!file) return
    try {
      setSaving(true)
      const result = await uploadMerchantPhoto(merchantId, file)
      setField('photo_url', result.photo_url)
      setNotice('Foto berhasil diunggah.')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      const payload = { ...form, normal_price: Number(form.normal_price), discount_price: Number(form.discount_price), stock: Number(form.stock) }
      if (editingId) await updateMerchantProduct(merchantId, editingId, payload)
      else await createMerchantProduct(merchantId, payload)
      setNotice(editingId ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.')
      resetForm()
      await loadProducts()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Hapus produk “${product.name}”?`)) return
    setError(''); setNotice('')
    try { await deleteMerchantProduct(merchantId, product.id); setNotice('Produk berhasil dihapus.'); await loadProducts() }
    catch (err) { setError(err.message) }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Link to="/merchant/dashboard" className="text-sm font-semibold text-coffee hover:text-mocha">← Dashboard merchant</Link><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-caramel-dark">Inventaris toko</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Kelola Produk</h1><p className="mt-2 max-w-xl text-coffee">Tambah dan perbarui makanan surplus yang akan tampil di katalog ReBite.</p></div><div className="rounded-2xl bg-latte px-5 py-3"><p className="text-xs text-coffee">Total produk</p><p className="font-display text-2xl font-extrabold">{products.length}</p></div></div>

      {(error || notice) && <div role="status" className={`mt-6 rounded-2xl border p-4 text-sm ${error ? 'border-urgent/40 bg-white text-urgent' : 'border-green-800/20 bg-white text-green-800'}`}>{error || notice}</div>}

      <section className="mt-7 rounded-3xl border border-latte bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-display text-2xl font-bold">{editingId ? 'Edit produk' : 'Tambah produk baru'}</h2><p className="mt-1 text-sm text-coffee">Lengkapi informasi produk dan waktu pengambilan.</p></div>{editingId && <button type="button" onClick={resetForm} className="min-h-10 rounded-full px-4 text-sm font-semibold text-coffee hover:bg-latte">Batal edit</button>}</div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nama produk"><input required maxLength="100" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Contoh: Roti Sobek Cokelat" className={inputClass} /></Field>
          <Field label="Kategori"><select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputClass}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Stok (porsi)"><input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setField('stock', e.target.value)} placeholder="10" className={inputClass} /></Field>
          <Field label="Harga normal (Rp)"><input required type="number" min="1" step="1" value={form.normal_price} onChange={(e) => setField('normal_price', e.target.value)} placeholder="25000" className={inputClass} /></Field>
          <Field label="Harga diskon (Rp)"><input required type="number" min="1" step="1" value={form.discount_price} onChange={(e) => setField('discount_price', e.target.value)} placeholder="15000" className={inputClass} /></Field>
          <Field label="Batas waktu pickup"><input required type="datetime-local" value={form.pickup_deadline} onChange={(e) => setField('pickup_deadline', e.target.value)} className={inputClass} /></Field>
          <Field label="Foto produk (JPG/PNG/WebP, maks. 5 MB)"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(e) => handlePhoto(e.target.files?.[0])} className="block min-h-11 w-full rounded-xl border border-latte bg-cream p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-latte file:px-3 file:py-2 file:font-semibold" />{form.photo_url && <span className="mt-1 block truncate text-xs text-green-800">Foto terpasang: {form.photo_url}</span>}</Field>
          <Field label="URL foto (opsional)"><input value={form.photo_url} onChange={(e) => setField('photo_url', e.target.value)} placeholder="https://... atau hasil upload" className={inputClass} /></Field>
          <div className="sm:col-span-2 lg:col-span-3"><Field label="Deskripsi"><textarea rows="3" maxLength="5000" value={form.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Ceritakan isi, kondisi, atau informasi makanan..." className={`${inputClass} resize-y`} /></Field></div>
          <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3"><button disabled={saving} className="min-h-12 rounded-full bg-mocha px-7 font-bold text-cream hover:bg-mocha-dark disabled:opacity-60">{saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Tambah produk'}</button>{!editingId && <button type="button" onClick={resetForm} className="min-h-12 rounded-full bg-latte px-6 font-semibold hover:brightness-95">Reset</button>}</div>
        </form>
      </section>

      <section className="mt-9"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="font-display text-2xl font-bold">Daftar produk</h2><p className="mt-1 text-sm text-coffee">Produk habis atau lewat batas pickup tetap terlihat di sini, tetapi tidak tampil di katalog konsumen.</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau kategori..." className={`${inputClass} sm:max-w-xs`} /></div>
        {loading ? <p className="mt-5 rounded-2xl bg-white p-6 text-coffee">Memuat produk...</p> : visibleProducts.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-coffee/30 bg-white p-8 text-center text-coffee">Belum ada produk yang cocok.</p> : <div className="mt-5 overflow-x-auto rounded-3xl border border-latte bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-latte text-xs uppercase tracking-wide text-coffee"><tr><th className="px-5 py-4">Produk</th><th className="px-4 py-4">Harga</th><th className="px-4 py-4">Stok</th><th className="px-4 py-4">Pickup</th><th className="px-4 py-4">Status</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-latte">{visibleProducts.map((p) => { const available = Number(p.stock) > 0 && new Date(String(p.pickup_deadline).replace(' ', 'T')) > new Date(); return <tr key={p.id}><td className="px-5 py-4"><div className="flex items-center gap-3">{p.photo_url ? <img src={p.photo_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-latte text-xs font-bold text-coffee">RB</div>}<div><p className="font-bold">{p.name}</p><p className="mt-1 text-xs text-coffee">{p.category}</p></div></div></td><td className="px-4 py-4"><b>{rupiah(p.discount_price)}</b><s className="mt-1 block text-xs text-coffee">{rupiah(p.normal_price)}</s></td><td className="px-4 py-4">{p.stock} porsi</td><td className="px-4 py-4">{pickupTime(p.pickup_deadline)}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${available ? 'bg-green-100 text-green-800' : 'bg-latte text-coffee'}`}>{available ? 'Tersedia' : Number(p.stock) === 0 ? 'Stok habis' : 'Pickup lewat'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => startEdit(p)} className="min-h-10 rounded-full bg-latte px-4 text-xs font-bold hover:bg-latte/70">Edit</button><button onClick={() => handleDelete(p)} className="min-h-10 rounded-full border border-urgent/30 px-4 text-xs font-bold text-urgent hover:bg-red-50">Hapus</button></div></td></tr> })}</tbody></table></div>}
      </section>
      <p className="mt-5 text-xs text-coffee">Mode demo menggunakan akun merchant contoh #2 jika sesi login belum tersedia.</p>
    </main>
  )
}

const inputClass = 'min-h-11 w-full rounded-xl border border-latte bg-cream px-3 py-2 text-sm text-mocha outline-none transition focus:border-coffee focus:ring-2 focus:ring-latte'
function Field({ label, children }) { return <label className="block text-sm font-semibold text-mocha">{label}<div className="mt-2">{children}</div></label> }
