import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { getMenu } from '../server/menu.js'
import { priceCart, gstIncluded, round2, money } from '../src/data/pricing.js'

const LOCATIONS = ['Erina Fair Food Court']
const METHODS = ['Pick Up', 'Dine In']

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const clip = (s, n) => String(s ?? '').trim().slice(0, n)

// POST { name, phone, location, method, lines, stripePaymentIntentId }
// Only saves an order whose payment really succeeded at Stripe; the items and the total come from
// the server (menu + Stripe), never from the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lines, stripePaymentIntentId } = req.body ?? {}
  const name = clip(req.body?.name, 80) || 'Guest'
  const phone = clip(req.body?.phone, 30) || '—'
  const location = LOCATIONS.includes(req.body?.location) ? req.body.location : LOCATIONS[0]
  const method = METHODS.includes(req.body?.method) ? req.body.method : METHODS[0]

  if (typeof stripePaymentIntentId !== 'string' || !stripePaymentIntentId.startsWith('pi_')) {
    return res.status(400).json({ error: 'Missing payment reference' })
  }

  // 1. The payment must really have succeeded.
  let paid
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const pi = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
    if (pi.status !== 'succeeded') return res.status(402).json({ error: 'Payment not completed' })
    paid = round2((pi.amount_received ?? pi.amount) / 100)
  } catch (e) {
    console.error('Stripe verify error:', e)
    return res.status(400).json({ error: 'Could not verify the payment' })
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  // 2. Same payment saved twice (retry / double click) -> return the first order, send nothing.
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .maybeSingle()
  if (existing) return res.status(200).json({ orderId: existing.id, duplicate: true })

  // 3. Items from the menu. (If the menu changed mid-checkout the order is still saved, flagged.)
  let items
  try {
    items = priceCart(getMenu(), lines).lines.map(l => ({
      id: l.id,
      name: l.name,
      quantity: l.quantity,
      unit_price: l.unit,
      line_total: l.total,
      options: l.options.map(o => ({ label: o.label, value: o.value })),
      addons: l.addons.map(a => ({ name: a.name, price: a.price })),
    }))
  } catch (e) {
    console.error('Could not re-read paid order lines:', e.message, JSON.stringify(lines))
    items = [{ id: 'unreadable', name: `CHECK STRIPE: order details unavailable (${stripePaymentIntentId})`, quantity: 1, unit_price: paid, line_total: paid, options: [], addons: [] }]
  }

  const gst = gstIncluded(paid)
  const { data: order, error: dbError } = await supabase
    .from('orders')
    .insert({
      name,
      phone,
      location,
      method,
      items,
      subtotal: round2(paid - gst), // ex-GST
      total: paid, // GST-inclusive, what the customer paid
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'pending',
    })
    .select()
    .single()

  // The customer has already paid. If the database is down (e.g. a paused free-tier project),
  // still email the kitchen so the order is never lost; the email says it was not saved.
  const saved = !dbError && Boolean(order)
  if (!saved) console.error('Supabase error (order NOT saved, emailing kitchen anyway):', dbError)
  const orderRef = saved ? order.id.slice(0, 8).toUpperCase() : 'NOT SAVED'
  const warning = saved
    ? ''
    : `<div style="background:#fdecea;color:#b3261e;padding:12px 32px;font-size:13px;font-weight:bold;">
        ⚠ This order could NOT be saved to the dashboard (database unreachable). The customer HAS paid: make it from this email. Stripe payment: ${esc(stripePaymentIntentId)}
      </div>`

  // 4. Kitchen email. A failure here must not fail the order (it is already saved).
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const ownerEmail = process.env.OWNER_EMAIL || 'sahashsainju7@gmail.com'

    const itemRows = items
      .map(i => {
        const choices = i.options.map(o => `${esc(o.label)}: <strong>${esc(o.value)}</strong>`).join(' &nbsp;·&nbsp; ')
        const extras = i.addons.map(a => esc(a.name)).join(', ')
        return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;vertical-align:top;">
            <div style="font-weight:700;">${esc(i.name)}</div>
            ${choices ? `<div style="color:#555;font-size:13px;margin-top:2px;">${choices}</div>` : ''}
            ${extras ? `<div style="color:#E87A00;font-size:13px;margin-top:2px;">+ ${extras}</div>` : ''}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;text-align:center;font-weight:700;vertical-align:top;">×${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;text-align:right;vertical-align:top;">${money(i.line_total)}</td>
        </tr>`
      })
      .join('')

    await resend.emails.send({
      from: 'Crunch & Steam Orders <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `${saved ? '🧾' : '⚠️ NOT SAVED —'} New Order — ${name} · ${money(paid)}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e0d8;">
          <div style="background:#2D1A00;padding:24px 32px;">
            <h1 style="margin:0;color:#E87A00;font-size:22px;">🍗 New Order!</h1>
            <p style="margin:4px 0 0;color:#fff8f0;font-size:13px;">Crunch &amp; Steam · Erina Fair Food Court</p>
          </div>
          ${warning}
          <div style="padding:24px 32px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">CUSTOMER</td><td style="font-weight:600;">${esc(name)}</td></tr>
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">PHONE</td><td>${esc(phone)}</td></tr>
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">TYPE</td><td>${esc(method)} · ${esc(location)}</td></tr>
              <tr><td style="color:#888;font-size:12px;">ORDER #</td><td style="font-size:12px;color:#888;">${esc(orderRef)}</td></tr>
            </table>

            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f9f6f2;">
                  <th style="padding:8px;text-align:left;font-size:11px;color:#888;text-transform:uppercase;">Item</th>
                  <th style="padding:8px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;">Qty</th>
                  <th style="padding:8px;text-align:right;font-size:11px;color:#888;text-transform:uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <div style="margin-top:16px;padding-top:12px;border-top:2px solid #2D1A00;display:flex;justify-content:space-between;">
              <div style="color:#888;font-size:13px;">Includes GST<br/><strong style="color:#2D1A00;font-size:16px;">Total paid</strong></div>
              <div style="text-align:right;font-size:13px;">${money(gst)}<br/><strong style="color:#E87A00;font-size:16px;">${money(paid)}</strong></div>
            </div>
          </div>
          <div style="background:#f9f6f2;padding:14px 32px;text-align:center;font-size:11px;color:#aaa;">
            View all orders at your admin dashboard
          </div>
        </div>
      `,
    })
  } catch (emailErr) {
    console.error('Email error:', emailErr)
  }

  res.status(200).json({ orderId: saved ? order.id : null, saved })
}
