import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, ChevronRight, MapPin, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import DhakaDivider from '../components/DhakaDivider'
import MandalaBg from '../components/MandalaBg'
import PaymentForm from '../components/PaymentForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const locations = ['Erina Fair Food Court']
const methods   = ['Pick Up', 'Dine In']

export default function Order() {
  const { items, total, dispatch } = useCart()
  const [location, setLocation]   = useState('')
  const [method, setMethod]       = useState('Pick Up')
  const [step, setStep]           = useState(1) // 1=cart, 2=details, 3=payment, 4=confirm
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState(null)

  const taxedTotal = total * 1.1  // 10% GST

  const handleContinueToPayment = async () => {
    setLoadingIntent(true)
    setIntentError(null)
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: taxedTotal }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setClientSecret(data.clientSecret)
      setStep(3)
    } catch (err) {
      setIntentError(err.message)
    } finally {
      setLoadingIntent(false)
    }
  }

  const handlePaymentSuccess = () => {
    dispatch({ type: 'CLEAR' })
    setStep(4)
  }

  // ── Step 4: Confirmation ──────────────────────────────────────────
  if (step === 4) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-green/10 rounded-full text-brand-green mb-6">
            <CheckCircle size={44} />
          </div>
          <h1 className="font-serif font-bold text-brand-dark text-3xl mb-3">
            Order Confirmed!
          </h1>
          <p className="text-brand-text/60 mb-2">
            Payment successful. Your order is being prepared fresh.
          </p>
          <p className="text-brand-primary font-semibold text-sm mb-8">
            Estimated wait: 15–20 minutes
          </p>
          <div className="bg-brand-cream rounded-2xl p-4 mb-8 text-sm text-brand-text/70 text-left space-y-1">
            <div className="flex justify-between"><span>Location</span><span className="font-semibold text-brand-text">{location || 'Erina Fair Food Court'}</span></div>
            <div className="flex justify-between"><span>Method</span><span className="font-semibold text-brand-text">{method}</span></div>
            <div className="flex justify-between"><span>Name</span><span className="font-semibold text-brand-text">{name || 'Guest'}</span></div>
          </div>
          <Link to="/menu" className="btn-primary w-full block text-center">
            Order Again
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Header */}
      <section className="bg-brand-dark pt-28 pb-12 px-4 relative overflow-hidden">
        <MandalaBg size={500} className="top-1/2 right-10 -translate-y-1/2 opacity-50" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-primary font-semibold tracking-widest uppercase text-xs mb-3">
            Order Online
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif font-bold text-white text-4xl md:text-5xl"
          >
            Your Order
          </motion.h1>
        </div>
      </section>

      <DhakaDivider />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[{ n: 1, label: 'Cart' }, { n: 2, label: 'Details' }, { n: 3, label: 'Payment' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step >= n ? 'text-brand-primary' : 'text-brand-text/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= n ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-dark/20'}`}>
                  {n}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {n < 3 && <ChevronRight size={16} className="text-brand-dark/20" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Cart ── */}
          {step === 1 && (
            <motion.div key="cart" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
              {items.length === 0 ? (
                <div className="text-center py-24">
                  <ShoppingCart size={56} className="text-brand-text/20 mx-auto mb-4" />
                  <h2 className="font-serif font-bold text-brand-text text-2xl mb-3">Your cart is empty</h2>
                  <p className="text-brand-text/50 mb-8">Add something delicious from our menu.</p>
                  <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
                    Browse Menu <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-[1fr_300px] gap-6">
                  <div className="space-y-3">
                    <h2 className="font-serif font-bold text-brand-dark text-xl mb-4">
                      {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                    </h2>
                    <AnimatePresence>
                      {items.map(item => (
                        <motion.div
                          key={`${item.id}-${item.size}`}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-brand-dark/5"
                        >
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-brand-text text-sm truncate">{item.name}</p>
                            {item.size && <p className="text-brand-text/40 text-xs mt-0.5">{item.size}</p>}
                            <p className="text-brand-primary font-bold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, size: item.size, quantity: item.quantity - 1 })} className="w-7 h-7 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary transition-colors" aria-label="Decrease"><Minus size={12} /></button>
                            <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, size: item.size, quantity: item.quantity + 1 })} className="w-7 h-7 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary transition-colors" aria-label="Increase"><Plus size={12} /></button>
                            <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id, size: item.size })} className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-1" aria-label="Remove"><Trash2 size={13} /></button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="pt-2">
                      <Link to="/menu" className="text-brand-primary text-sm font-semibold hover:text-brand-warm transition-colors inline-flex items-center gap-1">
                        + Add more items
                      </Link>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 h-fit sticky top-24">
                    <h3 className="font-serif font-bold text-brand-dark text-lg mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between text-brand-text/60"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                      <div className="flex justify-between text-brand-text/60"><span>GST (10%)</span><span>${(total * 0.1).toFixed(2)}</span></div>
                    </div>
                    <div className="border-t border-brand-dark/10 pt-3 mb-5">
                      <div className="flex justify-between font-bold text-brand-dark">
                        <span>Total</span><span>${taxedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <motion.div key="details" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-[1fr_300px] gap-6">
              <div className="space-y-5">
                <h2 className="font-serif font-bold text-brand-dark text-xl">Your Details</h2>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-1.5">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" className="w-full border border-brand-dark/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(02) 4365 0000" className="w-full border border-brand-dark/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-1.5">Location</label>
                  <div className="space-y-2">
                    {locations.map(loc => (
                      <button key={loc} onClick={() => setLocation(loc)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${location === loc ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-semibold' : 'border-brand-dark/15 hover:border-brand-primary/40'}`}>
                        <MapPin size={15} className={location === loc ? 'text-brand-primary' : 'text-brand-text/40'} />
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-1.5">Order Type</label>
                  <div className="flex gap-3">
                    {methods.map(m => (
                      <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${method === m ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-dark/15 hover:border-brand-primary/40'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 h-fit sticky top-24">
                <h3 className="font-serif font-bold text-brand-dark text-lg mb-4">Summary</h3>
                <div className="space-y-1 text-xs text-brand-text/60 mb-4">
                  {items.map(i => (
                    <div key={`${i.id}-${i.size}`} className="flex justify-between">
                      <span>{i.name} ×{i.quantity}</span>
                      <span>${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-brand-dark/10 pt-3 mb-5">
                  <div className="flex justify-between font-bold text-brand-dark text-sm">
                    <span>Total (inc. GST)</span><span>${taxedTotal.toFixed(2)}</span>
                  </div>
                </div>

                {intentError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 mb-3">
                    {intentError}
                  </div>
                )}

                <button
                  onClick={handleContinueToPayment}
                  disabled={!location || loadingIntent}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={16} />
                  {loadingIntent ? 'Loading…' : 'Continue to Payment'}
                </button>
                {!location && <p className="text-xs text-center text-brand-text/40 mt-2">Select a location to continue</p>}
                <button onClick={() => setStep(1)} className="w-full text-center text-sm text-brand-text/50 hover:text-brand-text mt-3 transition-colors">
                  ← Back to cart
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && clientSecret && (
            <motion.div key="payment" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-[1fr_300px] gap-6">
              <div>
                <h2 className="font-serif font-bold text-brand-dark text-xl mb-5">Payment</h2>
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <PaymentForm
                    total={taxedTotal}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setStep(2)}
                  />
                </Elements>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5 h-fit sticky top-24">
                <h3 className="font-serif font-bold text-brand-dark text-lg mb-4">Summary</h3>
                <div className="space-y-1 text-xs text-brand-text/60 mb-4">
                  {items.map(i => (
                    <div key={`${i.id}-${i.size}`} className="flex justify-between">
                      <span>{i.name} ×{i.quantity}</span>
                      <span>${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-brand-dark/10 pt-3">
                  <div className="flex justify-between font-bold text-brand-dark text-sm">
                    <span>Total (inc. GST)</span><span>${taxedTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-brand-text/50 space-y-0.5">
                  <p><span className="font-semibold">Location:</span> {location}</p>
                  <p><span className="font-semibold">Type:</span> {method}</p>
                  {name && <p><span className="font-semibold">Name:</span> {name}</p>}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
