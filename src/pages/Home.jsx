import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Zap, Sparkles, MapPin, ChevronRight } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import MenuCard from '../components/MenuCard'
import TestimonialSlider from '../components/TestimonialSlider'
import DhakaDivider from '../components/DhakaDivider'
import MandalaBg from '../components/MandalaBg'
import { signatureDishes } from '../data/menu'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const categoryCards = [
  {
    id: 'fried-chicken',
    title: 'Fried Chicken',
    subtitle: 'Double-fried, Himalayan spiced',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'steamed-momos',
    title: 'Steamed Momos',
    subtitle: 'Hand-folded, daily fresh',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'fried-momos',
    title: 'Fried Momos',
    subtitle: 'Crispy outside, juicy inside',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'combos',
    title: 'Combos & Feasts',
    subtitle: 'The best of both worlds',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
  },
]

const brandValues = [
  {
    icon: <Leaf size={28} />,
    title: 'Hand-folded Daily',
    desc: 'Every momo wrapper is rolled and filled fresh each morning. No frozen shortcuts, ever.',
  },
  {
    icon: <Zap size={28} />,
    title: 'Double-cooked Crunch',
    desc: 'Our chicken is marinated overnight then double-fried for a shatter you can hear from the street.',
  },
  {
    icon: <Sparkles size={28} />,
    title: 'Himalayan Spices',
    desc: 'We source Timur pepper, szechuan, and hand-ground masalas directly from Nepal. No substitutes.',
  },
]

export default function Home() {
  return (
    <main>
      <HeroSection />

      {/* ── Signature Dishes ── */}
      <section className="py-20 px-4 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">
              Our Best-Sellers
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              Signature Dishes
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {signatureDishes.map(item => (
              <motion.div key={item.id} variants={fadeUp}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            variants={fadeUp}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              View Full Menu <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* ── Category Preview ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">
              Explore
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              What We Make
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {categoryCards.map(cat => (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link
                  to={`/menu`}
                  state={{ category: cat.id }}
                  className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-gray-100"
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent transition-all duration-300 group-hover:from-brand-primary/80 group-hover:via-brand-primary/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif font-bold text-white text-lg leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">{cat.subtitle}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* ── Brand Values ── */}
      <section className="relative py-24 px-4 bg-brand-cream overflow-hidden">
        <MandalaBg size={700} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">
              Our Promise
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              Why Crunch & Steam
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {brandValues.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-brand-dark/5 card-hover"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-primary/10 rounded-2xl text-brand-primary mb-5">
                  {v.icon}
                </div>
                <h3 className="font-serif font-bold text-brand-text text-xl mb-3">{v.title}</h3>
                <p className="text-brand-text/60 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">
              Reviews
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">
              What People Are Saying
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TestimonialSlider />
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* ── Location Teaser ── */}
      <section className="relative py-24 px-4 bg-brand-dark overflow-hidden">
        <MandalaBg size={600} className="top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-50" />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/20 rounded-full text-brand-primary mb-6"
          >
            <MapPin size={32} />
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-serif font-bold text-white text-4xl md:text-5xl mb-4">
            Now at Erina Fair
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-lg mb-8">
            620-658 Terrigal Dr, Erina NSW 2250
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/locations" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
              Find Your Nearest <ChevronRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
