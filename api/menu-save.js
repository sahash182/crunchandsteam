import { isAdmin } from '../server/auth.js'
import { getStore, StoreError, summarise } from '../server/menu-store.js'
import { buildMenu } from '../src/data/model.js'

const MAX_PHOTOS = 6
const MAX_PHOTO_BYTES = 1_500_000
const MAX_JSON_CHARS = 400_000
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

// POST { menu, baseVersion, photos: [{ slug, data (base64 JPEG) }] }
// Checks everything, then saves menu.json (+ photos) as ONE commit. The only files this endpoint
// can ever write are src/data/menu.json and menu-photos/real/<slug>.jpg.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { menu: incoming, baseVersion, photos = [] } = req.body ?? {}
  const fail = (error, problems) => res.status(400).json({ error, problems })

  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.items) ||
      !Array.isArray(incoming.categories) || !Array.isArray(incoming.addons) ||
      typeof incoming.optionSets !== 'object' || incoming.optionSets === null) {
    return fail('That does not look like a menu.')
  }
  // Only the four known sections are ever written.
  const menu = {
    categories: incoming.categories,
    optionSets: incoming.optionSets,
    addons: incoming.addons,
    items: incoming.items,
  }
  if (JSON.stringify(menu).length > MAX_JSON_CHARS || menu.items.length > 200) {
    return fail('The menu is too large.')
  }

  // Same checks the build runs, in plain English, plus length limits.
  const built = buildMenu(menu)
  const problems = [...built.problems]
  for (const i of menu.items) {
    if (String(i.name ?? '').length > 80) problems.push(`"${String(i.name).slice(0, 20)}…": name is too long (max 80).`)
    if (String(i.description ?? '').length > 500) problems.push(`"${i.name}": description is too long (max 500).`)
    if (String(i.portion ?? '').length > 30) problems.push(`"${i.name}": portion is too long (max 30).`)
  }
  if (!built.items.some(i => i.available)) problems.push('At least one dish must be available.')
  if (problems.length) return fail('Please fix these first.', problems)

  // Photos: JPEG only, small, and only for dishes that exist in this menu.
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) return fail(`Upload at most ${MAX_PHOTOS} photos per save.`)
  const slugs = new Set(built.items.map(i => i.slug))
  const files = []
  for (const p of photos) {
    if (!p || !SLUG.test(p.slug) || !slugs.has(p.slug)) return fail('A photo does not belong to any dish.')
    const buffer = Buffer.from(String(p.data ?? ''), 'base64')
    if (buffer.length < 1000 || buffer.length > MAX_PHOTO_BYTES) return fail('A photo is too large or empty. Try a smaller one.')
    if (!(buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)) return fail('Photos must be JPEG images.')
    files.push({ slug: p.slug, buffer })
  }

  try {
    const store = getStore()
    const before = await store.read()
    const changes = summarise(before.menu, menu)
    for (const f of files) changes.push(`new photo for "${built.items.find(i => i.slug === f.slug).name}"`)
    if (changes.length === 0) return res.status(200).json({ ok: true, changes: [], unchanged: true })

    const message =
      `Menu update (admin): ${changes.slice(0, 3).join(', ')}${changes.length > 3 ? ` +${changes.length - 3} more` : ''}\n\n` +
      changes.map(c => `- ${c}`).join('\n')
    const result = await store.commit({ menu, baseVersion, photos: files, message })
    res.status(200).json({ ok: true, changes, ...result })
  } catch (e) {
    if (e instanceof StoreError) return res.status(e.status).json({ error: e.message })
    console.error('menu-save', e)
    res.status(500).json({ error: 'Saving failed. Nothing was changed.' })
  }
}
