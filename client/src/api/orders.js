const CART_KEY = 'rebite_cart';
const SERVICE_FEE = 1000;

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Permintaan gagal. Silakan coba lagi.');
  return data;
}

export const getProduct = (id) => request(`/api/products/${id}`);

export function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('rebite-cart-change'));
}

export function addToCart(product, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((item) => Number(item.id) === Number(product.id));
  const stock = Number(product.stock) || 0;
  const next = existing
    ? cart.map((item) => Number(item.id) === Number(product.id)
      ? { ...item, product, quantity: Math.min(Number(item.quantity) + quantity, stock) }
      : item)
    : [...cart, { id: product.id, quantity: Math.min(quantity, stock), product }];
  writeCart(next);
}

export function updateCartQuantity(productId, quantity) {
  const next = readCart().map((item) => Number(item.id) === Number(productId)
    ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, Number(item.product?.stock ?? 99))) }
    : item);
  writeCart(next);
}

export function removeFromCart(productId) {
  writeCart(readCart().filter((item) => Number(item.id) !== Number(productId)));
}

export function removePurchasedFromCart(items) {
  const purchasedIds = new Set(items.map((item) => Number(item.id)));
  writeCart(readCart().filter((item) => !purchasedIds.has(Number(item.id))));
}

export function clearCart() { writeCart([]); }

export function getCurrentUser() {
  for (const key of ['user', 'rebite_user', 'auth_user', 'currentUser']) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      const user = stored?.user ?? stored;
      const id = Number(user?.id);
      if (Number.isInteger(id) && id > 0) {
        return { id, name: user.name || user.full_name || user.nama || user.username || '', role: user.role || '' };
      }
    } catch { /* Coba format sesi berikutnya */ }
  }
  return null;
}

export function calculateCart(cart) {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.product?.discount_price || 0) * Number(item.quantity || 0), 0);
  return { subtotal, serviceFee: cart.length ? SERVICE_FEE : 0, total: subtotal + (cart.length ? SERVICE_FEE : 0), itemTypes: cart.length, totalQuantity: cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0) };
}

export function createOrder(items) {
  const currentUser = getCurrentUser();
  return request('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_id: currentUser?.id || 1,
      items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
    }),
  });
}
