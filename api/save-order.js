import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, phone, location, method, items, subtotal, total, stripePaymentIntentId } = req.body

  // ── Save to Supabase ──────────────────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { data: order, error: dbError } = await supabase
    .from('orders')
    .insert({
      name: name || 'Guest',
      phone: phone || '—',
      location,
      method,
      items,
      subtotal,
      total,
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    console.error('Supabase error:', dbError)
    return res.status(500).json({ error: 'Failed to save order' })
  }

  // ── Send email via Resend ─────────────────────────────────────────
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const ownerEmail = process.env.OWNER_EMAIL || 'sahashsainju7@gmail.com'

    const itemRows = items
      .map(i => `
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #f0ebe3;">${i.name}${i.size ? ` <span style="color:#888;font-size:12px;">(${i.size})</span>` : ''}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0ebe3;text-align:center;color:#888;">×${i.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-weight:600;">$${(i.price * i.quantity).toFixed(2)}</td>
        </tr>`)
      .join('')

    await resend.emails.send({
      from: 'Crunch & Steam Orders <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `🧾 New Order — ${name || 'Guest'} · $${total.toFixed(2)}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e0d8;">
          <div style="background:#2D1A00;padding:24px 32px;">
            <h1 style="margin:0;color:#E87A00;font-size:22px;">🍗 New Order!</h1>
            <p style="margin:4px 0 0;color:#fff8f0;font-size:13px;">Crunch &amp; Steam · Erina Fair Food Court</p>
          </div>
          <div style="padding:24px 32px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">CUSTOMER</td><td style="font-weight:600;">${name || 'Guest'}</td></tr>
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">PHONE</td><td>${phone || '—'}</td></tr>
              <tr><td style="color:#888;font-size:12px;padding-bottom:4px;">TYPE</td><td>${method} · ${location}</td></tr>
              <tr><td style="color:#888;font-size:12px;">ORDER #</td><td style="font-size:12px;color:#888;">${order.id.slice(0, 8).toUpperCase()}</td></tr>
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
              <div style="color:#888;font-size:13px;">Subtotal<br/>GST (10%)<br/><strong style="color:#2D1A00;font-size:16px;">Total</strong></div>
              <div style="text-align:right;font-size:13px;">$${subtotal.toFixed(2)}<br/>$${(total - subtotal).toFixed(2)}<br/><strong style="color:#E87A00;font-size:16px;">$${total.toFixed(2)}</strong></div>
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
    // Don't fail the request if email fails — order is already saved
  }

  res.status(200).json({ orderId: order.id })
}
