
import { Routes, Route, useLocation } from 'react-router-dom'

// Components
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

// Main Pages
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'

// Product & Order Pages
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import MyOrders from './pages/MyOrders.jsx'

// Merchant Pages
import MerchantDashboard from './pages/MerchantDashboard.jsx'
import ManageProducts from './pages/ManageProducts.jsx'
import ManageOrders from './pages/ManageOrders.jsx'

// Della - Authentication & Account
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  const location = useLocation()

  // Hide Navbar and Footer on Login and Register pages
  const isAuthPage = [
    '/login',
    '/register',
  ].includes(location.pathname)

  return (
    <div className="flex min-h-screen flex-col">

      {/* Navbar */}
      {!isAuthPage && <Navbar />}

      {/* Main Content */}
      <main className="flex-1">
        <Routes>

          {/* =========================
              MAIN PAGES
          ========================= */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/explore"
            element={<Explore />}
          />

          {/* =========================
              PRODUCT & ORDER PAGES
          ========================= */}
          <Route
            path="/produk/:id"
            element={<ProductDetail />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/pesanan/:id"
            element={<OrderConfirmation />}
          />

          <Route
            path="/my-orders"
            element={<MyOrders />}
          />

          {/* =========================
              MERCHANT PAGES
          ========================= */}
          <Route
            path="/merchant/dashboard"
            element={<MerchantDashboard />}
          />

          <Route
            path="/merchant/products"
            element={<ManageProducts />}
          />

          <Route
            path="/merchant/orders"
            element={<ManageOrders />}
          />

          {/* =========================
              DELLA - AUTHENTICATION
          ========================= */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Routes>
      </main>

      {/* Footer */}
      {!isAuthPage && <Footer />}

    </div>
  )
}
