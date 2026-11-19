import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Plus, Check } from 'lucide-react'
import MenuCard from '../components/MenuCard'
import CategoryTabs from '../components/CategoryTabs'
import DhakaDivider from '../components/DhakaDivider'
import { useCart } from '../context/CartContext'
import { menuItems, categories, addons } from '../data/catalog'
import { money } from '../data/pricing'

const ADDONS_TAB = { id: 'addons', label: 'Add-ons' }
const ALL = { id: 'all', label: 'All Items' }

// The first choice every dish in a section shares (e.g. the 5 heat levels), shown once
// in the section header instead of on every card.
function SharedChoices({ items }) {
  const first = items[0]?.options[0]
  if (!first || !items.every(i => i.options.some(o => o.id === first.id))) return null
  const isSpice = first.id === 'spice'
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-brand-text/50 mr-1">
        {first.label}
      </span>
      {first.choices.map((c, idx) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1 text-xs font-medium bg-white border border-brand-dark/10 rounded-full px-2.5 py-1 text-brand-text/80"
        >
          {isSpice && (
            <span className="flex" aria-hidden="true">
              {Array.from({ length: idx + 1 }, (_, n) => (
                <Flame key={n} size={10} fill="currentColor" className="text-brand-primary" />
              ))}
            </span>
          )}
          {c.label}
        </span>
      ))}
    </div>
  )
}

function SectionHeader({ id, title, blurb, children }) {
  return (
    <header className="mb-6">
      <h2 id={id} className="font-serif font-bold text-brand-dark text-2xl md:text-3xl">{title}</h2>
      {blurb && <p className="text-brand-text/60 text-sm mt-1">{blurb}</p>}
      {children}
    </header>
  )
}

function AddOnCard({ addon }) {
  const { dispatch } = useCart()
  const [added, setAdded] = useState(false)

  const add = () => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        key: `addon:${addon.id}`,
        id: addon.id,
        name: addon.name,
        image: null,
        price: addon.price,
        quantity: 1,
        selections: {},
        options: [],
        addons: [],
      },
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-serif font-bold text-brand-text text-base leading-tight">{addon.name}</p>
        <p className="text-brand-primary font-bold text-sm mt-0.5">{money(addon.price)}</p>
      </div>
      <button
        onClick={add}
        aria-label={`Add ${addon.name} to order`}
        className="shrink-0 inline-flex items-center gap-1.5 bg-brand-cream border border-brand-primary/30 text-brand-primary font-semibold text-sm px-3.5 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {added ? <Check size={15} /> : <Plus size={15} />}
        {added ? 'Added' : 'Add'}
      </button>
    </div>
  )
}

export default function Menu() {
  const locationState = useLocation().state
  const [active, setActive] = useState(locationState?.category ?? 'all')

  useEffect(() => {
    if (locationState?.category) setActive(locationState.category)
  }, [locationState])

  const sections = categories
    .map(cat => ({ cat, items: menuItems.filter(i => i.category === cat.id) }))
    .filter(s => s.items.length > 0)

  const tabs = [ALL, ...sections.map(s => s.cat), ...(addons.length ? [ADDONS_TAB] : [])]
  const showSection = id => active === 'all' || active === id

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <section className="bg-brand-dark pt-28 pb-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E87A00' stroke-width='0.5'%3E%3Cpolygon points='30,5 55,50 5,50'/%3E%3Cpolygon points='30,15 47,45 13,45'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-3"
          >
            Crunch it. Steam it. Love it.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif font-bold text-white text-4xl md:text-5xl lg:text-6xl"
          >
            Our Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-4 text-lg"
          >
            Crunchy fried chicken. Steamy momo. Bold Nepalese flavours.
          </motion.p>
          <p className="text-white/40 mt-2 text-sm">All prices include GST</p>
        </div>
      </section>

      <DhakaDivider />

      {/* Sticky category tabs */}
      <div className="sticky top-16 z-30 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-dark/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <CategoryTabs categories={tabs} active={active} onChange={setActive} />
        </div>
      </div>

      {/* Sections */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14"
      >
        {sections.filter(s => showSection(s.cat.id)).map(({ cat, items }) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`h-${cat.id}`}>
            <SectionHeader id={`h-${cat.id}`} title={cat.label} blurb={cat.blurb}>
              <SharedChoices items={items} />
            </SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {addons.length > 0 && showSection('addons') && (
          <section id="addons">
            <SectionHeader title="Add-ons" blurb="Extras for any dish, or on their own." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {addons.map(a => (
                <AddOnCard key={a.id} addon={a} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </main>
  )
}
