import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const words = ['Crunch.', 'Steam.', 'Repeat.']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
}

const wordVariant = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1562967914-608f82629710?w=1920&auto=format&fit=crop&q=85"
        alt="Golden crispy fried chicken"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-dark/55 to-brand-dark/80" />

      {/* Mandala watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-[600px] h-[600px] opacity-[0.04]">
          <g fill="none" stroke="#E87A00" strokeWidth="0.8" transform="translate(200,200)">
            {[160, 140, 120, 100, 80, 60, 40, 20].map(r => (
              <circle key={r} r={r} />
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180
              return <line key={i} x1="0" y1="0" x2={Math.cos(a)*160} y2={Math.sin(a)*160} />
            })}
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Tagline badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-brand-primary/20 border border-brand-primary/40 text-brand-warm text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
        >
          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
          Now Open · Erina Fair
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-serif font-bold text-white leading-none mb-6"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariant}
              className={`inline-block mr-4 ${i === 0 ? 'text-white' : i === 1 ? 'text-brand-warm' : 'text-white'}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.85 }}
          className="text-white/80 text-lg md:text-xl mb-10 font-light max-w-xl mx-auto"
        >
          Where Himalayan tradition meets golden perfection.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.05 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/order" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-primary/30">
            Order Now
          </Link>
          <Link to="/menu" className="btn-outline text-base px-8 py-3.5">
            Explore Menu
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.4, duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        aria-hidden="true"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
