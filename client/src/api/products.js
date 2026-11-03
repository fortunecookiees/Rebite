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

// API dashboard merchant. ID diambil dari sesi login; fallback akun contoh hanya untuk demo lokal.
async function merchantRequest(path, options = {}) {
  const res = await fetch(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Permintaan merchant gagal')
  return data
}

export function getMerchantId() {
  const params = new URLSearchParams(window.location.search)
  const queryId = Number(params.get('merchant_id'))
  if (Number.isInteger(queryId) && queryId > 0) return queryId
  for (const key of ['user', 'rebite_user', 'auth_user', 'currentUser']) {
    try {
      const user = JSON.parse(localStorage.getItem(key) || 'null')
      const id = Number(user?.id ?? user?.user?.id)
      if (Number.isInteger(id) && id > 0) return id
    } catch { /* Abaikan format sesi yang bukan JSON */ }
  }
  return 2 // akun merchant contoh dari schema.sql; ganti dengan sesi autentikasi Della.
}

const merchantPath = (id) => `/api/merchant/${id}`
export const getMerchantDashboard = (id) => merchantRequest(`${merchantPath(id)}/dashboard`)
export const getMerchantProducts = (id) => merchantRequest(`${merchantPath(id)}/products`)
export const createMerchantProduct = (id, product) => merchantRequest(`${merchantPath(id)}/products`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
})
export const updateMerchantProduct = (id, productId, product) => merchantRequest(`${merchantPath(id)}/products/${productId}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
})
export const deleteMerchantProduct = (id, productId) => merchantRequest(`${merchantPath(id)}/products/${productId}`, { method: 'DELETE' })
export async function uploadMerchantPhoto(id, file) {
  return merchantRequest(`${merchantPath(id)}/photo`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
}
