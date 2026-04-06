import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

export default function Cart() {
  const { state, dispatch, cartTotal, cartSavings, requireLogin } = useApp()
  const navigate = useNavigate()
  const { cart } = state

  const updateQty = (id, qty) => dispatch({ type: 'SET_QTY', payload: { id, qty } })
  const remove = (id) => dispatch({ type: 'REMOVE_CART', payload: id })

  const handleCheckout = () => requireLogin(() => navigate('/checkout'))

  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-8xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty!</h2>
        <p className="text-gray-500 mb-6">Add items to it now.</p>
        <Link to="/products" className="btn-primary inline-block">Shop Now</Link>
      </motion.div>
    </div>
  )

  const originalTotal = cart.reduce((a, i) => a + (i.originalPrice || i.price) * i.qty, 0)
  const shipping = cartTotal > 499 ? 0 : 40
  const total = cartTotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Cart Items */}
        <div className="flex-1 space-y-3">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div key={item._id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                className="bg-white rounded shadow-sm p-4">
                <div className="flex gap-4">
                  <Link to={`/products/${item._id}`} className="flex-shrink-0">
                    <img src={item.image} alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded border border-gray-100"
                      onError={e => e.target.src = 'https://via.placeholder.com/100'} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item._id}`} className="text-sm font-medium text-gray-800 hover:text-flipblue line-clamp-2 block">{item.name}</Link>
                    <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-gray-900">₹{item.price?.toLocaleString('en-IN')}</span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{item.originalPrice?.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-green-600 font-semibold">{item.discount}% off</span>
                        </>
                      )}
                    </div>
                    {item.price > 499 && <p className="text-xs text-green-600 mt-0.5">✓ Free Delivery</p>}

                    {/* Qty Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                        <button onClick={() => updateQty(item._id, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg">−</button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-gray-300">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg">+</button>
                      </div>
                      <button onClick={() => remove(item._id)}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">Remove</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Price Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 border-b pb-2">Price Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MRP ({cart.reduce((a,i)=>a+i.qty,0)} items)</span>
                <span>₹{originalTotal.toLocaleString('en-IN')}</span>
              </div>
              {originalTotal > cartTotal && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>− ₹{(originalTotal - cartTotal).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              {originalTotal > cartTotal && (
                <p className="text-green-600 text-xs font-semibold bg-green-50 rounded p-2 text-center">
                  🎉 You save ₹{(originalTotal - cartTotal).toLocaleString('en-IN')} on this order!
                </p>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout}
              className="w-full btn-secondary mt-4 py-3 text-base font-bold rounded">
              Place Order →
            </motion.button>
            <p className="text-xs text-gray-400 text-center mt-2">Safe and Secure Payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}
