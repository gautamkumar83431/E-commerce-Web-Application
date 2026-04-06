import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal']

export default function Profile() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ name: state.user?.name||'', phone: state.user?.phone||'', gender: state.user?.gender||'', dob: state.user?.dob||'' })
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [showAddAddr, setShowAddAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({ fullName:'', phone:'', pincode:'', locality:'', address:'', city:'', state:'', landmark:'', type:'Home', isDefault:false })

  if (!state.token) { navigate('/'); return null }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put('/api/users/profile', profile, { headers: { Authorization: `Bearer ${state.token}` } })
      dispatch({ type: 'UPDATE_USER', payload: data.user })
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (pwdForm.newPassword.length < 6) { toast.error('Min 6 characters'); return }
    setSaving(true)
    try {
      await axios.put('/api/users/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }, { headers: { Authorization: `Bearer ${state.token}` } })
      toast.success('Password changed!')
      setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const addAddress = async () => {
    if (!newAddr.fullName||!newAddr.phone||!newAddr.address||!newAddr.city||!newAddr.state||!newAddr.pincode) { toast.error('Fill all required fields'); return }
    setSaving(true)
    try {
      const { data } = await axios.post('/api/users/addresses', newAddr, { headers: { Authorization: `Bearer ${state.token}` } })
      dispatch({ type: 'UPDATE_USER', payload: { addresses: data.addresses } })
      setShowAddAddr(false)
      setNewAddr({ fullName:'', phone:'', pincode:'', locality:'', address:'', city:'', state:'', landmark:'', type:'Home', isDefault:false })
      toast.success('Address added!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`/api/users/addresses/${id}`, { headers: { Authorization: `Bearer ${state.token}` } })
      dispatch({ type: 'UPDATE_USER', payload: { addresses: data.addresses } })
      toast.success('Address removed')
    } catch { toast.error('Failed') }
  }

  const TABS = [
    { id:'profile', label:'Personal Info', icon:'👤' },
    { id:'addresses', label:'Addresses', icon:'📍' },
    { id:'password', label:'Password', icon:'🔒' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Account</h1>
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Sidebar */}
        <div className="sm:w-56 flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-4 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-flipblue text-white flex items-center justify-center text-xl font-bold">
                {state.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{state.user?.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{state.user?.email}</p>
              </div>
            </div>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium transition-all mb-1 ${tab===t.id?'bg-blue-50 text-flipblue':'text-gray-600 hover:bg-gray-50'}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
            <hr className="my-2" />
            <a href="/become-seller"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors">
              <span>🏪</span>Become a Seller
            </a>
            <hr className="my-2" />
            <button onClick={() => { dispatch({ type:'LOGOUT' }); navigate('/') }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <span>🚪</span>Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">

            {/* Profile Tab */}
            {tab === 'profile' && (
              <motion.div key="profile" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="bg-white rounded shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Full Name</label>
                    <input value={profile.name} onChange={e => setProfile(p=>({...p,name:e.target.value}))} className="input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Mobile Number</label>
                    <input value={profile.phone} onChange={e => setProfile(p=>({...p,phone:e.target.value}))} className="input text-sm" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Email Address</label>
                    <input value={state.user?.email} disabled className="input text-sm bg-gray-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Date of Birth</label>
                    <input type="date" value={profile.dob} onChange={e => setProfile(p=>({...p,dob:e.target.value}))} className="input text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Gender</label>
                    <div className="flex gap-3">
                      {['Male','Female','Other'].map(g => (
                        <label key={g} className={`flex items-center gap-2 px-4 py-2 rounded border-2 cursor-pointer transition-all ${profile.gender===g?'border-flipblue bg-blue-50 text-flipblue':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <input type="radio" checked={profile.gender===g} onChange={() => setProfile(p=>({...p,gender:g}))} className="accent-flipblue" />
                          <span className="text-sm font-medium">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="btn-primary mt-5 px-8 py-2.5 text-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {tab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="bg-white rounded shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddr(!showAddAddr)} className="btn-outline text-xs py-1.5 px-3">+ Add New</button>
                </div>

                <AnimatePresence>
                  {showAddAddr && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                      className="overflow-hidden mb-4">
                      <div className="bg-gray-50 rounded border border-gray-200 p-4">
                        <h3 className="font-semibold text-sm text-gray-700 mb-3">New Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[{k:'fullName',l:'Full Name'},{k:'phone',l:'Phone'},{k:'pincode',l:'Pincode'},{k:'locality',l:'Locality'},{k:'city',l:'City'},{k:'landmark',l:'Landmark (Optional)'}].map(f => (
                            <div key={f.k}>
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.l}</label>
                              <input value={newAddr[f.k]} onChange={e => setNewAddr(p=>({...p,[f.k]:e.target.value}))} className="input text-sm" />
                            </div>
                          ))}
                          <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Address</label>
                            <input value={newAddr.address} onChange={e => setNewAddr(p=>({...p,address:e.target.value}))} className="input text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">State</label>
                            <select value={newAddr.state} onChange={e => setNewAddr(p=>({...p,state:e.target.value}))} className="input text-sm">
                              <option value="">Select State</option>
                              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                            <div className="flex gap-2">
                              {['Home','Work','Other'].map(t => (
                                <button key={t} type="button" onClick={() => setNewAddr(p=>({...p,type:t}))}
                                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${newAddr.type===t?'border-flipblue bg-blue-50 text-flipblue':'border-gray-300 text-gray-600'}`}>{t}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => setShowAddAddr(false)} className="btn-outline text-xs py-1.5 px-4">Cancel</button>
                          <button onClick={addAddress} disabled={saving} className="btn-primary text-xs py-1.5 px-4">{saving?'Saving...':'Save Address'}</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {state.user?.addresses?.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No saved addresses. Add one above.</p>
                ) : (
                  <div className="space-y-3">
                    {state.user?.addresses?.map((a, i) => (
                      <div key={a._id || i} className={`p-3 rounded border-2 ${a.isDefault?'border-flipblue bg-blue-50':'border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{a.fullName}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{a.type}</span>
                              {a.isDefault && <span className="text-xs bg-blue-100 text-flipblue px-1.5 py-0.5 rounded font-medium">Default</span>}
                            </div>
                            <p className="text-sm text-gray-600">{a.address}, {a.locality}</p>
                            <p className="text-sm text-gray-600">{a.city}, {a.state} - {a.pincode}</p>
                            <p className="text-xs text-gray-500 mt-0.5">📞 {a.phone}</p>
                          </div>
                          <button onClick={() => deleteAddress(a._id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Password Tab */}
            {tab === 'password' && (
              <motion.div key="password" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="bg-white rounded shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Change Password</h2>
                <div className="max-w-sm space-y-4">
                  {[{k:'currentPassword',l:'Current Password'},{k:'newPassword',l:'New Password'},{k:'confirmPassword',l:'Confirm New Password'}].map(f => (
                    <div key={f.k}>
                      <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">{f.l}</label>
                      <input type="password" value={pwdForm[f.k]} onChange={e => setPwdForm(p=>({...p,[f.k]:e.target.value}))} className="input text-sm" />
                    </div>
                  ))}
                  <button onClick={changePassword} disabled={saving} className="btn-primary py-2.5 px-8 text-sm">
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
