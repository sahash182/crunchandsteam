import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import LocationCard from '../components/LocationCard'
import DhakaDivider from '../components/DhakaDivider'
import MandalaBg from '../components/MandalaBg'
import { locations } from '../data/locations'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

export default function Locations() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="bg-brand-dark pt-28 pb-16 px-4 relative overflow-hidden">
        <MandalaBg size={600} className="top-1/2 right-10 -translate-y-1/2 opacity-60" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center justify-center w-14 h-14 bg-brand-primary/20 rounded-full text-brand-primary mb-6"
            >
              <MapPin size={28} />
            </motion.div>
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-3">
              Central Coast, NSW
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif font-bold text-white text-4xl md:text-5xl lg:text-6xl mb-4">
              Find Us
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-xl mx-auto">
              Located inside Erina Fair Food Court. One obsession: making you the best momo and fried chicken you've ever had.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* Location cards */}
      <section className="py-20 px-4 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 max-w-md mx-auto gap-6">
            {locations.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        </div>
      </section>

      <DhakaDivider />

      {/* Hours banner */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-brand-cream rounded-3xl p-8 md:p-12 text-center border border-brand-dark/5"
          >
            <h2 className="font-serif font-bold text-brand-dark text-3xl md:text-4xl mb-4">
              Opening Hours
            </h2>
            <p className="text-brand-text/60 mb-8">Open 7 days a week</p>

            <div className="max-w-xs mx-auto">
              <div className="bg-white rounded-2xl p-5 border border-brand-dark/5">
                <p className="font-serif font-bold text-brand-dark text-base mb-1">Erina Fair Food Court</p>
                <p className="text-brand-primary font-semibold text-sm">10:00 AM – 9:00 PM</p>
                <p className="text-brand-text/50 text-xs mt-1">Mon – Sun</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
