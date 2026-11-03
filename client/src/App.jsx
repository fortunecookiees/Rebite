import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Fortuna */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />

          {/* Anggota lain tambahin route-nya di sini, contoh:
          <Route path="/login" element={<Login />} />            Della
          <Route path="/produk/:id" element={<ProductDetail />} /> Syr */}
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
