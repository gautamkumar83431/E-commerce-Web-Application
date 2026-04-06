import React from 'react'
import { motion } from 'framer-motion'

export default function Loader({ full = true }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-12'}`}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="w-10 h-10 border-4 border-flipblue border-t-transparent rounded-full" />
    </div>
  )
}
