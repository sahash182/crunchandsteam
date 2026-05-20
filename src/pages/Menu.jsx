import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import MenuCard from '../components/MenuCard'
import CategoryTabs from '../components/CategoryTabs'
import DhakaDivider from '../components/DhakaDivider'
import { menuItems, categories } from '../data/menu'

const ALL = { id: 'all', label: 'All Items' }
const allCategories = [ALL, ...categories]

export default function Menu() {
  const locationState = useLocation().state
  const [active, setActive] = useState(locationState?.category ?? 'all')

  useEffect(() => {
    if (locationState?.category) setActive(locationState.category)
  }, [locationState])

  const filtered = active === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === active)

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
            Explore
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif font-bold text-white text-4xl md:text-5xl lg:text-6xl"
          >
            Our Full Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-4 text-lg"
          >
            {menuItems.length} items made fresh daily
          </motion.p>
        </div>
      </section>

      <DhakaDivider />

      {/* Sticky category tabs */}
      <div className="sticky top-16 z-30 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-dark/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <CategoryTabs
            categories={allCategories}
            active={active}
            onChange={setActive}
          />
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-brand-text/50 text-sm">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <MenuCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
