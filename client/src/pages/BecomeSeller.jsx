import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const BUSINESS_TYPES = ['Manufacturer', 'Wholesaler', 'Retailer', 'Distributor', 'Other']

const benefits = [
  { icon: '🚀', title: 'Reach Crores of Customers', desc: 'List your products and reach millions of buyers across India' },
  { icon: '💰', title: 'Fast Payments', desc: 'Get payments directly in your bank account within 7-10 days' },
  { icon: '📦', title: 'Easy Shipping', desc: 'We handle logistics and delivery for your orders' },
  { icon: '📊', title: 'Seller Dashboard', desc: 'Track your sales, orders and performance in real-time' },
]

export default function BecomeSeller() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', businessType: '', gst: '', address: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.businessName || !form.businessType || !form.address)
      return toast.error('Please fill all required fields')
    if (!/^\d{10}$/.test(form.phone))
      return toast.error('Enter valid 10-digit phone number')
    if (!/\S+@\S+\.\S+/.test(form.email))
      return toast.error('Enter valid email address')

    setSubmitting(true)
    try {
      await axios.post('/api/seller', form)
      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-4">Thank you for applying. Our team will review your application and contact you within 2-3 business days.</p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          📧 A confirmation will be sent to <strong>{form.email}</strong>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-flipblue to-blue-700 rounded-xl p-6 sm:p-10 text-white text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Become a Seller</h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">Join lakhs of sellers on India's most trusted e-commerce platform and grow your business online</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {benefits.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 text-center border border-gray-100">
            <div className="text-3xl mb-2">{b.icon}</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{b.title}</h3>
            <p className="text-xs text-gray-500">{b.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">📝 Seller Registration Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="business@email.com" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
              <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Your business / shop name" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type <span className="text-red-500">*</span></label>
              <select name="businessType" value={form.businessType} onChange={handleChange} className="input text-sm">
                <option value="">Select type</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number <span className="text-gray-400 text-xs">(optional)</span></label>
              <input name="gst" value={form.gst} onChange={handleChange} placeholder="GST registration number" className="input text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address <span className="text-red-500">*</span></label>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full business address with city, state and pincode" rows={2} className="input text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Your Business <span className="text-gray-400 text-xs">(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell us about your products and business..." rows={3} className="input text-sm resize-none" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm font-bold">
            {submitting ? 'Submitting...' : '🚀 Submit Application'}
          </button>
          <p className="text-xs text-gray-400 text-center">By submitting, you agree to our seller terms and conditions</p>
        </form>
      </div>
    </div>
  )
}
