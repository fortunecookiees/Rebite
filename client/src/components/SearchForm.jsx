// Kolom pencarian dipakai di Home (bawah carousel) dan Explore
export default function SearchForm({ id, value, onChange, onSubmit, placeholder }) {
  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center gap-1 rounded-full border-2 border-mocha/15 bg-white p-1 pl-4 focus-within:border-mocha"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-coffee">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <label htmlFor={id} className="sr-only">
        Cari makanan atau merchant
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-mocha placeholder:text-coffee focus:outline-none"
      />
      <button className="min-h-11 shrink-0 rounded-full bg-mocha px-5 font-bold text-cream hover:bg-mocha-dark sm:px-7">
        Cari
      </button>
    </form>
  )
}
