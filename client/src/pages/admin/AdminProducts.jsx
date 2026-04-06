import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext.jsx'
import Loader from '../../components/Loader.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const EMPTY = { name:'', brand:'', category:'Electronics', price:'', originalPrice:'', discount:'', stock:'', image:'', description:'', badge:'', isFeatured:false, seller:'Flipkart Retail', warranty:'', highlights:'' }
const CATEGORIES = ['Electronics','Fashion','Home & Furniture','Appliances','Beauty','Sports','Books','Toys','Grocery']

export default function AdminProducts() {
  const { state, api } = useApp()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!state.token || state.user?.role !== 'admin') { navigate('/'); return }
    fetchProducts()
  }, [state.token])

  const fetchProducts = async () => {
    try {
      const { data } = await api({ method: 'get', url: '/api/products?limit=100' })
      setProducts(data.products || [])
    } catch { } finally { setLoading(false) }
  }

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({ ...p, highlights: p.highlights?.join('\n') || '', price: p.price, originalPrice: p.originalPrice, discount: p.discount, stock: p.stock })
    setEditing(p._id)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name || !form.price || !form.image) { toast.error('Name, price and image are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), discount: Number(form.discount), stock: Number(form.stock), highlights: form.highlights ? form.highlights.split('\n').filter(Boolean) : [] }
      if (editing) {
        const { data } = await api({ method: 'put', url: `/api/products/${editing}`, data: payload })
        setProducts(ps => ps.map(p => p._id === editing ? data.product : p))
        toast.success('Product updated!')
      } else {
        const { data } = await api({ method: 'post', url: '/api/products', data: payload })
        setProducts(ps => [data.product, ...ps])
        toast.success('Product added!')
      }
      setShowForm(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api({ method: 'delete', url: `/api/products/${id}` })
      setProducts(ps => ps.filter(p => p._id !== id))
      toast.success('Product deleted')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Delete failed'
      toast.error(msg)
    }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Manage Products ({products.length})</h1>
        <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">+ Add Product</button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input max-w-xs text-sm" />
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[51] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { k:'name', l:'Product Name', col:2 },
                    { k:'brand', l:'Brand' },
                    { k:'seller', l:'Seller' },
                    { k:'price', l:'Price (₹)', type:'number' },
                    { k:'originalPrice', l:'Original Price (₹)', type:'number' },
                    { k:'discount', l:'Discount (%)', type:'number' },
                    { k:'stock', l:'Stock', type:'number' },
                    { k:'badge', l:'Badge (e.g. Best Seller)' },
                    { k:'warranty', l:'Warranty' },
                    { k:'image', l:'Main Image URL', col:2 },
                    { k:'description', l:'Description', col:2, textarea:true },
                    { k:'highlights', l:'Highlights (one per line)', col:2, textarea:true },
                  ].map(f => (
                    <div key={f.k} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.l}</label>
                      {f.textarea ? (
                        <textarea value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          rows={3} className="input text-sm resize-none" />
                      ) : (
                        <input type={f.type || 'text'} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          className="input text-sm" />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="accent-flipblue w-4 h-4" />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Product</label>
                  </div>
                </div>
                {form.image && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={form.image} alt="preview" className="w-16 h-16 object-contain rounded border border-gray-200" onError={e => e.target.style.display='none'} />
                    <p className="text-xs text-gray-500">Image preview</p>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
                  <button onClick={save} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded border border-gray-100 flex-shrink-0"
                        onError={e => e.target.src='https://via.placeholder.com/40'} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 line-clamp-1 text-xs">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-gray-800">₹{p.price?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-green-600">{p.discount}% off</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold text-xs ${p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">{p.rating} ★</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-flipblue hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">📦</p>
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
