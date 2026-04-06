import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">About</h4>
            {['Contact Us','About Us','Careers','E-Commerce Stories','Press','E-Commerce Wholesale'].map(i=>(
              <Link key={i} to="/" className="block text-xs text-gray-400 hover:text-white mb-1.5 transition-colors">{i}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Help</h4>
            {['Payments','Shipping','Cancellation & Returns','FAQ','Report Infringement'].map(i=>(
              <Link key={i} to="/" className="block text-xs text-gray-400 hover:text-white mb-1.5 transition-colors">{i}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Policy</h4>
            {['Return Policy','Terms Of Use','Security','Privacy','Sitemap','EPR Compliance'].map(i=>(
              <Link key={i} to="/" className="block text-xs text-gray-400 hover:text-white mb-1.5 transition-colors">{i}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Social</h4>
            {['Facebook','Twitter','YouTube','Instagram'].map(i=>(
              <Link key={i} to="/" className="block text-xs text-gray-400 hover:text-white mb-1.5 transition-colors">{i}</Link>
            ))}
            <div className="mt-4">
              <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Mail Us</h4>
              <p className="text-xs text-gray-400 leading-relaxed">E-Commerce Store Internet Private Limited,<br/>Buildings Alyssa, Begonia &<br/>Clove Embassy Tech Village,<br/>Outer Ring Road, Devarabeesanahalli Village,<br/>Bengaluru, 560103, Karnataka, India</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🏪</span>
              <Link to="/become-seller" className="text-xs text-gray-400 hover:text-white transition-colors">Become a Seller</Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs text-gray-400">Advertise</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🎁</span>
              <span className="text-xs text-gray-400">Gift Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">💳</span>
              <span className="text-xs text-gray-400">Help Center</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">© 2007-2024 E-Commerce Store.com</p>
        </div>
      </div>
    </footer>
  )
}
