import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

const Ctx = createContext()

const saved = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch { return d } }

const init = {
  user: saved('fk_user', null),
  token: localStorage.getItem('fk_token') || null,
  cart: saved('fk_cart', []),
  wishlist: [],
  orders: [],
  notifications: [],
  unreadCount: 0,
  showAuth: false,
  authTab: 'login',
  pendingCb: null,
  darkMode: localStorage.getItem('fk_dark') === 'true',
}

function reducer(s, { type: t, payload: p }) {
  switch (t) {
    case 'LOGIN': {
      localStorage.setItem('fk_user', JSON.stringify(p.user))
      localStorage.setItem('fk_token', p.token)
      return { ...s, user: p.user, token: p.token, showAuth: false, pendingCb: null }
    }
    case 'LOGOUT': {
      localStorage.removeItem('fk_user'); localStorage.removeItem('fk_token')
      return { ...s, user: null, token: null, cart: [], wishlist: [], orders: [], notifications: [], unreadCount: 0, showAuth: false }
    }
    case 'UPDATE_USER': {
      const u = { ...s.user, ...p }
      localStorage.setItem('fk_user', JSON.stringify(u))
      return { ...s, user: u }
    }
    case 'ADD_CART': {
      const ex = s.cart.find(i => i._id === p._id)
      const cart = ex ? s.cart.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i) : [...s.cart, { ...p, qty: 1 }]
      localStorage.setItem('fk_cart', JSON.stringify(cart))
      return { ...s, cart }
    }
    case 'REMOVE_CART': {
      const cart = s.cart.filter(i => i._id !== p)
      localStorage.setItem('fk_cart', JSON.stringify(cart))
      return { ...s, cart }
    }
    case 'SET_QTY': {
      const cart = s.cart.map(i => i._id === p.id ? { ...i, qty: p.qty } : i).filter(i => i.qty > 0)
      localStorage.setItem('fk_cart', JSON.stringify(cart))
      return { ...s, cart }
    }
    case 'CLEAR_CART': {
      localStorage.removeItem('fk_cart')
      return { ...s, cart: [] }
    }
    case 'SET_WISHLIST': return { ...s, wishlist: p }
    case 'SET_ORDERS': return { ...s, orders: p }
    case 'SET_NOTIFICATIONS': return { ...s, notifications: p.notifications, unreadCount: p.unread }
    case 'MARK_NOTIFICATION_READ': return {
      ...s,
      notifications: s.notifications.map(n => n._id === p ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }
    case 'MARK_ALL_READ': return {
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }
    case 'SHOW_AUTH': return { ...s, showAuth: true, authTab: p?.tab || 'login', pendingCb: p?.cb || null }
    case 'HIDE_AUTH': return { ...s, showAuth: false, pendingCb: null }
    case 'TOGGLE_DARK': {
      const dark = !s.darkMode
      localStorage.setItem('fk_dark', dark)
      if (dark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return { ...s, darkMode: dark }
    }
    default: return s
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)

  // Apply dark mode on mount
  useEffect(() => {
    if (state.darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  const api = useCallback((cfg) => {
    const headers = state.token ? { Authorization: `Bearer ${state.token}` } : {}
    return axios({ ...cfg, headers: { ...headers, ...cfg.headers } })
  }, [state.token])

  useEffect(() => {
    if (state.token) {
      api({ method: 'get', url: '/api/users/profile' })
        .then(r => dispatch({ type: 'SET_WISHLIST', payload: r.data.user?.wishlist || [] }))
        .catch(() => {})
      fetchNotifications()
    }
  }, [state.token])

  const fetchNotifications = useCallback(async () => {
    if (!state.token) return
    try {
      const r = await api({ method: 'get', url: '/api/notifications' })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: { notifications: r.data.notifications || [], unread: r.data.unread || 0 } })
    } catch {}
  }, [state.token, api])

  const markNotificationRead = useCallback(async (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })
    try { await api({ method: 'put', url: `/api/notifications/${id}/read` }) } catch {}
  }, [api])

  const markAllNotificationsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_READ' })
    try { await api({ method: 'put', url: '/api/notifications/read-all' }) } catch {}
  }, [api])

  const requireLogin = useCallback((cb) => {
    if (state.token) cb()
    else dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login', cb } })
  }, [state.token])

  const addToCart = useCallback((product) => {
    dispatch({ type: 'ADD_CART', payload: product })
    toast.success('Added to cart!', { icon: '🛒', duration: 2000 })
  }, [])

  const toggleWishlist = useCallback(async (product) => {
    if (!state.token) {
      dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login' } })
      toast('Login to save items', { icon: '💡' })
      return
    }
    try {
      const r = await api({ method: 'post', url: `/api/users/wishlist/${product._id}` })
      dispatch({ type: 'SET_WISHLIST', payload: r.data.wishlist })
      const added = r.data.wishlist.some(w => (w._id || w).toString() === product._id.toString())
      toast(added ? '❤️ Saved to Wishlist' : 'Removed from Wishlist', { duration: 2000 })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update wishlist'
      toast.error(msg)
      console.error('Wishlist error:', err?.response?.data || err)
    }
  }, [state.token, api])

  const isWishlisted = useCallback((id) =>
    state.wishlist.some(w => (w._id || w).toString() === id.toString()), [state.wishlist])

  const cartCount    = state.cart.reduce((a, i) => a + i.qty, 0)
  const cartTotal    = state.cart.reduce((a, i) => a + i.price * i.qty, 0)
  const cartOriginal = state.cart.reduce((a, i) => a + (i.originalPrice || i.price) * i.qty, 0)
  const cartSavings  = cartOriginal - cartTotal

  return (
    <Ctx.Provider value={{
      state, dispatch, api, requireLogin, addToCart, toggleWishlist, isWishlisted,
      cartCount, cartTotal, cartSavings, cartOriginal,
      fetchNotifications, markNotificationRead, markAllNotificationsRead,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
