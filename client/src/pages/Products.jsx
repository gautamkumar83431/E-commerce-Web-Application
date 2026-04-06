import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'

const CATEGORIES = ['Electronics','Fashion','Home & Furniture','Appliances','Beauty','Sports','Books','Toys','Grocery']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Best Rating' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Best Discount' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [showFilter, setShowFilter] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const rating = searchParams.get('rating') || ''

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sort }
      if (search) params.search = search
      if (category) params.category = category
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (rating) params.rating = rating
      const { data } = await axios.get('/api/products', { params })
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { setProducts([]) } finally { setLoading(false) }
  }, [search, category, sort, page, minPrice, maxPrice, rating])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const setPage = (val) => {
    const p = new URLSearchParams(searchParams)
    p.set('page', String(val))
    setSearchParams(p)
  }

  const applyPrice = () => {
    const p = new URLSearchParams(searchParams)
    if (priceRange.min) p.set('minPrice', priceRange.min); else p.delete('minPrice')
    if (priceRange.max) p.set('maxPrice', priceRange.max); else p.delete('maxPrice')
    p.delete('page')
    setSearchParams(p)
    setShowFilter(false)
  }

  const clearAll = () => {
    setSearchParams({})
    setPriceRange({ min: '', max: '' })
  }

  const FilterPanel = () => (
    <div className="bg-white rounded shadow-sm p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Filters</h3>
        <button onClick={clearAll} className="text-xs text-flipblue hover:underline font-medium">Clear All</button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Category</h4>
        {CATEGORIES.map(cat => (
          <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer group">
            <input type="radio" name="category" checked={category === cat}
              onChange={() => setParam('category', cat)}
              className="accent-flipblue" />
            <span className={`text-sm group-hover:text-flipblue transition-colors ${category === cat ? 'text-flipblue font-semibold' : 'text-gray-600'}`}>{cat}</span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Price Range</h4>
        <div className="flex gap-2 mb-2">
          <input type="number" placeholder="Min ₹" value={priceRange.min}
            onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
            className="input text-xs py-1.5" />
          <input type="number" placeholder="Max ₹" value={priceRange.max}
            onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
            className="input text-xs py-1.5" />
        </div>
        <button onClick={applyPrice} className="w-full btn-primary text-xs py-1.5">Apply</button>
        {[
          { label: 'Under ₹500', min: '', max: '500' },
          { label: '₹500 - ₹2,000', min: '500', max: '2000' },
          { label: '₹2,000 - ₹10,000', min: '2000', max: '10000' },
          { label: '₹10,000 - ₹50,000', min: '10000', max: '50000' },
          { label: 'Above ₹50,000', min: '50000', max: '' },
        ].map(r => (
          <button key={r.label} onClick={() => { const p = new URLSearchParams(searchParams); if(r.min) p.set('minPrice',r.min); else p.delete('minPrice'); if(r.max) p.set('maxPrice',r.max); else p.delete('maxPrice'); p.delete('page'); setSearchParams(p) }}
            className="block w-full text-left text-xs text-gray-600 hover:text-flipblue py-1 transition-colors">
            {r.label}
          </button>
        ))}
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Customer Rating</h4>
        {[4, 3, 2].map(r => (
          <label key={r} className="flex items-center gap-2 py-1 cursor-pointer group">
            <input type="radio" name="rating" checked={rating === String(r)}
              onChange={() => setParam('rating', String(r))}
              className="accent-flipblue" />
            <span className={`text-sm flex items-center gap-1 ${rating === String(r) ? 'text-flipblue font-semibold' : 'text-gray-600'}`}>
              <span className="bg-green-600 text-white text-xs px-1 rounded">{r}★</span> & above
            </span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white rounded shadow-sm px-4 py-3">
        <div>
          <h1 className="font-bold text-gray-800 text-sm sm:text-base">
            {search ? `Results for "${search}"` : category || 'All Products'}
          </h1>
          {!loading && <p className="text-xs text-gray-500">{total.toLocaleString()} results found</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilter(!showFilter)}
            className="md:hidden flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-flipblue hover:text-flipblue transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filter
          </button>
          <select value={sort} onChange={e => setParam('sort', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-flipblue cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden mb-4 overflow-hidden">
            <FilterPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <FilterPanel />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? <Loader /> : products.length === 0 ? (
            <div className="bg-white rounded shadow-sm p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms</p>
              <button onClick={clearAll} className="btn-primary text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded border text-sm font-medium disabled:opacity-40 hover:border-flipblue hover:text-flipblue transition-colors">
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === p ? 'bg-flipblue text-white' : 'border hover:border-flipblue hover:text-flipblue'}`}>
                        {p}
                      </button>
                    )
                  })}
                  <button disabled={page === pages} onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded border text-sm font-medium disabled:opacity-40 hover:border-flipblue hover:text-flipblue transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
