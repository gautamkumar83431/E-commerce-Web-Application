import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = ['Address', 'Payment', 'Review']

const PAYMENT_METHODS = [
  { id: 'UPI',        label: 'UPI',                  icon: '📱', sub: 'Google Pay, PhonePe, Paytm', rzpMethod: 'upi' },
  { id: 'Card',       label: 'Credit / Debit Card',  icon: '💳', sub: 'Visa, Mastercard, RuPay',    rzpMethod: 'card' },
  { id: 'NetBanking', label: 'Net Banking',           icon: '🏦', sub: 'All major banks',            rzpMethod: 'netbanking' },
  { id: 'Wallet',     label: 'Wallets',               icon: '👛', sub: 'Paytm, Amazon Pay',          rzpMethod: 'wallet' },
  { id: 'COD',        label: 'Cash on Delivery',      icon: '💵', sub: 'Pay when delivered',         rzpMethod: null },
]

const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan',
  'Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal']

export default function Checkout() {
  const { state, dispatch, cartSavings } = useApp()
  const navigate = useNavigate()
  const [step, setStep]           = useState(0)
  const [payMethod, setPayMethod] = useState('COD')
  const [loading, setLoading]     = useState(false)
  const [selectedAddr, setSelectedAddr] = useState(
    state.user?.addresses?.findIndex(a => a.isDefault) ?? 0
  )
  const [showNewAddr, setShowNewAddr] = useState(!state.user?.addresses?.length)
  const [newAddr, setNewAddr] = useState({
    fullName: '', phone: '', pincode: '', locality: '',
    address: '', city: '', state: '', landmark: '', type: 'Home'
  })
  const [addrErrors, setAddrErrors] = useState({})

  const { cart } = state

  // ── Correct price calculation ──────────────────────────────────────────────
  // cart items already have discounted price (item.price)
  // originalTotal = sum of originalPrice * qty  (MRP)
  // itemsTotal    = sum of price * qty           (after product discount)
  // savings       = originalTotal - itemsTotal   (product discount savings)
  // shipping      = free if itemsTotal > 499
  // tax           = 0 (prices are inclusive of GST, like Flipkart/Meesho)
  // total         = itemsTotal + shipping
  const originalTotal = useMemo(() =>
    cart.reduce((a, i) => a + (i.originalPrice || i.price) * i.qty, 0), [cart])
  const itemsTotal = useMemo(() =>
    cart.reduce((a, i) => a + i.price * i.qty, 0), [cart])
  const shipping = itemsTotal > 499 ? 0 : 40
  const totalSavings = originalTotal - itemsTotal
  const total = itemsTotal + shipping

  if (!state.token) { navigate('/'); return null }
  if (!cart.length)  { navigate('/cart'); return null }

  // ── Address validation ─────────────────────────────────────────────────────
  const validateAddr = () => {
    const e = {}
    if (!newAddr.fullName.trim())              e.fullName = 'Required'
    if (!/^\d{10}$/.test(newAddr.phone))       e.phone    = 'Valid 10-digit phone required'
    if (!/^\d{6}$/.test(newAddr.pincode))      e.pincode  = 'Valid 6-digit pincode required'
    if (!newAddr.locality.trim())              e.locality = 'Required'
    if (!newAddr.address.trim())               e.address  = 'Required'
    if (!newAddr.city.trim())                  e.city     = 'Required'
    if (!newAddr.state)                        e.state    = 'Required'
    setAddrErrors(e)
    return !Object.keys(e).length
  }

  const handleAddressNext = async () => {
    if (showNewAddr) {
      if (!validateAddr()) return
      try {
        const { data } = await axios.post('/api/users/addresses', newAddr, {
          headers: { Authorization: `Bearer ${state.token}` }
        })
        dispatch({ type: 'UPDATE_USER', payload: { addresses: data.addresses } })
        setSelectedAddr(data.addresses.length - 1)
        setShowNewAddr(false)
        toast.success('Address saved!')
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save address')
        return
      }
    }
    setStep(1)
  }

  // ── Razorpay script loader ─────────────────────────────────────────────────
  const loadRazorpayScript = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload  = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  // ── Final order creation after payment ────────────────────────────────────
  const createOrder = async (razorpayPaymentId = null) => {
    setLoading(true)
    try {
      const address = state.user.addresses[selectedAddr]
      const items   = cart.map(i => ({
        product: i._id, name: i.name, image: i.image, price: i.price, qty: i.qty
      }))
      const { data } = await axios.post('/api/orders', {
        items,
        shippingAddress:  address,
        paymentMethod:    payMethod,
        itemsPrice:       itemsTotal,
        shippingPrice:    shipping,
        taxPrice:         0,
        totalPrice:       total,
        razorpayPaymentId,
      }, { headers: { Authorization: `Bearer ${state.token}` } })

      dispatch({ type: 'CLEAR_CART' })
      toast.success('🎉 Order placed successfully!')
      navigate(`/orders/${data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  // ── Main place order handler ───────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (payMethod === 'COD') {
      createOrder()
      return
    }

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast.error('Razorpay failed to load. Check your internet.')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/orders/razorpay/create',
        { amount: total },
        { headers: { Authorization: `Bearer ${state.token}` } }
      )
      setLoading(false)

      const selectedMethod = PAYMENT_METHODS.find(m => m.id === payMethod)

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      data.order.amount,
        currency:    'INR',
        name:        'ShopKart',
        description: `Payment for ${cart.length} item(s)`,
        image:       'https://i.imgur.com/n5tjHFD.png',
        order_id:    data.order.id,
        prefill: {
          name:    state.user?.name    || '',
          email:   state.user?.email   || '',
          contact: state.user?.phone   || '',
        },
        // Pre-select the payment method user chose
        config: {
          display: {
            blocks: {
              preferred: {
                name:       selectedMethod?.label,
                instruments: selectedMethod?.rzpMethod === 'upi'
                  ? [{ method: 'upi' }]
                  : selectedMethod?.rzpMethod === 'card'
                  ? [{ method: 'card' }]
                  : selectedMethod?.rzpMethod === 'netbanking'
                  ? [{ method: 'netbanking' }]
                  : [{ method: 'wallet' }],
              }
            },
            sequence: ['block.preferred'],
            preferences: { show_default_blocks: true },
          }
        },
        theme: { color: '#2874f0' },
        handler: async (response) => {
          try {
            await axios.post('/api/orders/razorpay/verify', response, {
              headers: { Authorization: `Bearer ${state.token}` }
            })
            createOrder(response.razorpay_payment_id)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled', { icon: '⚠️' })
          }
        }
      }
      new window.Razorpay(options).open()
    } catch (err) {
      setLoading(false)
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
    }
  }

  const addr = state.user?.addresses?.[selectedAddr]
  const payInfo = PAYMENT_METHODS.find(m => m.id === payMethod)

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">

      {/* Steps */}
      <div className="flex items-center justify-center mb-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-flipblue' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${i < step ? 'bg-flipblue border-flipblue text-white' : i === step ? 'border-flipblue text-flipblue' : 'border-gray-300'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-semibold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 max-w-16 ${i < step ? 'bg-flipblue' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <AnimatePresence mode="wait">

            {/* ── Step 0: Address ── */}
            {step === 0 && (
              <motion.div key="addr"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 text-lg">Delivery Address</h2>

                {state.user?.addresses?.map((a, i) => (
                  <label key={i}
                    className={`flex gap-3 p-3 rounded border-2 mb-3 cursor-pointer transition-all
                      ${selectedAddr === i && !showNewAddr ? 'border-flipblue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" checked={selectedAddr === i && !showNewAddr}
                      onChange={() => { setSelectedAddr(i); setShowNewAddr(false) }}
                      className="mt-1 accent-flipblue" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{a.fullName}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{a.type}</span>
                        {a.isDefault && <span className="text-xs bg-blue-100 text-flipblue px-1.5 py-0.5 rounded font-medium">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600">{a.address}, {a.locality}</p>
                      <p className="text-sm text-gray-600">{a.city}, {a.state} – {a.pincode}</p>
                      <p className="text-sm text-gray-500">📞 {a.phone}</p>
                    </div>
                  </label>
                ))}

                <button onClick={() => setShowNewAddr(!showNewAddr)}
                  className="flex items-center gap-2 text-flipblue font-semibold text-sm hover:underline mb-3">
                  <span className="text-lg">+</span> Add New Address
                </button>

                <AnimatePresence>
                  {showNewAddr && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded border border-gray-200">
                        {[
                          { key: 'fullName', label: 'Full Name',                  type: 'text', col: 2 },
                          { key: 'phone',    label: 'Mobile Number',              type: 'tel',  col: 1 },
                          { key: 'pincode',  label: 'Pincode',                    type: 'text', col: 1 },
                          { key: 'address',  label: 'Address (House No, Street)', type: 'text', col: 2 },
                          { key: 'locality', label: 'Locality / Town',            type: 'text', col: 1 },
                          { key: 'city',     label: 'City / District',            type: 'text', col: 1 },
                          { key: 'landmark', label: 'Landmark (Optional)',        type: 'text', col: 2 },
                        ].map(f => (
                          <div key={f.key} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                            <input type={f.type} value={newAddr[f.key]}
                              onChange={e => setNewAddr(p => ({ ...p, [f.key]: e.target.value }))}
                              className={`input text-sm ${addrErrors[f.key] ? 'border-red-400' : ''}`} />
                            {addrErrors[f.key] && <p className="text-red-500 text-xs mt-0.5">{addrErrors[f.key]}</p>}
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">State</label>
                          <select value={newAddr.state}
                            onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}
                            className={`input text-sm ${addrErrors.state ? 'border-red-400' : ''}`}>
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {addrErrors.state && <p className="text-red-500 text-xs mt-0.5">{addrErrors.state}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Type</label>
                          <div className="flex gap-2 mt-1">
                            {['Home', 'Work', 'Other'].map(t => (
                              <button key={t} type="button" onClick={() => setNewAddr(p => ({ ...p, type: t }))}
                                className={`px-3 py-1.5 rounded border text-xs font-medium transition-all
                                  ${newAddr.type === t ? 'border-flipblue bg-blue-50 text-flipblue' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleAddressNext} className="btn-primary w-full mt-4 py-3 font-bold">
                  Deliver to this Address →
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Payment ── */}
            {step === 1 && (
              <motion.div key="pay"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 text-lg">Payment Method</h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.id}
                      className={`flex items-center gap-3 p-3 rounded border-2 cursor-pointer transition-all
                        ${payMethod === m.id ? 'border-flipblue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" checked={payMethod === m.id}
                        onChange={() => setPayMethod(m.id)} className="accent-flipblue" />
                      <span className="text-xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.sub}</p>
                      </div>
                      {m.id !== 'COD' && (
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">Instant</span>
                      )}
                    </label>
                  ))}
                </div>

                {/* COD note */}
                {payMethod === 'COD' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    💡 Cash on Delivery available. Pay ₹{total.toLocaleString('en-IN')} when your order arrives.
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1 py-2.5">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-2.5 font-bold">Continue →</button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <motion.div key="review"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 text-lg">Review Your Order</h2>

                {/* Delivery address summary */}
                {addr && (
                  <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Delivering to</p>
                      <button onClick={() => setStep(0)} className="text-xs text-flipblue hover:underline">Change</button>
                    </div>
                    <p className="font-semibold text-sm">{addr.fullName} · {addr.phone}</p>
                    <p className="text-sm text-gray-600">{addr.address}, {addr.locality}, {addr.city}, {addr.state} – {addr.pincode}</p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 items-center py-2 border-b border-gray-50 last:border-0">
                      <img src={item.image} alt={item.name}
                        className="w-14 h-14 object-contain rounded border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                          <span className="text-xs text-gray-500">× {item.qty}</span>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-gray-900 flex-shrink-0">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Payment method summary */}
                <div className="bg-blue-50 rounded p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{payInfo?.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">Payment via</p>
                      <p className="font-semibold text-sm">{payInfo?.label}</p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-flipblue hover:underline">Change</button>
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded p-3 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>MRP ({cart.reduce((a, i) => a + i.qty, 0)} items)</span>
                    <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Product Discount</span>
                      <span>− ₹{totalSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total Payable</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-green-600 text-xs font-semibold text-center bg-green-50 rounded p-1.5">
                      🎉 You save ₹{totalSavings.toLocaleString('en-IN')} on this order!
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-2.5">← Back</button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} disabled={loading}
                    className="btn-secondary flex-1 py-2.5 font-bold flex items-center justify-center gap-2">
                    {loading
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Processing...</>
                      : payMethod === 'COD'
                        ? '🎉 Place Order'
                        : `💳 Pay ₹${total.toLocaleString('en-IN')}`
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 border-b pb-2">
              Price Details
            </h3>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">MRP ({cart.reduce((a, i) => a + i.qty, 0)} items)</span>
                <span>₹{originalTotal.toLocaleString('en-IN')}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>− ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              {totalSavings > 0 && (
                <p className="text-green-600 text-xs font-semibold bg-green-50 rounded p-2 text-center">
                  🎉 You save ₹{totalSavings.toLocaleString('en-IN')}!
                </p>
              )}
            </div>

            {/* Items mini list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto border-t pt-2">
              {cart.map(i => (
                <div key={i._id} className="flex items-center gap-2">
                  <img src={i.image} alt={i.name} className="w-8 h-8 object-contain rounded flex-shrink-0" />
                  <span className="text-xs text-gray-600 line-clamp-1 flex-1">{i.name}</span>
                  <span className="text-xs font-medium text-gray-700 flex-shrink-0">×{i.qty}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              🔒 Safe & Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
