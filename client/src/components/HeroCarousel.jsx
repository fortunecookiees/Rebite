import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, useReducedMotion } from 'motion/react'
import CountUp from './CountUp.jsx'
import { rupiah, pickupTime } from '../utils/format.js'

const AUTOPLAY_MS = 5000

// Isi slide muncul bertahap setiap slide-nya aktif
const contentVariants = {
  hide: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const itemVariants = {
  hide: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

/*
  Carousel di Home.
  - totalAvailable: jumlah menu tersedia (untuk angka hitung naik)
  - deal: produk diskon terbesar dari /api/products/recommended (boleh kosong)
  - search: elemen form pencarian, ditaruh di bawah slide supaya selalu kelihatan
*/
export default function HeroCarousel({ totalAvailable, deal, search }) {
  const reduce = useReducedMotion()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 })
  const [selected, setSelected] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  // Kapan autoplay berhenti
  const [hovering, setHovering] = useState(false)
  const [touching, setTouching] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = reduce || hovering || touching || focused

  const slides = [
    <TaglineSlide key="tagline" total={totalAvailable} />,
    deal && <DealSlide key="deal" product={deal} />,
    <StepsSlide key="steps" />,
    <MerchantSlide key="merchant" />,
  ].filter(Boolean)

  useEffect(() => {
    if (!emblaApi) return
    const sync = () => {
      setSelected(emblaApi.selectedScrollSnap())
      setSnapCount(emblaApi.scrollSnapList().length)
    }
    // Autoplay berhenti selama slide disentuh / di-drag
    const down = () => setTouching(true)
    const up = () => setTouching(false)
    sync()
    emblaApi.on('select', sync).on('reInit', sync).on('pointerDown', down).on('pointerUp', up)
    return () => {
      emblaApi.off('select', sync).off('reInit', sync).off('pointerDown', down).off('pointerUp', up)
    }
  }, [emblaApi])

  // Autoplay: timer diulang setiap slide berganti, jadi geser manual juga mereset hitungan
  useEffect(() => {
    if (!emblaApi || paused) return
    const t = setTimeout(() => emblaApi.scrollNext(), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [emblaApi, paused, selected])

  const prev = useCallback(() => emblaApi?.scrollPrev(reduce), [emblaApi, reduce])
  const next = useCallback(() => emblaApi?.scrollNext(reduce), [emblaApi, reduce])
  const goTo = useCallback((i) => emblaApi?.scrollTo(i, reduce), [emblaApi, reduce])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan ReBite"
      className="mx-auto max-w-7xl px-4 pt-4 sm:px-5 sm:pt-6"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative"
      >
        <div className="overflow-hidden rounded-4xl" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} dari ${slides.length}`}
                className="relative min-w-0 flex-[0_0_100%]"
              >
                <motion.div
                  variants={contentVariants}
                  initial="hide"
                  animate={selected === i ? 'show' : 'hide'}
                  className="h-full"
                >
                  {slide}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Panah transparan di kiri-kanan (di HP cukup swipe) */}
        <ArrowButton side="left" label="Slide sebelumnya" onClick={prev}>
          <path d="M15 5l-7 7 7 7" />
        </ArrowButton>
        <ArrowButton side="right" label="Slide berikutnya" onClick={next}>
          <path d="M9 5l7 7-7 7" />
        </ArrowButton>

        {/* Dots di bawah tengah slide */}
        <div
          role="tablist"
          aria-label="Pilih slide"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-cream/70 px-2 backdrop-blur-sm"
        >
          {Array.from({ length: snapCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={selected === i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="grid h-8 w-7 place-items-center"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  selected === i ? 'w-6 bg-mocha' : 'w-2 bg-mocha/30'
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pencarian, selalu kelihatan walau slide berganti */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="mt-3"
      >
        {search}
      </motion.div>
    </section>
  )
}

function ArrowButton({ side, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/40 text-mocha backdrop-blur-sm transition-colors hover:bg-cream/90 sm:grid ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}

/* ---------- Slide ---------- */

// Ciri khas slide ReBite: sudut kanan atas "tergigit"
function Bite() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 sm:-right-10 sm:-top-10 sm:h-32 sm:w-32">
      <span className="absolute inset-0 rounded-full bg-cream" />
      <span className="absolute -bottom-3 left-2 h-3 w-3 rounded-full bg-cream sm:h-4 sm:w-4" />
      <span className="absolute -left-3 bottom-6 h-2 w-2 rounded-full bg-cream" />
    </span>
  )
}

function SlideShell({ className, children }) {
  return (
    <div className={`relative flex h-full min-h-110 items-center overflow-hidden px-6 pb-16 pt-10 sm:min-h-100 sm:px-18 md:px-20 ${className}`}>
      <Bite />
      {children}
    </div>
  )
}

function Eyebrow({ className, children }) {
  return (
    <motion.p
      variants={itemVariants}
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}
    >
      {children}
    </motion.p>
  )
}

function TaglineSlide({ total }) {
  return (
    <SlideShell className="bg-mocha text-cream">
      <div className="grid w-full items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow className="bg-caramel text-mocha-dark">Good food deserves another bite</Eyebrow>
          <motion.h1
            variants={itemVariants}
            className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl"
          >
            Makanan enak yang belum habis hari ini.
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 max-w-md text-cream/80 sm:text-lg">
            Roti, nasi, dan kue surplus dari cafe, bakery, dan restoran di sekitarmu. Pesan di sini,
            ambil sendiri, bayar di tempat.
          </motion.p>
        </div>

        {/* Stiker angka menu tersedia */}
        <motion.div variants={itemVariants} className="flex md:justify-center">
          <motion.div
            animate={{ rotate: [6, 2, 6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-3 rounded-full bg-caramel py-2 pl-2 pr-6 text-mocha-dark shadow-[4px_4px_0_var(--color-cream)] md:grid md:aspect-square md:w-64 md:place-items-center md:p-0 md:text-center"
          >
            <div>
              <CountUp
                value={total}
                className="grid h-16 min-w-16 place-items-center rounded-full bg-cream px-2 font-display text-3xl font-extrabold leading-none md:h-auto md:bg-transparent md:text-8xl"
              />
              <p className="hidden px-8 font-display text-lg font-semibold leading-tight md:mt-1 md:block">
                menu masih bisa diselamatkan hari ini
              </p>
            </div>
            <p className="font-display text-sm font-semibold leading-tight md:hidden">
              menu masih bisa
              <br />
              diselamatkan hari ini
            </p>
          </motion.div>
        </motion.div>
      </div>
    </SlideShell>
  )
}

function DealSlide({ product }) {
  return (
    <SlideShell className="bg-latte text-mocha">
      <div className="grid w-full items-center gap-6 md:grid-cols-[1fr_1.1fr] md:gap-10">
        {/* Foto + stiker diskon besar */}
        <motion.div variants={itemVariants} className="relative mx-auto w-full max-w-70 md:max-w-sm">
          <div className="aspect-4/3 -rotate-2 overflow-hidden rounded-3xl border-4 border-cream bg-cream shadow-[6px_6px_0_var(--color-mocha)]">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center font-display text-lg font-bold text-mocha/60">
                {product.category}
              </div>
            )}
          </div>
          <motion.span
            animate={{ rotate: [-14, -6, -14] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-5 -right-3 grid h-24 w-24 place-items-center rounded-full bg-caramel text-center font-display font-extrabold leading-none text-mocha-dark shadow-[3px_3px_0_var(--color-mocha)] sm:h-28 sm:w-28 md:-right-6"
          >
            <span>
              <span className="block text-3xl sm:text-4xl">-{product.discount_percent}%</span>
              <span className="text-xs font-bold uppercase">hemat</span>
            </span>
          </motion.span>
        </motion.div>

        <div>
          <Eyebrow className="bg-cream text-mocha">Diskon terbesar hari ini</Eyebrow>
          <motion.h2
            variants={itemVariants}
            className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
          >
            {product.name}
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-1 font-medium">
            {product.merchant_name}, {product.merchant_area}
          </motion.p>
          <motion.p variants={itemVariants} className="mt-3 flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-3xl font-extrabold text-caramel-dark">{rupiah(product.discount_price)}</span>
            <s className="font-medium">{rupiah(product.normal_price)}</s>
          </motion.p>
          <motion.div variants={itemVariants} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Halaman detail produk dibuat Syr */}
            <Link
              to={`/produk/${product.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-mocha px-6 font-bold text-cream hover:bg-mocha-dark"
            >
              Selamatkan menu ini
            </Link>
            <span className="text-sm font-semibold">Ambil sebelum {pickupTime(product.pickup_deadline)}</span>
          </motion.div>
        </div>
      </div>
    </SlideShell>
  )
}

const STEPS = [
  ['Pesan', 'Pilih menu surplus, checkout tanpa bayar online, dan dapat kode pesanan.'],
  ['Ambil', 'Datang ke merchant sebelum batas waktu, tunjukkan kode pesananmu.'],
  ['Bayar di tempat', 'Bayar langsung ke merchant. Makanan selamat, dompet juga.'],
]

function StepsSlide() {
  return (
    <SlideShell className="border-2 border-latte bg-white text-mocha">
      <div className="w-full">
        <Eyebrow className="bg-latte text-mocha">Cara pesan</Eyebrow>
        <motion.h2
          variants={itemVariants}
          className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
        >
          Pesan, ambil, bayar di tempat.
        </motion.h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-5">
          {STEPS.map(([title, desc], i) => (
            <motion.li
              key={title}
              variants={itemVariants}
              className="flex gap-3 rounded-2xl bg-cream p-3 sm:p-4 md:flex-col"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-caramel font-display text-lg font-extrabold text-mocha-dark">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="text-sm text-coffee">{desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </SlideShell>
  )
}

function MerchantSlide() {
  return (
    <SlideShell className="bg-coffee text-cream">
      <div className="grid w-full items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow className="bg-cream text-mocha">Untuk merchant</Eyebrow>
          <motion.h2
            variants={itemVariants}
            className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl"
          >
            Punya cafe, bakery, atau restoran?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-3 max-w-md font-medium sm:text-lg">
            Ubah sisa produksi jadi pemasukan. Upload menu surplus dalam semenit, pelanggan datang
            mengambilnya sendiri.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-6">
            {/* Halaman register dibuat Della */}
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center rounded-full bg-caramel px-6 font-bold text-mocha-dark hover:brightness-105"
            >
              Gabung jadi merchant
            </Link>
          </motion.div>
        </div>
        <motion.ul variants={itemVariants} className="hidden gap-2 font-display text-lg font-bold md:grid">
          {['Kurangi food waste', 'Dapat pelanggan baru', 'Pesanan rapi lewat kode'].map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-full bg-cream px-4 py-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-mocha)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l5 5 9-10" />
              </svg>
              {t}
            </li>
          ))}
        </motion.ul>
      </div>
    </SlideShell>
  )
}
