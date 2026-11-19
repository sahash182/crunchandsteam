import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingCart, Flame, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { menu, addonById } from '../data/catalog'
import { priceLine, lineKey, missingOptions, money, round2, shortLabel } from '../data/pricing'

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

const legend = 'text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-2'

export default function OrderModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1)
  // A choice with only one possible answer is pre-selected; everything else starts empty
  // so nobody gets the wrong heat or style by accident.
  const [selections, setSelections] = useState(() =>
    Object.fromEntries(item.options.filter(o => o.choices.length === 1).map(o => [o.id, o.choices[0].label])),
  )
  const [addonIds, setAddonIds] = useState([])
  const { dispatch } = useCart()
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const missing = missingOptions(item, selections)
  const choicePrice = item.options.reduce(
    (s, o) => s + (o.choices.find(c => c.label === selections[o.id])?.price ?? 0), 0)
  const addonPrice = addonIds.reduce((s, id) => s + addonById[id].price, 0)
  const unit = round2(item.price + choicePrice + addonPrice)

  const toggleAddon = id =>
    setAddonIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))

  const handleAdd = () => {
    if (missing.length) return
    // Same pricing code the payment server runs, so the cart and the charge always agree.
    const p = priceLine(menu, { id: item.id, quantity, selections, addons: addonIds })
    dispatch({
      type: 'ADD_ITEM',
      item: {
        key: lineKey(item.id, selections, addonIds),
        id: item.id,
        name: item.name,
        image: item.image,
        price: p.unit,
        quantity,
        selections,
        options: p.options,
        addons: p.addons,
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
          role="dialog"
          aria-modal="true"
          aria-label={item.name}
          className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Image header */}
          <div className="relative aspect-[16/6] overflow-hidden bg-gray-100 shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="font-serif font-bold text-white text-xl leading-tight">{item.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-brand-warm font-bold text-lg">{money(item.price)}</span>
                {item.portion && <span className="text-white/70 text-xs">{item.portion}</span>}
              </div>
            </div>
          </div>

          {/* Body (scrolls when there are many choices) */}
          <div className="p-5 space-y-5 overflow-y-auto">
            <p className="text-brand-text/60 text-sm">{item.description}</p>

            {/* Required choices: spice, style, drink… */}
            {item.options.map(o => (
              <div key={o.id} role="radiogroup" aria-label={o.label}>
                <p className={legend}>
                  {o.label}
                  {o.required && <span className="text-brand-primary" aria-hidden="true"> *</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {o.choices.map((c, idx) => {
                    const on = selections[o.id] === c.label
                    return (
                      <button
                        key={c.label}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setSelections(s => ({ ...s, [o.id]: c.label }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                          on
                            ? 'border-brand-primary bg-brand-primary text-white'
                            : 'border-brand-dark/15 text-brand-text/70 hover:border-brand-primary'
                        }`}
                      >
                        {o.id === 'spice' && (
                          <span className="flex" aria-hidden="true">
                            {Array.from({ length: idx + 1 }, (_, n) => (
                              <Flame key={n} size={11} fill="currentColor" className={on ? 'text-white' : 'text-brand-primary'} />
                            ))}
                          </span>
                        )}
                        {c.label}
                        {c.price > 0 && <span className="opacity-70 text-xs">+{money(c.price)}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Optional extras */}
            {item.addonIds.length > 0 && (
              <div role="group" aria-label="Add-ons">
                <p className={legend}>Add extras</p>
                <div className="space-y-2">
                  {item.addonIds.map(id => {
                    const a = addonById[id]
                    const on = addonIds.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggleAddon(id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm text-left transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                          on ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-dark/15 hover:border-brand-primary/50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-dark/25'}`}>
                          {on && <Check size={13} />}
                        </span>
                        <span className="flex-1 font-medium text-brand-text">{a.name}</span>
                        <span className="text-brand-text/60">+{money(a.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer: quantity + add */}
          <div className="p-4 border-t border-brand-dark/10 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-lg text-brand-text" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(20, q + 1))}
                  className="w-9 h-9 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={missing.length > 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm sm:text-base leading-tight disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {missing.length
                  ? `Choose ${shortLabel(missing[0].label).toLowerCase()}`
                  : `Add to Cart · ${money(unit * quantity)}`}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
