import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import About from './pages/About'
import Locations from './pages/Locations'
import Order from './pages/Order'
import Admin from './pages/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AppLayout() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartSidebar />}
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/menu"      element={<Menu />} />
        <Route path="/about"     element={<About />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/order"     element={<Order />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppLayout />
    </CartProvider>
  )
}
