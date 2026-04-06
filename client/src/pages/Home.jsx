import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'

const BANNERS = [
  { id:1, bg:'from-blue-600 via-blue-700 to-indigo-800', title:'Big Billion Days Sale', sub:'Up to 80% off on Electronics', emoji:'📱', cta:'Shop Electronics', cat:'Electronics' },
  { id:2, bg:'from-pink-500 via-rose-500 to-red-600', title:'Fashion Fiesta', sub:'Flat 60% off on Top Brands', emoji:'👗', cta:'Shop Fashion', cat:'Fashion' },
  { id:3, bg:'from-green-500 via-emerald-500 to-teal-600', title:'Home Makeover Sale', sub:'Furniture & Appliances at Best Prices', emoji:'🛋️', cta:'Shop Home', cat:'Home & Furniture' },
  { id:4, bg:'from-orange-500 via-amber-500 to-yellow-500', title:'Sports Carnival', sub:'Up to 50% off on Sports Gear', emoji:'⚽', cta:'Shop Sports', cat:'Sports' },
]

const CATEGORIES = [
  { name:'Electronics', icon:'📱', color:'bg-blue-50 hover:bg-blue-100' },
  { name:'Fashion', icon:'👗', color:'bg-pink-50 hover:bg-pink-100' },
  { name:'Home & Furniture', icon:'🛋️', color:'bg-yellow-50 hover:bg-yellow-100' },
  { name:'Appliances', icon:'🏠', color:'bg-green-50 hover:bg-green-100' },
  { name:'Beauty', icon:'💄', color:'bg-purple-50 hover:bg-purple-100' },
  { name:'Sports', icon:'⚽', color:'bg-red-50 hover:bg-red-100' },
  { name:'Books', icon:'📚', color:'bg-indigo-50 hover:bg-indigo-100' },
  { name:'Toys', icon:'🧸', color:'bg-orange-50 hover:bg-orange-100' },
  { name:'Grocery', icon:'🛒', color:'bg-teal-50 hover:bg-teal-100' },
]

export default function Home() {
  const [banner, setBanner] = useState(0)
  const [featured, setFeatured] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const timerRef = useRef()

  useEffect(() => {
    timerRef.current = setInterval(() => setBanner(b => (b + 1) % BANNERS.length), 4000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, dealsRes] = await Promise.all([
          axios.get('/api/products?featured=true&limit=8'),
          axios.get('/api/products?sort=discount&limit=8'),
        ])
        setFeatured(featRes.data.products || [])
        setDeals(dealsRes.data.products || [])
      } catch { } finally { setLoading(false) }
    }
    fetchProducts()
  }, [])

  return (
    <div className="bg-flipgray min-h-screen">

      {/* Hero Banner */}
      <div className="relative overflow-hidden h-52 sm:h-64 md:h-72">
        <AnimatePresence mode="wait">
          <motion.div key={banner}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-r ${BANNERS[banner].bg} flex items-center justify-center`}>
            <div className="text-center text-white px-4">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="text-5xl sm:text-7xl mb-3">{BANNERS[banner].emoji}</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl font-bold mb-1">{BANNERS[banner].title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-sm sm:text-lg text-white/90 mb-4">{BANNERS[banner].sub}</motion.p>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(BANNERS[banner].cat)}`)}
                className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-100 active:scale-95 transition-all shadow-lg">
                {BANNERS[banner].cta} →
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBanner(i)}
              className={`rounded-full transition-all duration-300 ${i === banner ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => setBanner(b => (b - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors">‹</button>
        <button onClick={() => setBanner(b => (b + 1) % BANNERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors">›</button>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">

        {/* Categories */}
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg ${cat.color} transition-all cursor-pointer group`}>
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deals of the Day */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-800">Deals of the Day</h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">LIVE</span>
            </div>
            <Link to="/products?sort=discount" className="text-flipblue text-sm font-semibold hover:underline">View All →</Link>
          </div>
          {loading ? <Loader full={false} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {deals.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
        </div>

        {/* Promo Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { bg: 'from-blue-500 to-blue-700', title: 'Electronics', sub: 'Up to 70% off', icon: '📱', cat: 'Electronics' },
            { bg: 'from-pink-500 to-rose-600', title: 'Fashion Week', sub: 'Min 50% off', icon: '👗', cat: 'Fashion' },
            { bg: 'from-green-500 to-emerald-600', title: 'Home Essentials', sub: 'Starting ₹299', icon: '🏠', cat: 'Appliances' },
          ].map((b, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(b.cat)}`)}
              className={`bg-gradient-to-r ${b.bg} rounded-lg p-5 text-white cursor-pointer flex items-center justify-between shadow-md`}>
              <div>
                <p className="font-bold text-lg">{b.title}</p>
                <p className="text-white/80 text-sm">{b.sub}</p>
                <button className="mt-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors">Shop Now</button>
              </div>
              <span className="text-5xl">{b.icon}</span>
            </motion.div>
          ))}
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">⭐ Featured Products</h2>
            <Link to="/products?featured=true" className="text-flipblue text-sm font-semibold hover:underline">View All →</Link>
          </div>
          {loading ? <Loader full={false} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featured.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
        </div>

        {/* Why Flipkart */}
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 text-center">Why Shop with Us?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹499' },
              { icon: '↩️', title: 'Easy Returns', sub: '10-day return policy' },
              { icon: '🔒', title: '100% Secure', sub: 'Safe & encrypted payments' },
              { icon: '🏆', title: 'Best Prices', sub: 'Guaranteed lowest prices' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-3">
                <span className="text-3xl mb-2">{f.icon}</span>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
