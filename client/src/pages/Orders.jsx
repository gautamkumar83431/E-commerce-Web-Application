import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'

const STATUS_COLOR = {
  'Placed': 'bg-blue-100 text-blue-700',
  'Confirmed': 'bg-indigo-100 text-indigo-700',
  'Shipped': 'bg-yellow-100 text-yellow-700',
  'Out for Delivery': 'bg-orange-100 text-orange-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Return Requested': 'bg-purple-100 text-purple-700',
  'Returned': 'bg-gray-100 text-gray-700',
}

export default function Orders() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!state.token) { navigate('/'); return }
    axios.get('/api/orders/my', { headers: { Authorization: `Bearer ${state.token}` } })
      .then(r => setOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [state.token])

  const FILTERS = ['All', 'Placed', 'Shipped', 'Delivered', 'Cancelled']
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter===f?'bg-flipblue text-white':'bg-white text-gray-600 border border-gray-300 hover:border-flipblue hover:text-flipblue'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500 text-sm mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary inline-block text-sm">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-500">ORDER ID</p>
                    <p className="text-xs font-semibold text-gray-800">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">PLACED ON</p>
                    <p className="text-xs font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TOTAL</p>
                    <p className="text-xs font-semibold text-gray-800">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-4">
                {order.items?.slice(0, 2).map(item => (
                  <div key={item._id} className="flex items-center gap-3 mb-2">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded border border-gray-100 flex-shrink-0"
                      onError={e => e.target.src='https://via.placeholder.com/50'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty} · ₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 2 && (
                  <p className="text-xs text-gray-500 mt-1">+{order.items.length - 2} more items</p>
                )}

                {/* Delivery Info */}
                {order.status === 'Delivered' ? (
                  <p className="text-xs text-green-600 font-semibold mt-2">✓ Delivered on {new Date(order.deliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                ) : order.status !== 'Cancelled' ? (
                  <p className="text-xs text-gray-500 mt-2">Expected by {new Date(order.deliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                ) : (
                  <p className="text-xs text-red-500 mt-2">Cancelled · {order.cancelReason}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <Link to={`/orders/${order._id}`} className="btn-outline text-xs py-1.5 px-4">View Details</Link>
                  {['Placed','Confirmed'].includes(order.status) && (
                    <Link to={`/orders/${order._id}`} className="text-xs text-red-500 hover:underline font-medium py-1.5 px-2">Cancel Order</Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
