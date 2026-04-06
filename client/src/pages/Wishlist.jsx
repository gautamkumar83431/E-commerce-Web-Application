import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Wishlist() {
  const { state, toggleWishlist } = useApp()
  const { wishlist } = state

  if (!state.token) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="text-7xl mb-4">❤️</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Login to view your Wishlist</h2>
      <p className="text-gray-500 mb-6">Save items you love and buy them later.</p>
      <button onClick={() => {}} className="btn-primary">Login Now</button>
    </div>
  )

  if (wishlist.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-7xl mb-4">💔</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save items you like by clicking the ❤️ button.</p>
        <Link to="/products" className="btn-primary inline-block">Explore Products</Link>
      </motion.div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">My Wishlist ({wishlist.length})</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence>
          {wishlist.map((product, i) => (
            <ProductCard key={product._id || product} product={product} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
