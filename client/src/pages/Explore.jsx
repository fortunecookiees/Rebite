import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import ProductCard from '../components/ProductCard.jsx'
import SearchForm from '../components/SearchForm.jsx'
import CategoryIcon from '../components/CategoryIcon.jsx'
import { getProducts, getCategories } from '../api/products.js'
import { isUrgent } from '../utils/format.js'

const PRICE_OPTIONS = [
  { value: '', label: 'Semua harga' },
  { value: '10000', label: '≤ Rp10rb' },
  { value: '15000', label: '≤ Rp15rb' },
  { value: '20000', label: '≤ Rp20rb' },
  { value: '30000', label: '≤ Rp30rb' },
]

const SORT_OPTIONS = [
  { value: '', label: 'Terbaru' },
  { value: 'cheapest', label: 'Termurah' },
  { value: 'discount', label: 'Diskon terbesar' },
  { value: 'deadline', label: 'Segera diambil' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut', delay },
})

export default function Explore() {
  // Filter disimpan di URL, jadi link dari Home (?category=..., ?search=...) langsung kepakai
  const [params, setParams] = useSearchParams()
  const filters = {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    max_price: params.get('max_price') ?? '',
    sort: params.get('sort') ?? '',
  }

  const [searchInput, setSearchInput] = useState(filters.search)
  const [categories, setCategories] = useState([])
  // Hasil disimpan bersama filter (key) yang dipakai untuk mengambilnya.
  // Kalau key-nya beda dengan filter sekarang, berarti data baru masih dimuat.
  const filterKey = params.toString()
  const [result, setResult] = useState({ key: null, products: [], error: '' })
  const loading = result.key !== filterKey
  const { products, error } = result

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    // ignore: buang respons lama kalau filter sudah berubah lagi sebelum selesai
    let ignore = false
    getProducts(filters)
      .then((data) => !ignore && setResult({ key: filterKey, products: data, error: '' }))
      .catch((err) => !ignore && setResult({ key: filterKey, products: [], error: err.message }))
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  function updateFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  function handleSearch(e) {
    e.preventDefault()
    updateFilter('search', searchInput.trim())
  }

  function removeSearch() {
    setSearchInput('')
    updateFilter('search', '')
  }

  function resetFilters() {
    setSearchInput('')
    setParams({})
  }

  const hasFilter = filters.search || filters.category || filters.max_price

  // Angka untuk stiker di header, dihitung dari hasil yang tampil
  const maxDiscount = products.reduce((max, p) => Math.max(max, Number(p.discount_percent)), 0)
  const urgentCount = products.filter((p) => isUrgent(p.pickup_deadline)).length
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
      {/* Header + stiker statistik */}
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <motion.div {...fadeUp()}>
          <p className="inline-flex items-center gap-2 rounded-full bg-latte px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-caramel" aria-hidden="true" />
            Menu surplus hari ini
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-7xl">Explore</h1>
          <p className="mt-2 max-w-md text-coffee">
            Semua makanan surplus yang masih bisa dipesan sekarang. Ambil sendiri, bayar di tempat.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:flex">
          <StatSticker
            delay={0.1}
            rotate={-4}
            className="bg-mocha text-cream"
            value={loading ? '–' : products.length}
            label="menu tersedia"
          />
          <StatSticker
            delay={0.2}
            rotate={3}
            className="bg-caramel text-mocha-dark"
            value={loading || !maxDiscount ? '–' : `-${maxDiscount}%`}
            label="diskon s.d."
          />
          <StatSticker
            delay={0.3}
            rotate={-2}
            className="bg-latte text-urgent"
            value={loading ? '–' : urgentCount}
            label="hampir habis"
          />
        </div>
      </div>

      {/* Panel filter bergaya struk kasir */}
      <motion.div {...fadeUp(0.15)} className="mt-8 drop-shadow-[0_6px_0_var(--color-latte)]">
        <div className="receipt-edge rounded-t-3xl bg-white px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-coffee">
            <span>ReBite · Menu surplus</span>
            <span className="hidden sm:inline">{today}</span>
          </div>

          <SearchForm
            id="explore-search"
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            placeholder="Cari nama makanan atau merchant"
          />

          <FilterRow label="Kategori" className="mt-4">
            <Chip active={!filters.category} onClick={() => updateFilter('category', '')}>
              <CategoryIcon category="" className="h-4 w-4" />
              Semua
            </Chip>
            {categories.map((cat) => (
              <Chip
                key={cat.category}
                active={filters.category === cat.category}
                onClick={() => updateFilter('category', cat.category)}
              >
                <CategoryIcon category={cat.category} className="h-4 w-4" />
                {cat.category}
                <span className="text-xs opacity-70">{cat.total}</span>
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Harga">
            {PRICE_OPTIONS.map((o) => (
              <Chip key={o.value} active={filters.max_price === o.value} onClick={() => updateFilter('max_price', o.value)}>
                {o.label}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Urutkan">
            {SORT_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                accent
                active={filters.sort === o.value}
                onClick={() => updateFilter('sort', o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </FilterRow>
        </div>
      </motion.div>

      {/* Filter aktif + jumlah hasil */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <p className="mr-2 font-display text-lg font-bold" aria-live="polite">
          {loading ? 'Memuat menu...' : `${products.length} menu ditemukan`}
        </p>
        {filters.search && <ActiveTag onRemove={removeSearch}>“{filters.search}”</ActiveTag>}
        {filters.category && (
          <ActiveTag onRemove={() => updateFilter('category', '')}>{filters.category}</ActiveTag>
        )}
        {filters.max_price && (
          <ActiveTag onRemove={() => updateFilter('max_price', '')}>
            {PRICE_OPTIONS.find((o) => o.value === filters.max_price)?.label ?? 'Harga'}
          </ActiveTag>
        )}
        {hasFilter && (
          <button
            onClick={resetFilters}
            className="min-h-11 px-2 text-sm font-semibold text-coffee underline underline-offset-4 hover:text-mocha"
          >
            Hapus semua
          </button>
        )}
      </div>

      {/* Hasil */}
      {error ? (
        <p className="mt-4 rounded-xl border border-urgent bg-white p-4 text-urgent">
          {error}. Pastikan server backend sudah jalan (node index.js).
        </p>
      ) : loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState hasFilter={hasFilter} onReset={resetFilters} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </main>
  )
}

function StatSticker({ value, label, rotate, delay, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      className={`grid place-items-center rounded-3xl px-3 py-4 text-center md:h-32 md:w-32 md:rounded-full ${className}`}
    >
      <div>
        <p className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{value}</p>
        <p className="mt-1 text-xs font-bold leading-tight">{label}</p>
      </div>
    </motion.div>
  )
}

// Satu baris di struk: label di kiri (desktop) / di atas (HP), chip di kanan
function FilterRow({ label, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 border-t-2 border-dashed border-latte py-3 md:flex-row md:items-center md:gap-4 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-coffee md:w-24 md:shrink-0">{label}</p>
      <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:px-0">
        {children}
      </div>
    </div>
  )
}

// accent: dipakai baris "Urutkan" supaya beda dengan filter
function Chip({ active, accent, onClick, children }) {
  const activeClass = accent ? 'bg-caramel text-mocha-dark' : 'bg-mocha text-cream'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
        active ? activeClass : 'bg-cream text-mocha hover:bg-latte'
      }`}
    >
      {children}
    </button>
  )
}

function ActiveTag({ onRemove, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-latte py-1 pl-3 pr-1 text-sm font-semibold">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Hapus filter ini"
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </span>
  )
}

function SkeletonGrid() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-latte/60">
          <div className="aspect-4/3 animate-pulse bg-latte" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-latte" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-latte" />
            <div className="h-5 w-2/5 animate-pulse rounded-full bg-latte" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasFilter, onReset }) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-3xl border-2 border-dashed border-latte px-6 py-12 text-center">
      {/* Piring kosong yang sudah "digigit" */}
      <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="var(--color-latte)" />
        <circle cx="60" cy="60" r="34" fill="var(--color-cream)" />
        <circle cx="108" cy="22" r="22" fill="var(--color-cream)" />
        <circle cx="84" cy="44" r="4" fill="var(--color-cream)" />
      </svg>
      <p className="mt-4 font-display text-2xl font-bold">Piringnya masih kosong.</p>
      <p className="mt-1 max-w-sm text-coffee">
        Belum ada menu yang cocok. Coba kata kunci lain atau longgarkan filternya.
      </p>
      {hasFilter && (
        <button
          onClick={onReset}
          className="mt-5 min-h-11 rounded-full bg-mocha px-6 font-bold text-cream hover:bg-mocha-dark"
        >
          Hapus semua filter
        </button>
      )}
    </div>
  )
}
