import { timingSafeEqual } from 'node:crypto'

// Admin password check shared by every admin endpoint (orders and menu editor).
// Constant-time comparison; refuses everything if ADMIN_PASSWORD is not configured.
export function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD
  const given = req.headers['x-admin-password']
  if (!expected || typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
