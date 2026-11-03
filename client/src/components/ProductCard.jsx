import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { rupiah, pickupTime, timeLeft, isUrgent } from '../utils/format.js'

// Warna latar foto pengganti kalau merchant belum upload foto
const PLACEHOLDER_COLORS = {
  'Roti & Pastry': 'bg-[#dcc09d]',
  'Nasi & Lauk': 'bg-[#d3c3a2]',
  'Kue & Dessert': 'bg-[#dfbea3]',
  Minuman: 'bg-[#cfc0ad]',
  Snack: 'bg-[#d8c296]',
}

// Stiker goyang sedikit saat kartu di-hover
const stickerVariants = {
  rest: { rotate: -12, scale: 1 },
  hover: {
    rotate: [-12, -4, -16, -10],
    scale: 1.08,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}

// index dipakai untuk jeda kemunculan bertahap di grid
export default function ProductCard({ product, index = 0 }) {
  const urgent = isUrgent(product.pickup_deadline)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: (index % 4) * 0.07 }}
      whileHover="hover"
      animate="rest"
      className="h-full"
    >
      {/* Halaman detail produk dibuat Syr */}
      <motion.div
        variants={{ rest: { y: 0 }, hover: { y: -4 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="h-full"
      >
        <Link
          to={`/produk/${product.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-latte transition-shadow hover:shadow-[0_10px_24px_-12px_rgb(73_53_45/0.35)]"
        >
          <div className="relative aspect-4/3 overflow-hidden">
            {product.photo_url ? (
              <img
                src={product.photo_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className={`flex h-full w-full items-end p-4 ${PLACEHOLDER_COLORS[product.category] ?? 'bg-latte'}`}
              >
                <span className="text-xs font-semibold text-mocha/70 sm:text-sm">
                  {product.category}
                  <span className="hidden lg:inline"> · belum ada foto</span>
                </span>
              </div>
            )}

            {/* Stiker diskon */}
            <motion.span
              variants={stickerVariants}
              className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-caramel font-display text-xs font-extrabold text-mocha-dark shadow-[2px_2px_0_var(--color-mocha)] sm:right-3 sm:top-3 sm:h-14 sm:w-14 sm:text-base"
            >
              -{product.discount_percent}%
            </motion.span>

            <span className="absolute left-2 top-2 rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-mocha sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
              Sisa {product.stock}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-0.5 p-3 sm:gap-1 sm:p-4">
            <h3 className="line-clamp-2 font-display text-base font-bold leading-snug group-hover:underline sm:text-lg">
              {product.name}
            </h3>
            <p className="truncate text-xs text-coffee sm:text-sm">
              {product.merchant_name}, {product.merchant_area}
            </p>

            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 sm:mt-2">
              <span className="font-display text-lg font-extrabold text-caramel-dark sm:text-xl">
                {rupiah(product.discount_price)}
              </span>
              <s className="text-xs text-coffee sm:text-sm">{rupiah(product.normal_price)}</s>
            </p>

            <p
              className={`mt-auto flex items-start gap-1.5 pt-2 text-xs sm:pt-3 sm:text-sm ${
                urgent ? 'font-semibold text-urgent' : 'text-coffee'
              }`}
            >
              <ClockIcon />
              <span>
                Ambil sebelum {pickupTime(product.pickup_deadline)}
                <span className="block text-[11px] sm:text-xs">
                  ({timeLeft(product.pickup_deadline)})
                </span>
              </span>
            </p>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
