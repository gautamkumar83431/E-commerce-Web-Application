import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useApp } from '../context/AppContext.jsx'
import Loader from '../components/Loader.jsx'
import toast from 'react-hot-toast'

const TRACK_STEPS = ['Placed','Confirmed','Shipped','Out for Delivery','Delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!state.token) { navigate('/'); return }
    axios.get(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${state.token}` } })
      .then(r => setOrder(r.data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id, state.token])

  const cancelOrder = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason'); return }
    setCancelling(true)
    try {
      const { data } = await axios.put(`/api/orders/${id}/cancel`, { reason }, { headers: { Authorization: `Bearer ${state.token}` } })
      setOrder(data.order)
      setShowCancel(false)
      toast.success('Order cancelled successfully')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCancelling(false) }
  }

  const returnOrder = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason'); return }
    setCancelling(true)
    try {
      const { data } = await axios.put(`/api/orders/${id}/return`, { reason }, { headers: { Authorization: `Bearer ${state.token}` } })
      setOrder(data.order)
      setShowReturn(false)
      toast.success('Return request submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCancelling(false) }
  }

  if (loading) return <Loader />
  if (!order) return null

  const stepIdx = TRACK_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'
  const isReturned = ['Return Requested','Returned'].includes(order.status)

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/orders')} className="text-flipblue hover:underline text-sm font-medium">← My Orders</button>
        <span className="text-gray-400">›</span>
        <span className="text-sm text-gray-600">Order #{order.orderId}</span>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 mb-4 ${isCancelled?'bg-red-50 border border-red-200':isReturned?'bg-purple-50 border border-purple-200':'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold text-lg ${isCancelled?'text-red-700':isReturned?'text-purple-700':'text-green-700'}`}>
              {isCancelled ? '✗ Order Cancelled' : isReturned ? '↩ Return Requested' : order.status === 'Delivered' ? '✓ Order Delivered' : `📦 ${order.status}`}
            </p>
            {order.status === 'Delivered' && (
              <p className="text-sm text-green-600">Delivered on {new Date(order.deliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
            )}
            {!isCancelled && !isReturned && order.status !== 'Delivered' && (
              <p className="text-sm text-gray-600">Expected by {new Date(order.deliveryDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
            )}
          </div>
          <span className="text-3xl">{isCancelled?'❌':isReturned?'↩️':order.status==='Delivered'?'✅':'📦'}</span>
        </div>
      </div>

      {/* Tracking */}
      {!isCancelled && !isReturned && (
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-4">Order Tracking</h3>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
            {TRACK_STEPS.map((s, i) => {
              const done = stepIdx >= i
              const current = stepIdx === i
              return (
                <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 mb-4 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${done?'bg-green-500 border-green-500 text-white':current?'bg-white border-flipblue':'bg-white border-gray-300'}`}>
                    {done ? <span className="text-xs">✓</span> : <span className="text-xs text-gray-400">{i+1}</span>}
                  </div>
                  <div className={`pt-0.5 ${done?'text-gray-800':'text-gray-400'}`}>
                    <p className={`text-sm font-semibold ${current?'text-flipblue':''}`}>{s}</p>
                    {order.statusHistory?.find(h => h.status === s) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.statusHistory.find(h=>h.status===s).date).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Order Items</h3>
        {order.items?.map(item => (
          <div key={item._id} className="flex gap-3 items-center py-2 border-b border-gray-50 last:border-0">
            <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded border border-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</p>
            </div>
            <p className="font-bold text-sm text-gray-900 flex-shrink-0">₹{(item.price*item.qty).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Price & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Items Price</span><span>₹{order.itemsPrice?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className={order.shippingPrice===0?'text-green-600':''}>{order.shippingPrice===0?'FREE':`₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>₹{order.taxPrice?.toLocaleString('en-IN')}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>₹{order.totalPrice?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">Payment</span><span className="font-medium">{order.paymentMethod} · <span className={order.paymentStatus==='Paid'?'text-green-600 font-semibold':'text-orange-500 font-semibold'}>{order.paymentStatus}</span></span></div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between text-xs"><span className="text-gray-500">Payment ID</span><span className="font-mono text-gray-600 text-xs">{order.razorpayPaymentId}</span></div>
            )}
          </div>
        </div>
        <div className="bg-white rounded shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">Delivery Address</h3>
          {order.shippingAddress && (
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.locality}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-gray-500">📞 {order.shippingAddress.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {['Placed','Confirmed'].includes(order.status) && (
          <button onClick={() => setShowCancel(true)} className="border border-red-400 text-red-500 hover:bg-red-50 px-4 py-2 rounded text-sm font-semibold transition-colors">
            Cancel Order
          </button>
        )}
        {order.status === 'Delivered' && (
          <button onClick={() => setShowReturn(true)} className="border border-orange-400 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded text-sm font-semibold transition-colors">
            Return / Exchange
          </button>
        )}
        <Link to="/products" className="btn-primary text-sm py-2 px-4">Continue Shopping</Link>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-3">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-3">Please tell us why you want to cancel:</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Reason for cancellation..." className="input text-sm resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="btn-outline flex-1 py-2 text-sm">Keep Order</button>
              <button onClick={cancelOrder} disabled={cancelling} className="flex-1 py-2 bg-red-500 text-white rounded font-semibold text-sm hover:bg-red-600 disabled:opacity-60 transition-colors">
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-3">Return / Exchange</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Reason for return..." className="input text-sm resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowReturn(false)} className="btn-outline flex-1 py-2 text-sm">Cancel</button>
              <button onClick={returnOrder} disabled={cancelling} className="flex-1 py-2 bg-orange-500 text-white rounded font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition-colors">
                {cancelling ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
