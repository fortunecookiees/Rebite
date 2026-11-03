// Icon garis sederhana per kategori (warna ikut currentColor)
const PATHS = {
  'Roti & Pastry': (
    <>
      <path d="M4 12a8 5.5 0 0 1 16 0v6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
      <path d="M9 9.5l1 3M13 9l.5 3.5M16.5 10l-.5 3" />
    </>
  ),
  'Nasi & Lauk': (
    <>
      <path d="M3 11h18a9 8 0 0 1-18 0z" />
      <path d="M9 4c-1 1.5 1 2.5 0 4M14 4c-1 1.5 1 2.5 0 4" />
    </>
  ),
  'Kue & Dessert': (
    <>
      <path d="M4 12h16v8H4z" />
      <path d="M4 15.5c2.7 1.6 5.3 1.6 8 0s5.3-1.6 8 0" />
      <path d="M12 8.5V12M12 4.5v1" />
    </>
  ),
  Minuman: (
    <>
      <path d="M6 8h12l-1.5 12.5h-9z" />
      <path d="M12.5 8l1.5-5h3" />
    </>
  ),
  Snack: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9h.01M14.5 10h.01M10 14.5h.01M15 15h.01" strokeWidth="3" />
    </>
  ),
}

const ALL = (
  <>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </>
)

// category kosong = icon "Semua"
export default function CategoryIcon({ category, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      {category ? (PATHS[category] ?? ALL) : ALL}
    </svg>
  )
}
