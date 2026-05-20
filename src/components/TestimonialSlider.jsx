import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { testimonials } from '../data/testimonials'

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const count = testimonials.length

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(c => (c + 1) % count)
  }, [count])

  const prev = () => {
    setDirection(-1)
    setCurrent(c => (c - 1 + count) % count)
  }

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  // Show 1 on mobile, up to 3 on desktop
  const visibleCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1
  const visible = Array.from({ length: visibleCount }, (_, i) =>
    testimonials[(current + i) % count]
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {visible.map((t) => (
            <motion.div
              key={`${t.id}-${current}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 flex flex-col"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }, (_, i) => (
                  <Star key={i} size={16} className="text-brand-primary" fill="currentColor" />
                ))}
              </div>
              <p className="text-brand-text/75 text-sm leading-relaxed flex-1 mb-4">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-brand-dark/5">
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-primary/30"
                />
                <div>
                  <p className="font-semibold text-brand-text text-sm">{t.name}</p>
                  <p className="text-brand-text/45 text-xs">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="p-2 rounded-full border border-brand-dark/15 hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className={`transition-all duration-300 rounded-full focus:outline-none ${
                i === current
                  ? 'w-6 h-2 bg-brand-primary'
                  : 'w-2 h-2 bg-brand-dark/20 hover:bg-brand-primary/50'
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-2 rounded-full border border-brand-dark/15 hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Next testimonial"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
