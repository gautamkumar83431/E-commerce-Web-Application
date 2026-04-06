import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext.jsx'
import Loader from '../../components/Loader.jsx'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state.token || state.user?.role !== 'admin') { navigate('/'); return }
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${state.token}` } })
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [state.token])

  if (loading) return <Loader />

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-500', link: '/admin/orders' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: 'bg-green-500', link: '/admin/products' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'bg-orange-500', link: '/admin/orders' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-purple-500', link: '/admin/orders' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="btn-primary text-sm py-2 px-4">Manage Products</Link>
          <Link to="/admin/orders" className="btn-outline text-sm py-2 px-4">Manage Orders</Link>
          <Link to="/admin/sellers" className="btn-outline text-sm py-2 px-4">Seller Requests</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={c.link} className="bg-white rounded shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
              <div className={`${c.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {stats?.ordersByStatus && (
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-4">Orders by Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded p-3 text-center border border-gray-100">
                <p className="text-xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.last7Days && (
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-4">Last 7 Days Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500 font-semibold">Day</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Orders</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.last7Days.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-700">{d.date}</td>
                    <td className="py-2 text-right font-medium">{d.orders}</td>
                    <td className="py-2 text-right font-medium text-green-600">₹{d.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
