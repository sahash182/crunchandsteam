import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, Flame } from 'lucide-react'
import { useCart } from '../context/CartContext'

const backdrop = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
  exit:   { opacity: 0 },
}

const panel = {
  hidden: (isMobile) => isMobile
    ? { y: '100%', opacity: 0 }
    : { scale: 0.92, opacity: 0, y: 20 },
  show:   { y: 0, scale: 1, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 280 } },
  exit:   (isMobile) => isMobile
    ? { y: '100%', opacity: 0, transition: { duration: 0.25 } }
    : { scale: 0.92, opacity: 0, y: 20, transition: { duration: 0.2 } },
}

export default function OrderModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState(item.sizes[0])
  const { dispatch } = useCart()
  const isMobile = window.innerWidth < 768

  const handleAdd = () => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size,
        quantity,
      },
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        variants={backdrop}
        initial="hidden"
        animate="show"
        exit="exit"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          custom={isMobile}
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={e => e.stopPropagation()}
          className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Image header */}
          <div className="relative aspect-[16/7] bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="font-serif font-bold text-white text-xl leading-tight">
                {item.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-brand-warm font-bold text-lg">
                  ${item.price.toFixed(2)}
                </span>
                <div className="flex gap-0.5" aria-label={`Spice level ${item.spice}`}>
                  {[1,2,3].map(n => (
                    <Flame key={n} size={13} className={n <= item.spice ? 'text-brand-warm' : 'text-white/30'} fill={n <= item.spice ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <p className="text-brand-text/60 text-sm">{item.description}</p>

            {/* Size selector */}
            {item.sizes.length > 1 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all focus:outline-none ${
                        size === s
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-brand-dark/15 text-brand-text/70 hover:border-brand-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-lg text-brand-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base"
            >
              <ShoppingCart size={18} />
              Add to Cart · ${(item.price * quantity).toFixed(2)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
