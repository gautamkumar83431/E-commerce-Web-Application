import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) navigate('/')
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { token, password: form.password })
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-flipgray dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8">

        {done ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your password has been updated successfully.</p>
            <Link to="/" className="btn-primary inline-block">Go to Home & Login</Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔐</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Set New Password</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your new password below</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-16"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-flipblue font-semibold">
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-flipblue text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>Resetting...</>
                  : 'Reset Password'
                }
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
