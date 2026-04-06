import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted, state } = useApp()
  const wishlisted = isWishlisted(product._id)
  const inCart = state.cart.find(i => i._id === product._id)
  const [imgLoaded, setImgLoaded] = useState(false)
  const discount = product.originalPrice > product.price ? product.discount : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(40,116,240,0.13)' }}
      className="bg-white rounded-xl overflow-hidden group relative flex flex-col h-[380px] border border-gray-100 hover:border-flipblue/30 transition-all duration-250 shadow-sm hover:shadow-lg"
    >
      {/* Top Badges Row */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discount && (
          <span className="bg-flipsecondary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
            {discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className="bg-flipblue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {product.badge}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <motion.button
        whileTap={{ scale: 0.75 }}
        onClick={e => { e.preventDefault(); toggleWishlist(product) }}
        className={`absolute top-2 right-2 z-10 rounded-full p-1.5 shadow-md transition-all duration-200
          ${wishlisted
            ? 'bg-red-50 opacity-100'
            : 'bg-white opacity-0 group-hover:opacity-100'}`}
      >
        <svg className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </motion.button>

      <Link to={`/products/${product._id}`} className="flex flex-col flex-1 min-h-0">
        {/* Image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 h-44 flex-shrink-0 overflow-hidden flex items-center justify-center p-3">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.35 }}
            src={product.image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300?text=No+Image'; setImgLoaded(true) }}
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-red-500 font-bold text-sm border border-red-200 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {/* Quick view overlay on hover */}
          <div className="absolute inset-0 bg-flipblue/0 group-hover:bg-flipblue/5 transition-colors duration-300 pointer-events-none" />
        </div>

        {/* Info */}
        <div className="px-3 pt-2.5 pb-1 flex-1 flex flex-col">
          {/* Brand */}
          <p className="text-[11px] font-semibold text-flipblue/70 uppercase tracking-wide mb-0.5">{product.brand}</p>

          {/* Name */}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-flipblue transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`inline-flex items-center gap-0.5 text-xs text-white px-1.5 py-0.5 rounded-full font-bold
              ${product.rating >= 4 ? 'bg-green-500' : product.rating >= 3 ? 'bg-yellow-500' : 'bg-red-400'}`}>
              {product.rating} ★
            </span>
            <span className="text-xs text-gray-400">({product.numReviews?.toLocaleString()})</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] text-red-500 font-semibold ml-auto">Only {product.stock} left!</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap mt-auto">
            <span className="text-base font-extrabold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Free Delivery */}
          {product.price > 499 && (
            <p className="text-[11px] text-green-600 font-medium mt-1">✦ Free Delivery</p>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-3 pb-3 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={e => { e.preventDefault(); if (product.stock > 0) addToCart(product) }}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-lg text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5
            ${product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : inCart
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm shadow-green-200'
                : 'bg-flipblue text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
            }`}
        >
          {product.stock === 0 ? (
            'Out of Stock'
          ) : inCart ? (
            <><span>✓</span> In Cart ({inCart.qty})</>
          ) : (
            <><span>🛒</span> Add to Cart</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
