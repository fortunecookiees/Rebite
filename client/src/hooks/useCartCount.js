import { useEffect, useState } from 'react'
import { readCart } from '../api/orders.js'

// Badge keranjang menghitung jumlah jenis produk, bukan total porsinya.
const getCartTypeCount = () => readCart().length

export function useCartCount() {
  const [count, setCount] = useState(getCartTypeCount)
  useEffect(() => {
    const sync = () => setCount(getCartTypeCount())
    window.addEventListener('rebite-cart-change', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('rebite-cart-change', sync); window.removeEventListener('storage', sync) }
  }, [])
  return count
}
