import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import Reveal from '../components/Reveal.jsx'
import SearchForm from '../components/SearchForm.jsx'
import { getRecommended, getCategories } from '../api/products.js'

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [recommended, setRecommended] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getRecommended(), getCategories()])
      .then(([products, cats]) => {
        setRecommended(products)
        setCategories(cats)
      })
      .catch((err) => setError(err.message))
  }, [])

  const totalAvailable = categories.reduce((sum, c) => sum + Number(c.total), 0)

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/explore?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <main>
      <HeroCarousel
        totalAvailable={totalAvailable}
        deal={recommended[0]}
        search={
          <SearchForm
            id="home-search"
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
            placeholder="Cari croissant, nasi rendang..."
          />
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        {error && (
          <p className="mt-8 rounded-xl border border-urgent bg-white p-4 text-urgent">
            {error}. Pastikan server backend sudah jalan (node index.js).
          </p>
        )}

        {/* Kategori */}
        <Reveal as="section" className="mt-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Kategori</h2>
          <div className="scroll-row -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {categories.map((cat) => (
              <Link
                key={cat.category}
                to={`/explore?category=${encodeURIComponent(cat.category)}`}
                className="inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border-2 border-latte bg-white py-1 pl-4 pr-1.5 font-semibold transition-colors hover:border-mocha hover:text-mocha"
              >
                {cat.category}
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-caramel px-2 text-sm font-bold text-mocha-dark">
                  {cat.total}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Rekomendasi */}
        <Reveal as="section" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Diskon terbesar hari ini</h2>
              <p className="text-coffee">Yang batas ambilnya paling dekat ditampilkan duluan.</p>
            </div>
            <Link
              to="/explore"
              className="inline-flex min-h-11 shrink-0 items-center font-semibold text-mocha underline underline-offset-4"
            >
              Lihat semua
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {recommended.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  )
}
