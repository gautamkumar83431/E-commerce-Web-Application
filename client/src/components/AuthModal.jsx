import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function AuthModal() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  useEffect(() => { if (state.showAuth) { setTab(state.authTab || 'login'); setErrors({}); setForgotSent(false) } }, [state.showAuth, state.authTab])

  const ch = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors(er => ({ ...er, [e.target.name]: '' })) }

  const pwdRules = [
    { label: 'At least 8 characters', test: p => p.length >= 8 },
    { label: 'One number (0-9)', test: p => /[0-9]/.test(p) },
    { label: 'One special character (!@#$…)', test: p => /[^A-Za-z0-9]/.test(p) },
  ]

  const validate = () => {
    const e = {}
    if (tab === 'register' && !form.name.trim()) e.name = 'Name required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (tab !== 'forgot') {
      if (!pwdRules.every(r => r.test(form.password)))
        e.password = 'Password must be 8+ chars with a number & special character'
      if (tab === 'register' && form.password !== form.confirm) e.confirm = 'Passwords do not match'
    }
    setErrors(e); return !Object.keys(e).length
  }

  const submit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (tab === 'forgot') {
        await axios.post('/api/auth/forgot-password', { email: form.email })
        setForgotSent(true)
        toast.success('Reset link sent!')
      } else {
        const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
        const payload = tab === 'login' ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password }
        const { data } = await axios.post(url, payload)
        dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } })
        toast.success(tab === 'login' ? `Welcome back, ${data.user.name}! 👋` : `Account created! Welcome ${data.user.name}! 🎉`)
        if (state.pendingCb) setTimeout(() => state.pendingCb(), 100)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const switchTab = t => { setTab(t); setErrors({}); setForgotSent(false); setForm({ name: '', email: '', password: '', confirm: '' }) }
  const close = () => dispatch({ type: 'HIDE_AUTH' })

  return (
    <AnimatePresence>
      {state.showAuth && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex max-h-[90vh]" onClick={e => e.stopPropagation()}>

              {/* Left Blue Panel */}
              <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-flipblue to-blue-800 p-8 w-[42%] text-white">
                <div>
                  <h2 className="text-2xl font-bold mb-2 leading-tight">
                    {tab === 'login' ? 'Login' : tab === 'register' ? "Looks like you're new here!" : 'Forgot Password?'}
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed mt-3">
                    {tab === 'login' ? 'Get access to your Orders, Wishlist and Recommendations'
                      : tab === 'register' ? 'Sign up with your email to get started on E-Commerce Store'
                      : 'Enter your registered email to receive a password reset link'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-2">🛍️</div>
                  <p className="text-blue-200 text-xs">India's #1 Shopping Destination</p>
                </div>
              </div>

              {/* Right Form Panel */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative">
                <button onClick={close} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                  {['login', 'register'].map(t => (
                    <button key={t} onClick={() => switchTab(t)}
                      className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${tab === t ? 'border-flipblue text-flipblue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      {t === 'login' ? 'Login' : 'New Account'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {forgotSent ? (
                    <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                      <div className="text-5xl mb-3">📧</div>
                      <h3 className="font-bold text-gray-800 mb-1">Check your email!</h3>
                      <p className="text-gray-500 text-sm mb-4">We sent a password reset link to <strong>{form.email}</strong></p>
                      <button onClick={() => switchTab('login')} className="text-flipblue font-semibold text-sm hover:underline">Back to Login</button>
                    </motion.div>
                  ) : (
                    <motion.form key={tab} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }} onSubmit={submit} className="space-y-4">

                      {tab === 'register' && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                          <input name="name" value={form.name} onChange={ch} placeholder="Enter your full name"
                            className={`input mt-1 ${errors.name ? 'border-red-400 focus:border-red-400' : ''}`} />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                        <input name="email" type="email" value={form.email} onChange={ch} placeholder="Enter your email"
                          className={`input mt-1 ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      {tab !== 'forgot' && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                          <div className="relative mt-1">
                            <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={ch}
                              placeholder="Enter password (min 6 chars)"
                              className={`input pr-16 ${errors.password ? 'border-red-400 focus:border-red-400' : ''}`} />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-flipblue font-semibold hover:underline">
                              {showPwd ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                          {tab === 'register' && form.password && (
                            <ul className="mt-2 space-y-1">
                              {pwdRules.map(r => (
                                <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span>{r.test(form.password) ? '✓' : '○'}</span>{r.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {tab === 'register' && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password</label>
                          <input name="confirm" type="password" value={form.confirm} onChange={ch} placeholder="Re-enter password"
                            className={`input mt-1 ${errors.confirm ? 'border-red-400 focus:border-red-400' : ''}`} />
                          {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                        </div>
                      )}

                      {tab === 'login' && (
                        <div className="flex justify-end">
                          <button type="button" onClick={() => switchTab('forgot')} className="text-xs text-flipblue hover:underline font-medium">
                            Forgot Password?
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        By continuing, you agree to E-Commerce's{' '}
                        <span className="text-flipblue cursor-pointer hover:underline">Terms of Use</span> &{' '}
                        <span className="text-flipblue cursor-pointer hover:underline">Privacy Policy</span>.
                      </p>

                      <button type="submit" disabled={loading}
                        className="w-full bg-flipsecondary text-white py-3 rounded font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>Please wait...</>
                        ) : tab === 'login' ? 'Login' : tab === 'register' ? 'Create Account' : 'Send Reset Link'}
                      </button>

                      {tab === 'login' && (
                        <p className="text-center text-sm text-gray-500">
                          New to E-Commerce Store?{' '}
                          <button type="button" onClick={() => switchTab('register')} className="text-flipblue font-bold hover:underline">Create an account</button>
                        </p>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
