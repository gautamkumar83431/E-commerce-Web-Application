import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AuthModal from './components/AuthModal.jsx'
import Loader from './components/Loader.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Products = lazy(() => import('./pages/Products.jsx'))
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const Orders = lazy(() => import('./pages/Orders.jsx'))
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'))
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'))
const AdminSellers = lazy(() => import('./pages/admin/AdminSellers.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const BecomeSeller = lazy(() => import('./pages/BecomeSeller.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))

export default function App() {
  return (
    <AppProvider>
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: '8px', background: '#333', color: '#fff', fontSize: '14px' } }} />
      <AuthModal />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/become-seller" element={<BecomeSeller />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </AppProvider>
  )
}
