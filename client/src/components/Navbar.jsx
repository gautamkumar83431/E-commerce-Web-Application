import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const CATEGORIES = ['Electronics','Fashion','Home & Furniture','Appliances','Beauty','Sports','Books','Toys','Grocery']

export default function Navbar() {
  const { state, dispatch, cartCount, markNotificationRead, markAllNotificationsRead, fetchNotifications } = useApp()
  const [search, setSearch] = useState('')
  const [showUser, setShowUser] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const navigate = useNavigate()
  const userRef = useRef()
  const notifRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Poll notifications every 30s when logged in
  useEffect(() => {
    if (!state.token) return
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [state.token, fetchNotifications])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setMobileSearch(false) }
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    setShowUser(false)
    navigate('/')
  }

  const handleNotifClick = (notif) => {
    markNotificationRead(notif._id)
    setShowNotif(false)
    if (notif.orderId) navigate(`/orders/${notif.orderId}`)
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date)
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <header className="bg-flipblue dark:bg-gray-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center h-14 gap-3">

          {/* Logo - Left */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="text-white font-bold text-lg sm:text-xl italic leading-tight">
              E-Commerce Store
              <div className="text-[10px] text-flipyellow font-normal italic -mt-0.5 flex items-center gap-0.5">
                Explore <span className="text-white font-bold">Plus</span>
                <span className="text-flipyellow">✦</span>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop Centered */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 mx-4">
            <div className="relative w-full max-w-2xl mx-auto">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-4 pr-12 py-2 rounded text-sm text-gray-800 outline-none focus:shadow-lg transition-shadow" />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 text-flipblue hover:text-blue-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Mobile Search Toggle */}
          <button onClick={() => setMobileSearch(!mobileSearch)} className="sm:hidden text-white p-1 ml-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Right Actions - pinned to right */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto sm:ml-0">

            {/* Dark Mode Toggle */}
            <button onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
              className="text-white p-1.5 hover:text-flipyellow transition-colors rounded-full hover:bg-white/10"
              title={state.darkMode ? 'Light Mode' : 'Dark Mode'}>
              {state.darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 00-1.06-1.061L6.166 6.166z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                </svg>
              )}
            </button>

            {/* Notifications Bell */}
            {state.token && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(!showNotif)}
                  className="relative text-white p-1.5 hover:text-flipyellow transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {state.unreadCount > 0 && (
                    <motion.span key={state.unreadCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {state.unreadCount > 9 ? '9+' : state.unreadCount}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotif && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 bg-white dark:bg-gray-800 rounded shadow-2xl w-80 z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <p className="font-bold text-sm text-gray-800 dark:text-white">Notifications</p>
                        {state.unreadCount > 0 && (
                          <button onClick={markAllNotificationsRead}
                            className="text-xs text-flipblue hover:underline font-medium">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {state.notifications.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-3xl mb-2">🔔</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                          </div>
                        ) : state.notifications.map(n => (
                          <button key={n._id} onClick={() => handleNotifClick(n)}
                            className={`w-full text-left px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex items-start gap-2">
                              <span className="text-lg flex-shrink-0 mt-0.5">
                                {n.type === 'order' ? '📦' : n.type === 'promo' ? '🎉' : '🔔'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                              {!n.read && <span className="w-2 h-2 bg-flipblue rounded-full flex-shrink-0 mt-1" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Login / User */}
            <div className="relative" ref={userRef}>
              {state.token ? (
                <button onClick={() => setShowUser(!showUser)}
                  className="flex items-center gap-1.5 bg-white text-flipblue px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-flipblue text-white flex items-center justify-center text-xs font-bold">
                    {state.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate">{state.user?.name?.split(' ')[0]}</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button onClick={() => dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login' } })}
                  className="bg-white text-flipblue px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-50 transition-colors">
                  Login
                </button>
              )}

              <AnimatePresence>
                {showUser && state.token && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 bg-white dark:bg-gray-800 rounded shadow-2xl w-56 z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{state.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{state.user?.email}</p>
                    </div>
                    {[
                      { label: 'My Profile', icon: '👤', to: '/profile' },
                      { label: 'My Orders', icon: '📦', to: '/orders' },
                      { label: 'Wishlist', icon: '❤️', to: '/wishlist' },
                      ...(state.user?.role === 'admin' ? [{ label: 'Admin Panel', icon: '⚙️', to: '/admin' }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setShowUser(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-flipblue transition-colors">
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <div className="border-t dark:border-gray-600">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <span>🚪</span>Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative flex flex-col items-center text-white px-2 py-1 hover:text-flipyellow transition-colors group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[10px] hidden sm:block">Wishlist</span>
              {state.wishlist.length > 0 && (
                <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {state.wishlist.length > 9 ? '9+' : state.wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center text-white px-2 py-1 hover:text-flipyellow transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[10px] hidden sm:block">Cart</span>
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="sm:hidden pb-2 overflow-hidden">
              <form onSubmit={handleSearch} className="flex">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..." autoFocus
                  className="flex-1 px-3 py-2 rounded-l text-sm outline-none" />
                <button type="submit" className="bg-flipyellow px-4 rounded-r text-flipblue font-bold text-sm">Go</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Bar */}
        <div className="hidden md:flex items-center justify-between pb-1.5">
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
              className="text-white text-xs font-medium whitespace-nowrap hover:text-flipyellow transition-colors pb-0.5 border-b-2 border-transparent hover:border-flipyellow">
              {cat}
            </Link>
          ))}
          <Link to="/products" className="text-flipyellow text-xs font-bold whitespace-nowrap">More ▾</Link>
        </div>
      </div>
    </header>
  )
}
