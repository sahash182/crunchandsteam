import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function CategoryTabs({ categories, active, onChange }) {
  const containerRef = useRef(null)
  const activeRef = useRef(null)

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const el = activeRef.current
      const offset = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
      container.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [active])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
      role="tablist"
      aria-label="Menu categories"
    >
      {categories.map(cat => {
        const isActive = cat.id === active
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={`relative shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              isActive
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                : 'bg-white text-brand-text/70 hover:text-brand-text border border-brand-dark/10 hover:border-brand-primary/40'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full bg-brand-primary -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
