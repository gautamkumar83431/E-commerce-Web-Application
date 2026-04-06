import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import toast from 'react-hot-toast'

const Stars = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`${size==='sm'?'w-3.5 h-3.5':'w-5 h-5'} ${s<=Math.round(rating)?'text-yellow-400':'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
)

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted, requireLogin, state, dispatch } = useApp()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [tab, setTab] = useState('highlights')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryMsg, setDeliveryMsg] = useState('')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [qaList, setQaList] = useState([])
  const [qaForm, setQaForm] = useState('')
  const [qaSubmitting, setQaSubmitting] = useState(false)
  const [answerForms, setAnswerForms] = useState({})
  const [answerSubmitting, setAnswerSubmitting] = useState({})

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const [pRes, rRes, relRes, qaRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/reviews/${id}`),
          axios.get(`/api/products/${id}/related`),
          axios.get(`/api/qna/${id}`).catch(() => ({ data: { qnas: [] } })),
        ])
        setProduct(pRes.data.product)
        setReviews(rRes.data.reviews || [])
        setRelated(relRes.data.products || [])
        setQaList(qaRes.data.qnas || [])
        setImgIdx(0)
      } catch { navigate('/products') }
      finally { setLoading(false) }
    }
    loadProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id, navigate])

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) { setDeliveryMsg(''); toast.error('Enter valid 6-digit pincode'); return }
    setDeliveryMsg(`✓ Delivery available to ${pincode} by ${new Date(Date.now()+5*86400000).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`)
  }

  const submitAnswer = async (e, qnaId) => {
    e.preventDefault()
    const answer = answerForms[qnaId]?.trim()
    if (!answer) { toast.error('Please enter an answer'); return }
    setAnswerSubmitting(s => ({ ...s, [qnaId]: true }))
    try {
      const { data } = await axios.post(`/api/qna/${qnaId}/answer`, { answer }, {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      setQaList(list => list.map(q => q._id === qnaId ? data.qna : q))
      setAnswerForms(f => ({ ...f, [qnaId]: '' }))
      toast.success('Answer submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setAnswerSubmitting(s => ({ ...s, [qnaId]: false })) }
  }

  const submitQa = async (e) => {
    e.preventDefault()
    if (!qaForm.trim()) { toast.error('Please enter a question'); return }
    setQaSubmitting(true)
    try {
      const { data } = await axios.post(`/api/qna/${id}`, { question: qaForm }, {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      setQaList(q => [data.qna, ...q])
      setQaForm('')
      toast.success('Question submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setQaSubmitting(false) }
  }

  const handleShare = () => setShareOpen(true)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
    setShareOpen(false)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) { toast.error('Please write a review'); return }
    setSubmitting(true)
    try {
      const { data } = await axios.post(`/api/reviews/${id}`, reviewForm, {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      setReviews(r => [data.review, ...r])
      setReviewForm({ rating: 5, title: '', comment: '' })
      toast.success('Review submitted!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  if (loading) return <Loader />
  if (!product) return null

  const images = product.images?.length ? product.images : [product.image]
  const wishlisted = isWishlisted(product._id)
  const inCart = state.cart.find(i => String(i._id) === String(product._id))

  const ratingDist = [5,4,3,2,1].map(r => ({
    r, count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(rv => rv.rating === r).length / reviews.length * 100) : 0
  }))

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-flipblue">Home</Link>
        <span>›</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-flipblue">{product.category}</Link>
        <span>›</span>
        <span className="text-gray-700 line-clamp-1">{product.name}</span>
      </div>

      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Images */}
          <div className="md:w-80 flex-shrink-0">
            <div className="sticky top-20">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden h-72 sm:h-80 flex items-center justify-center border border-gray-100 mb-3 cursor-zoom-in" onClick={() => setZoomOpen(true)}>
                <AnimatePresence mode="wait">
                  <motion.img key={imgIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    src={images[imgIdx]} alt={product.name}
                    className="max-h-full max-w-full object-contain p-4"
                    onError={e => { e.target.onerror=null; e.target.src='https://placehold.co/400x400?text=No+Image' }} />
                </AnimatePresence>
                <span className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded pointer-events-none">🔍 Zoom</span>
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">{product.badge}</span>
                )}
                <button onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                  <svg className={`w-5 h-5 ${wishlisted?'text-red-500 fill-red-500':'text-gray-400'}`} fill={wishlisted?'currentColor':'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${imgIdx===i?'border-flipblue':'border-gray-200 hover:border-gray-300'}`}>
                      <img src={img} alt="" className="w-full h-full object-contain p-1" onError={e => { e.target.onerror=null; e.target.src='https://placehold.co/100x100?text=No+Image' }} />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(product)} disabled={product.stock===0}
                  className={`flex-1 py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all ${product.stock===0?'bg-gray-200 text-gray-400 cursor-not-allowed':inCart?'bg-green-500 text-white hover:bg-green-600':'bg-flipblue text-white hover:bg-blue-700'}`}>
                  🛒 {product.stock===0?'Out of Stock':inCart?`In Cart (${inCart.qty})`:'Add to Cart'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => requireLogin(() => { addToCart(product); navigate('/checkout') })}
                  disabled={product.stock===0}
                  className="flex-1 py-3 rounded font-bold text-sm bg-flipsecondary text-white hover:bg-orange-600 disabled:opacity-50 transition-all">
                  ⚡ Buy Now
                </motion.button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-medium text-gray-800 leading-snug">{product.name}</h1>
              <button onClick={handleShare} title="Share" className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-flipblue transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-1 text-sm text-white px-2 py-0.5 rounded font-bold ${product.rating>=4?'bg-green-600':product.rating>=3?'bg-yellow-500':'bg-red-500'}`}>
                {product.rating} ★
              </span>
              <span className="text-sm text-gray-500">{product.numReviews?.toLocaleString()} Ratings & Reviews</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-lg font-bold text-green-600">{product.discount}% off</span>
                </>
              )}
            </div>

            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-red-500 text-sm font-semibold mb-3">⚠️ Only {product.stock} left in stock!</p>
            )}

            {/* Delivery Check */}
            <div className="flex items-center gap-2 mb-4">
              <input type="text" placeholder="Enter pincode" value={pincode}
                onChange={e => { setPincode(e.target.value); setDeliveryMsg('') }}
                maxLength={6} className="input w-32 text-sm py-1.5" />
              <button onClick={checkDelivery} className="btn-outline text-xs py-1.5 px-3">Check</button>
              {deliveryMsg && <p className="text-green-600 text-xs font-medium">{deliveryMsg}</p>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>🏪 Seller: <strong className="text-flipblue">{product.seller}</strong></span>
              {product.warranty && <span>🛡️ {product.warranty}</span>}
            </div>

            {/* Tabs */}
            <div className="border-b mb-4">
              <div className="flex gap-6 overflow-x-auto">
                {['highlights','specifications','description','q&a'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`pb-2 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-all ${tab===t?'border-flipblue text-flipblue':' border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {t === 'q&a' ? `Q&A (${qaList.length})` : t}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {tab === 'highlights' && (
                  <ul className="space-y-1.5">
                    {product.highlights?.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
                {tab === 'specifications' && (
                  <div className="space-y-1">
                    {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="flex gap-4 py-1.5 border-b border-gray-50 text-sm">
                        <span className="text-gray-500 w-36 flex-shrink-0">{k}</span>
                        <span className="text-gray-800 font-medium">{v}</span>
                      </div>
                    ))}
                    {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                      <p className="text-gray-500 text-sm">No specifications available.</p>
                    )}
                  </div>
                )}
                {tab === 'description' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                )}
                {tab === 'q&a' && (
                  <div>
                    {state.token ? (
                      <form onSubmit={submitQa} className="flex gap-2 mb-4">
                        <input value={qaForm} onChange={e => setQaForm(e.target.value)}
                          placeholder="Ask a question about this product..."
                          className="input text-sm flex-1" />
                        <button type="submit" disabled={qaSubmitting} className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
                          {qaSubmitting ? '...' : 'Ask'}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-blue-50 rounded p-3 mb-4 text-center text-sm">
                        <button onClick={() => dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login' } })} className="text-flipblue font-semibold hover:underline">Login</button> to ask a question
                      </div>
                    )}
                    {qaList.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No questions yet. Be the first to ask!</p>
                    ) : (
                      <div className="space-y-3">
                        {qaList.map((q, i) => (
                          <div key={q._id || i} className="border border-gray-100 rounded-lg p-3 text-sm">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded text-xs flex-shrink-0">Q</span>
                              <p className="font-medium text-gray-800">{q.question}</p>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{q.name} · {new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>

                            {/* Answers */}
                            {q.answers?.length > 0 && (
                              <div className="space-y-2 mb-2 pl-2 border-l-2 border-green-200">
                                {q.answers.map((a, ai) => (
                                  <div key={ai}>
                                    <div className="flex items-start gap-2">
                                      <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded text-xs flex-shrink-0">A</span>
                                      <p className="text-gray-700">{a.answer}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 pl-6">
                                      {a.name} {a.role === 'admin' && <span className="text-blue-600 font-semibold">(Admin)</span>} · {new Date(a.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Answer Form */}
                            {state.token ? (
                              <form onSubmit={e => submitAnswer(e, q._id)} className="flex gap-2 mt-2">
                                <input
                                  value={answerForms[q._id] || ''}
                                  onChange={e => setAnswerForms(f => ({ ...f, [q._id]: e.target.value }))}
                                  placeholder="Write an answer..."
                                  className="input text-xs flex-1 py-1.5"
                                />
                                <button type="submit" disabled={answerSubmitting[q._id]}
                                  className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
                                  {answerSubmitting[q._id] ? '...' : 'Answer'}
                                </button>
                              </form>
                            ) : (
                              <p className="text-xs text-gray-400 mt-2">
                                <button onClick={() => dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login' } })} className="text-flipblue hover:underline">Login</button> to answer
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ratings & Reviews</h2>
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">{product.rating}</div>
            <Stars rating={product.rating} size="md" />
            <p className="text-sm text-gray-500 mt-1">{product.numReviews?.toLocaleString()} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDist.map(({ r, count, pct }) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right text-gray-600">{r}</span>
                <span className="text-yellow-400">★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-green-500 rounded-full" />
                </div>
                <span className="w-6 text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review */}
        {state.token ? (
          <form onSubmit={submitReview} className="bg-gray-50 rounded p-4 mb-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Rating:</span>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                  className={`text-2xl transition-transform hover:scale-110 ${s<=reviewForm.rating?'text-yellow-400':'text-gray-300'}`}>★</button>
              ))}
            </div>
            <input type="text" placeholder="Review title (optional)" value={reviewForm.title}
              onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
              className="input text-sm mb-2" />
            <textarea placeholder="Share your experience with this product..." value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              rows={3} className="input text-sm resize-none mb-3" />
            <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-6">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="bg-blue-50 rounded p-3 mb-4 text-center">
            <p className="text-sm text-gray-600">
              <button onClick={() => dispatch({ type: 'SHOW_AUTH', payload: { tab: 'login' } })} className="text-flipblue font-semibold hover:underline">Login</button> to write a review
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
          ) : reviews.map(r => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs text-white px-1.5 py-0.5 rounded font-bold ${r.rating>=4?'bg-green-600':r.rating>=3?'bg-yellow-500':'bg-red-500'}`}>{r.rating} ★</span>
                {r.title && <span className="font-semibold text-sm text-gray-800">{r.title}</span>}
                {r.verified && <span className="text-xs text-green-600 font-medium">✓ Verified Purchase</span>}
              </div>
              <p className="text-sm text-gray-700 mb-1">{r.comment}</p>
              <p className="text-xs text-gray-400">{r.name} · {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShareOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Share Product</h3>
                <button onClick={() => setShareOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.name}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <span className="text-2xl">💬</span>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <span className="text-2xl">📘</span>
                  <span className="text-xs text-gray-600">Facebook</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors">
                  <span className="text-2xl">🐦</span>
                  <span className="text-xs text-gray-600">Twitter</span>
                </a>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <input readOnly value={window.location.href} className="flex-1 text-xs text-gray-500 bg-transparent outline-none truncate" />
                <button onClick={copyLink} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">Copy</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setZoomOpen(false)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="relative max-w-2xl w-full bg-white rounded-lg p-4"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setZoomOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
              <img src={images[imgIdx]} alt={product.name}
                className="w-full max-h-[75vh] object-contain"
                onError={e => { e.target.onerror=null; e.target.src='https://placehold.co/800x800?text=No+Image' }} />
              {images.length > 1 && (
                <div className="flex gap-2 justify-center mt-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${imgIdx===i?'border-flipblue':'border-gray-200'}`}>
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}
