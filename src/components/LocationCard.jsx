import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LocationCard({ location }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-brand-dark/5"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={location.image}
          alt={`${location.name} restaurant`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 to-transparent" />
        {location.isNew && (
          <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            New Location
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif font-bold text-white text-xl">
            {location.name}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3 text-sm text-brand-text/70">
          <MapPin size={16} className="text-brand-primary mt-0.5 shrink-0" />
          <div>
            <p>{location.address}</p>
            <p>{location.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-brand-text/70">
          <Phone size={16} className="text-brand-primary shrink-0" />
          <a href={`tel:${location.phone}`} className="hover:text-brand-primary transition-colors">
            {location.phone}
          </a>
        </div>

        <div className="flex items-center gap-3 text-sm text-brand-text/70">
          <Clock size={16} className="text-brand-primary shrink-0" />
          <span>{location.hours}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <a
            href={location.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 border border-brand-primary text-brand-primary font-semibold text-sm py-2.5 rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Navigation size={15} />
            Directions
          </a>
          <Link
            to="/order"
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-primary text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-brand-warm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <ShoppingBag size={15} />
            Order Here
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
