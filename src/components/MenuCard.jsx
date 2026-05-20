import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Plus } from 'lucide-react'
import OrderModal from './OrderModal'

const TAG_STYLES = {
  'fan-favorite': { bg: 'bg-brand-primary',    text: 'text-white',          label: 'Fan Fave'  },
  'new':          { bg: 'bg-brand-green',       text: 'text-white',          label: 'New'       },
  'spicy':        { bg: 'bg-red-600',           text: 'text-white',          label: 'Spicy'     },
}

// Prayer flag colors for decorative accents
const FLAG_COLORS = ['bg-blue-500', 'bg-white border border-gray-200', 'bg-red-500', 'bg-brand-green', 'bg-yellow-400']

function PrayerFlags() {
  return (
    <div className="absolute top-2 right-2 flex gap-0.5" aria-hidden="true">
      {FLAG_COLORS.map((c, i) => (
        <span key={i} className={`block w-2 h-3 rounded-sm ${c} opacity-80`} />
      ))}
    </div>
  )
}

function SpiceLevel({ level }) {
  if (!level) return null
  return (
    <div className="flex items-center gap-0.5" aria-label={`Spice level ${level} out of 3`}>
      {[1, 2, 3].map(n => (
        <Flame
          key={n}
          size={13}
          className={n <= level ? 'text-brand-primary' : 'text-brand-text/20'}
          fill={n <= level ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function MenuCard({ item }) {
  const [modalOpen, setModalOpen] = useState(false)
  const tag = item.tag ? TAG_STYLES[item.tag] : null

  return (
    <>
      <motion.article
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col border border-brand-dark/5"
        style={{ borderTop: '3px solid #2D1A00' }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <PrayerFlags />
          {tag && (
            <span className={`absolute top-2 left-2 ${tag.bg} ${tag.text} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
              {tag.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif font-bold text-brand-text text-base leading-snug flex-1">
              {item.name}
            </h3>
            <span className="text-brand-primary font-bold text-base shrink-0">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <SpiceLevel level={item.spice} />

          <p className="text-brand-text/60 text-xs leading-relaxed mt-2 flex-1 line-clamp-2">
            {item.description}
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-cream border border-brand-primary/30 text-brand-primary font-semibold text-sm py-2.5 rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus size={16} />
            Add to Order
          </button>
        </div>
      </motion.article>

      {modalOpen && (
        <OrderModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
