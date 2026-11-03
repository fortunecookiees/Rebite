import { Link } from 'react-router-dom'
import { Logo } from './Navbar.jsx'

export default function Footer() {
  return (
    <footer className="mt-20 bg-mocha text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-5 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl font-extrabold">
            <Logo />
            ReBite
          </p>
          <p className="mt-3 max-w-xs font-display text-lg leading-snug">
            Good food deserves another bite.
          </p>
          <p className="mt-2 max-w-sm text-sm text-cream/75">
            Makanan surplus dari cafe, bakery, dan restoran di sekitarmu. Pesan online, ambil sendiri,
            bayar di tempat.
          </p>
        </div>

        <div>
          <h2 className="font-display font-bold">Jelajahi</h2>
          <ul className="mt-2 text-sm">
            <li><FooterLink to="/">Home</FooterLink></li>
            <li><FooterLink to="/explore">Explore</FooterLink></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display font-bold">Akun</h2>
          <ul className="mt-2 text-sm">
            <li><FooterLink to="/login">Masuk</FooterLink></li>
            <li><FooterLink to="/register">Daftar jadi merchant</FooterLink></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/15 px-4 py-4 text-center text-xs text-cream/70">
        Tugas akhir Technopreneurship, Universitas Tarumanagara
      </p>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center text-cream/85 hover:text-cream hover:underline">
      {children}
    </Link>
  )
}
