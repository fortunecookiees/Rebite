import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

// Icon garis sederhana untuk menu
const ICONS = {
  home: <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  explore: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  store: (
    <>
      <path d="M3 10h18l-1.5-6h-15z" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
    </>
  ),
}

function NavIcon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {ICONS[name]}
    </svg>
  )
}

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/merchant/dashboard', label: 'Merchant', icon: 'store' },
]

const linkClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
    isActive ? 'bg-cream text-mocha' : 'text-cream hover:bg-mocha-dark'
  }`

const mobileLinkClass = ({ isActive }) =>
  `flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold ${
    isActive ? 'bg-cream text-mocha' : 'text-cream hover:bg-mocha-dark'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Tutup menu HP dengan tombol Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 bg-mocha text-cream shadow-[0_2px_0_rgb(0_0_0/0.08)]">
      <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 sm:px-5 md:py-4">
        <Link
          to="/"
          onClick={close}
          className="mr-auto flex min-h-11 items-center gap-2 font-display text-2xl font-extrabold tracking-tight md:text-[1.75rem]"
        >
          <Logo className="h-9 w-9" />
          ReBite
        </Link>

        {/* Desktop / tablet */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <NavIcon name={l.icon} />
              {l.label}
            </NavLink>
          ))}
          {/* Halaman login dibuat Della */}
          <Link
            to="/login"
            className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-caramel px-5 text-sm font-bold text-mocha-dark hover:brightness-105"
          >
            <NavIcon name="user" />
            Masuk
          </Link>
        </div>

        {/* Tombol hamburger HP */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-hp"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-mocha-dark md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Menu HP */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-hp"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-cream/15 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4 pt-2">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className={mobileLinkClass}>
                  <NavIcon name={l.icon} />
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/login"
                onClick={close}
                className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full bg-caramel font-bold text-mocha-dark"
              >
                <NavIcon name="user" />
                Masuk
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Logo kecil: piring dengan "gigitan"
export function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="var(--color-caramel)" />
      <circle cx="28" cy="7" r="6" fill="var(--color-mocha)" />
      <circle cx="16" cy="16" r="6.5" fill="var(--color-cream)" />
    </svg>
  )
}
