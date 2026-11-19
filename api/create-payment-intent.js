import Stripe from 'stripe'
import { getMenu } from '../server/menu.js'
import { priceCart, cents, gstIncluded } from '../src/data/pricing.js'

// POST { lines: [{ id, quantity, selections, addons }] }
// The browser never sends a price: the amount is worked out here from the menu (GST included).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let priced
  try {
    priced = priceCart(getMenu(), req.body?.lines)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }

  const amount = cents(priced.total)
  if (amount < 50) return res.status(400).json({ error: 'The minimum order is $0.50.' })

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
    })
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      total: priced.total,
      gst: gstIncluded(priced.total),
    })
  } catch (err) {
    console.error('create-payment-intent', err)
    res.status(500).json({ error: 'Could not start the payment. Please try again.' })
  }
}
