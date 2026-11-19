import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '../server/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in Vercel environment variables.' })
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL.trim(),
      process.env.SUPABASE_SERVICE_KEY.trim()
    )

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return res.status(500).json({ error: error.message })

    res.status(200).json(data)
  } catch (err) {
    // Never crash the function: say what went wrong (no secrets in this message).
    console.error('get-orders failed:', err)
    res.status(500).json({ error: `Could not connect to the database: ${err.message}` })
  }
}
