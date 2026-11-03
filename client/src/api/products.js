// Semua request katalog ke backend ada di sini

async function request(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error('Gagal memuat data dari server')
  return res.json()
}

// filters: { search, category, max_price, sort }
export function getProducts(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  return request(`/api/products?${params}`)
}

export function getRecommended() {
  return request('/api/products/recommended')
}

export function getCategories() {
  return request('/api/products/categories')
}
