import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext.jsx'
import Loader from '../../components/Loader.jsx'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }

export default function AdminSellers() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!state.token || state.user?.role !== 'admin') { navigate('/'); return }
    fetchRequests()
  }, [state.token, filter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const { data } = await axios.get(`/api/seller${params}`, { headers: { Authorization: `Bearer ${state.token}` } })
      setRequests(data.requests || [])
    } catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`/api/seller/${id}`, { status }, { headers: { Authorization: `Bearer ${state.token}` } })
      setRequests(r => r.map(req => req._id === id ? data.request : req))
      if (selected?._id === id) setSelected(data.request)
      toast.success(`Request ${status}!`)
    } catch { toast.error('Failed to update status') }
  }

  if (loading) return <Loader />

  const counts = { all: requests.length, pending: requests.filter(r => r.status === 'pending').length, approved: requests.filter(r => r.status === 'approved').length, rejected: requests.filter(r => r.status === 'rejected').length }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏪 Seller Requests</h1>
        <button onClick={() => navigate('/admin')} className="btn-outline text-sm py-2 px-4">← Dashboard</button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? 'bg-flipblue text-white' : 'bg-white text-gray-600 border hover:border-flipblue'}`}>
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">No {filter !== 'all' ? filter : ''} seller requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {requests.map((req, i) => (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(req)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer border-2 transition-all hover:shadow-md ${selected?._id === req._id ? 'border-flipblue' : 'border-transparent'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{req.businessName}</p>
                    <p className="text-xs text-gray-500 truncate">{req.name} · {req.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 capitalize ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selected.businessName}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                  </div>
                  {selected.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(selected._id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded font-medium transition-colors">✓ Approve</button>
                      <button onClick={() => updateStatus(selected._id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded font-medium transition-colors">✗ Reject</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Full Name', value: selected.name },
                    { label: 'Email', value: selected.email },
                    { label: 'Phone', value: selected.phone },
                    { label: 'Business Type', value: selected.businessType },
                    { label: 'GST Number', value: selected.gst || '—' },
                    { label: 'Applied On', value: new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="font-medium text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-gray-50 rounded p-3 text-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Business Address</p>
                  <p className="font-medium text-gray-800">{selected.address}</p>
                </div>
                {selected.description && (
                  <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                    <p className="text-xs text-gray-500 mb-0.5">About Business</p>
                    <p className="text-gray-700">{selected.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
                <div className="text-4xl mb-2">👈</div>
                <p className="text-sm">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
