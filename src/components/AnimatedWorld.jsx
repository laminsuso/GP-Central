// src/components/AnimatedWorld.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Plane } from 'lucide-react'

export default function AnimatedWorld() {
  return (
    <div aria-hidden className="relative w-full max-w-4xl mx-auto">
      <div
        className="aspect-[16/9] rounded-3xl border overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #eff6ff, #ecfdf5)",
          borderColor: "#bfdbfe",
        }}
      >
        {/* Dots (stars/points) */}
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                background: "rgba(14,165,233,0.35)",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Animated paths */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450" fill="none">
          {[
            { d: "M100,380 C250,300 300,250 420,220 C520,195 620,210 700,160", delay: 0 },
            { d: "M320,160 C400,200 500,180 620,200 C720,220 760,260 780,300", delay: 0.6 },
          ].map((p, idx) => (
            <motion.path
              key={idx}
              d={p.d}
              stroke="var(--brand-primary)"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: p.delay, ease: "easeInOut" }}
            />
          ))}

          {/* Animated plane */}
          <motion.g
            initial={{ x: 100, y: 380 }}
            animate={{ x: 700, y: 160 }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
          >
            <Plane size={18} className="brand-text" />
          </motion.g>
        </svg>
      </div>
    </div>
  )
}
