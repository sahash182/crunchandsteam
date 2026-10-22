// "Link in bio" page for Instagram/TikTok/YouTube profiles: crunchandsteam.vercel.app/links
// Buttons come from src/data/site.js and src/data/locations.js — edit those, not this file.
import { Link } from 'react-router-dom'
import { ShoppingBag, UtensilsCrossed, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react'
import logo from '../assets/logo.jpg'
import { site } from '../data/site'
import { locations } from '../data/locations'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
  </svg>
)

function Button({ to, href, icon, children, primary = false }) {
  const cls = `flex items-center justify-center gap-3 w-full py-4 px-5 rounded-2xl font-semibold text-base
    transition-transform active:scale-[0.98] shadow-sm ${
      primary
        ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
        : 'bg-white text-brand-text border border-brand-dark/10 hover:border-brand-primary'
    }`
  return to ? (
    <Link to={to} className={cls}>{icon}{children}</Link>
  ) : (
    <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined}
       rel="noopener noreferrer">{icon}{children}</a>
  )
}

export default function Links() {
  const loc = locations[0]
  const phoneDigits = loc?.phone?.replace(/[^\d+]/g, '')
  const socials = [
    { key: 'instagram', label: 'Instagram', icon: <Instagram size={20} /> },
    { key: 'tiktok', label: 'TikTok', icon: <TikTokIcon /> },
    { key: 'facebook', label: 'Facebook', icon: <Facebook size={20} /> },
    { key: 'youtube', label: 'YouTube', icon: <Youtube size={20} /> },
  ].filter(s => site.social[s.key])

  return (
    <main className="min-h-screen bg-brand-cream flex justify-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col items-center">
        <img src={logo} alt={site.name}
             className="w-24 h-24 rounded-full object-cover border-4 border-brand-primary shadow-md" />
        <h1 className="mt-4 font-serif font-bold text-3xl text-brand-text">{site.name}</h1>
        <p className="mt-1 text-brand-text/70 text-center">{site.tagline}</p>
        <p className="text-brand-text/50 text-sm">{site.area}</p>

        <div className="mt-8 w-full flex flex-col gap-3">
          <Button to={`/order?${site.linkInBioUtm}`} icon={<ShoppingBag size={20} />} primary>
            Order online
          </Button>
          <Button to="/menu" icon={<UtensilsCrossed size={20} />}>See the menu</Button>
          {loc?.mapUrl && <Button href={loc.mapUrl} icon={<MapPin size={20} />}>Find us</Button>}
          {phoneDigits && <Button href={`tel:${phoneDigits}`} icon={<Phone size={20} />}>Call {loc.phone}</Button>}
        </div>

        {loc?.hours && <p className="mt-6 text-sm text-brand-text/60 text-center">{loc.name} · {loc.hours}</p>}

        {socials.length > 0 && (
          <div className="mt-6 flex gap-3">
            {socials.map(s => (
              <a key={s.key} href={site.social[s.key]} target="_blank" rel="noopener noreferrer"
                 aria-label={s.label}
                 className="p-3 rounded-full bg-brand-dark text-white hover:bg-brand-primary transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        )}

        <Link to="/" className="mt-10 text-xs text-brand-text/40 hover:text-brand-primary">
          crunchandsteam.vercel.app
        </Link>
      </div>
    </main>
  )
}
