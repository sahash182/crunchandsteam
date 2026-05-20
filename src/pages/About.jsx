import { motion } from 'framer-motion'
import { Heart, Users, Award, Globe } from 'lucide-react'
import DhakaDivider from '../components/DhakaDivider'
import MandalaBg from '../components/MandalaBg'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.14 } },
}

const milestones = [
  {
    year: '2018',
    title: 'The Dream Begins in Kathmandu',
    desc: 'Founders Arosha and Amir grow up with a deep love of food and culture, dreaming of sharing the taste of home with the world.',
  },
  {
    year: '2020',
    title: 'Landing in Australia',
    desc: 'Arosha and Amir arrive on the Central Coast with a shared vision, a family recipe book, and an idea — what if you combined the best of Nepalese street food with Australian food culture?',
  },
  {
    year: '2022',
    title: 'First Location Opens',
    desc: 'The original Crunch & Steam opens inside Erina Fair Food Court. Lines stretched around the corner on day one. The Central Coast had never tasted anything like it.',
  },
  {
    year: '2024',
    title: 'Central Coast\'s Fastest Growing Brand',
    desc: '50,000+ customers and a loyal community of momo-lovers. Crunch & Steam was named the Central Coast\'s Best New Restaurant by the Central Coast Express Advocate.',
  },
]

const values = [
  { icon: <Heart size={24} />, title: 'Authenticity',  desc: 'We never compromise on ingredients or technique. Every recipe traces back to Nepal.' },
  { icon: <Users size={24} />, title: 'Community',     desc: 'We hire locally, source where we can, and give back to the Nepalese diaspora in Australia.' },
  { icon: <Award size={24} />, title: 'The Crunch',    desc: 'Quality is non-negotiable. If it doesn\'t shatter perfectly, it doesn\'t leave the kitchen.' },
  { icon: <Globe size={24} />, title: 'Warmth',        desc: 'Food should feel like home. We want every guest to leave warmer than they arrived.' },
]

const team = [
  { name: 'Arosha & Amir',    role: 'Founders & Co-CEOs',    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80' },
  { name: 'Rina Shrestha',    role: 'Head Chef',         image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { name: 'Marcus Webb',      role: 'Operations Director', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' },
  { name: 'Anjali Gurung',    role: 'Brand Manager',     image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80' },
]

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Hero split */}
      <section className="min-h-screen grid md:grid-cols-2">
        {/* Image side */}
        <div className="relative h-64 md:h-auto">
          <img
            src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&auto=format&fit=crop&q=85"
            alt="Steaming fresh momos in a bamboo steamer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/20 hidden md:block" />
        </div>

        {/* Text side */}
        <div className="flex items-center bg-brand-dark px-8 md:px-16 py-20 md:py-0 relative overflow-hidden">
          <MandalaBg size={500} className="top-1/2 right-0 -translate-y-1/2 translate-x-1/4" />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative max-w-lg"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-4">
              Our Story
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif font-bold text-white text-4xl md:text-5xl leading-tight mb-6">
              From Kathmandu<br />to Erina
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/65 text-base leading-relaxed mb-4">
              Every momo that leaves our kitchen carries a story — of mountain mornings, family kitchens, and the scent of timur pepper in the air. Crunch & Steam was built on a simple belief: the best food in the world deserves to be shared beyond borders.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/65 text-base leading-relaxed">
              Our founders Arosha and Amir grew up with a deep love of Nepalese cuisine, where momos are not just food — they're a ritual. When they arrived in Australia, they couldn't find a single restaurant that understood what real Nepalese flavors tasted like. So they built one.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* Pull quote */}
      <section className="relative py-20 px-4 bg-brand-cream overflow-hidden">
        <MandalaBg size={800} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-serif font-bold text-brand-dark text-3xl md:text-4xl leading-snug"
          >
            "Every momo tells a story.<br />Every bite brings you home."
          </motion.blockquote>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-brand-primary font-semibold mt-6 tracking-wider text-sm uppercase"
          >
            — Arosha & Amir, Founders
          </motion.p>
        </div>
      </section>

      <DhakaDivider />

      {/* Timeline */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">Our Journey</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">From Kathmandu to Erina</motion.h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-brand-primary/20 -translate-x-1/2 hidden sm:block" />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex gap-6 md:gap-0 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`hidden md:flex md:w-1/2 ${i % 2 === 0 ? 'md:justify-end md:pr-10' : 'md:justify-start md:pl-10'}`}>
                    <div className="bg-brand-cream rounded-2xl p-6 max-w-xs">
                      <span className="text-brand-primary font-bold text-2xl font-serif">{m.year}</span>
                      <h3 className="font-serif font-bold text-brand-text text-lg mt-2 mb-2">{m.title}</h3>
                      <p className="text-brand-text/60 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-primary rounded-full border-4 border-white shadow-md" style={{ top: 'auto', position: 'relative', marginTop: '1.5rem' }} />

                  {/* Mobile version */}
                  <div className="md:hidden flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-brand-primary rounded-full mt-1 shrink-0" />
                      {i < milestones.length - 1 && <div className="w-px flex-1 bg-brand-primary/20 mt-2" />}
                    </div>
                    <div className="bg-brand-cream rounded-2xl p-5 flex-1 mb-2">
                      <span className="text-brand-primary font-bold text-xl font-serif">{m.year}</span>
                      <h3 className="font-serif font-bold text-brand-text text-base mt-1 mb-1">{m.title}</h3>
                      <p className="text-brand-text/60 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DhakaDivider />

      {/* Values */}
      <section className="py-20 px-4 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">What We Stand For</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">Our Values</motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-brand-dark/5 card-hover"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-xl text-brand-primary mb-4">
                  {v.icon}
                </div>
                <h3 className="font-serif font-bold text-brand-text text-base mb-2">{v.title}</h3>
                <p className="text-brand-text/55 text-xs leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <DhakaDivider />

      {/* Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-2">The Team</motion.p>
            <motion.h2 variants={fadeUp} className="section-heading">The Faces Behind the Flavors</motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="text-center"
              >
                <div className="relative mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden ring-4 ring-brand-primary/20 hover:ring-brand-primary transition-all duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-serif font-bold text-brand-text text-base">{member.name}</h3>
                <p className="text-brand-primary text-xs font-semibold mt-1">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  )
}
