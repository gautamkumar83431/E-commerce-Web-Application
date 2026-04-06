import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext.jsx'
import Loader from '../../components/Loader.jsx'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Placed','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled','Returned']
const STATUS_COLOR = {
  'Placed':'bg-blue-100 text-blue-700','Confirmed':'bg-indigo-100 text-indigo-700',
  'Shipped':'bg-yellow-100 text-yellow-700','Out for Delivery':'bg-orange-100 text-orange-700',
  'Delivered':'bg-green-100 text-green-700','Cancelled':'bg-red-100 text-red-700',
  'Return Requested':'bg-purple-100 text-purple-700','Returned':'bg-gray-100 text-gray-700',
}

export default function AdminOrders() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!state.token || state.user?.role !== 'admin') { navigate('/'); return }
    axios.get('/api/orders/all', { headers: { Authorization: `Bearer ${state.token}` } })
      .then(r => setOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [state.token])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${state.token}` } })
      setOrders(os => os.map(o => o._id === orderId ? data.order : o))
      toast.success(`Order status updated to ${status}`)
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(null) }
  }

  const FILTERS = ['All', ...STATUS_OPTIONS]
  const filtered = orders.filter(o => {
    const matchFilter = filter === 'All' || o.status === filter
    const matchSearch = !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o.user?.email?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Manage Orders ({orders.length})</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Search by order ID or customer..." value={search}
          onChange={e => setSearch(e.target.value)} className="input text-sm max-w-xs" />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter===f?'bg-flipblue text-white':'bg-white text-gray-600 border border-gray-300 hover:border-flipblue'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order, i) => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-gray-700">{order.orderId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-xs text-gray-800">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, j) => (
                        <img key={j} src={item.image} alt={item.name}
                          className="w-7 h-7 rounded border-2 border-white object-contain bg-gray-50"
                          onError={e => e.target.src='https://via.placeholder.com/28'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-bold text-xs text-gray-800">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                    <p className={`text-xs font-medium ${order.paymentStatus==='Paid'?'text-green-600':'text-orange-500'}`}>{order.paymentStatus}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-600">{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      disabled={updating === order._id || ['Cancelled','Returned'].includes(order.status)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-flipblue disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
