import { isAdmin } from '../server/auth.js'
import { getStore, StoreError } from '../server/menu-store.js'

// GET: the latest saved menu (straight from GitHub, so it is current even while a deploy runs).
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const store = getStore()
    const { menu, version } = await store.read()
    res.status(200).json({ menu, version, store: store.name })
  } catch (e) {
    if (e instanceof StoreError) return res.status(e.status).json({ error: e.message })
    console.error('menu-admin', e)
    res.status(500).json({ error: 'Could not load the menu.' })
  }
}
