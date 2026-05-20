import { Link } from 'react-router-dom'
import { Instagram, Facebook, MapPin, Phone, Clock } from 'lucide-react'
import logo from '../assets/logo.jpg'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="Crunch & Steam"
                className="h-12 w-12 rounded-full object-cover border-2 border-brand-primary"
              />
              <div>
                <p className="font-serif font-bold text-xl leading-tight">
                  Crunch <span className="text-brand-primary">&</span> Steam
                </p>
                <p className="text-xs text-white/50 font-medium tracking-widest uppercase">
                  Est. 2022
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Himalayan tradition meets golden perfection. Hand-folded momos and
              double-fried chicken, made fresh daily in Erina, NSW.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-primary transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-brand-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Menu column */}
          <div>
            <h3 className="font-serif font-bold text-base mb-4 text-brand-warm">Menu</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {['Fried Chicken', 'Steamed Momos', 'Fried Momos', 'Combos & Feasts', 'Sides', 'Drinks'].map(item => (
                <li key={item}>
                  <Link to="/menu" className="hover:text-brand-warm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="font-serif font-bold text-base mb-4 text-brand-warm">Company</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                { label: 'Our Story', to: '/about' },
                { label: 'Locations', to: '/locations' },
                { label: 'Order Online', to: '/order' },
                { label: 'Catering', to: '/about' },
                { label: 'Careers', to: '/about' },
                { label: 'Press', to: '/about' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-brand-warm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Contact */}
          <div>
            <h3 className="font-serif font-bold text-base mb-4 text-brand-warm">Visit Us</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex gap-2">
                <Clock size={16} className="text-brand-primary mt-0.5 shrink-0" />
                <span>Mon–Sun: 10:00 AM – 9:00 PM</span>
              </li>
              <li className="flex gap-2">
                <MapPin size={16} className="text-brand-primary mt-0.5 shrink-0" />
                <Link to="/locations" className="hover:text-brand-warm transition-colors">
                  Erina Fair Food Court
                </Link>
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="text-brand-primary mt-0.5 shrink-0" />
                <a href="tel:+61243650000" className="hover:text-brand-warm transition-colors">
                  (02) 4365 0000
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2025 Crunch & Steam. Kathmandu flavors, Australian spirit.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link to="/about" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-white/70 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
