import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { amount } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
