// Turns src/data/menu.json + menu-photos/ into:
//   /images/menu/thumb/<id>.jpg   600px wide  (website menu cards)
//   /images/menu/full/<id>.jpg    1600px max  (CrunchMarket videos)
//   /menu.json                    the menu for CrunchMarket and anything else
//   virtual:menu-photos           photo info for the React app
//
// Photo rules (drop a file in, nothing else to edit):
//   menu-photos/real/<id>.jpg|jpeg|png|webp   your own photo  -> used everywhere, publishable
//   menu-photos/stock/<id>.jpg                representative stand-in (credited on /credits)
//   neither                                    branded "photo coming soon" placeholder
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const SIZES = { thumb: 600, full: 1600 }
const BADGES = { 'fan-favorite': 'Fan Fave', new: 'New', spicy: 'Spicy' }
const VIRTUAL = 'virtual:menu-photos'
const RESOLVED = '\0' + VIRTUAL

export default function menuData({ root = process.cwd() } = {}) {
  const photosDir = path.join(root, 'menu-photos')
  const menuFile = path.join(root, 'src', 'data', 'menu.json')
  const modelFile = path.join(root, 'src', 'data', 'model.js')
  let server

  // Reads menu.json, checks it (plain-English error if something is wrong) and normalises it.
  async function loadMenu() {
    const raw = JSON.parse(fs.readFileSync(menuFile, 'utf8')) // fresh read: edits show up in dev
    const { buildMenu, assertValid } = await import(pathToFileURL(modelFile).href + `?t=${Date.now()}`)
    const menu = buildMenu(raw)
    assertValid(menu)
    return menu
  }

  function findPhoto(id) {
    for (const kind of ['real', 'stock']) {
      for (const ext of EXTS) {
        const file = path.join(photosDir, kind, id + ext)
        if (fs.existsSync(file)) return { kind, file }
      }
    }
    return null
  }

  function readCredits() {
    const file = path.join(photosDir, 'stock', 'credits.json')
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  }

  async function catalog() {
    const { items: dishes, categories, addons } = await loadMenu()
    const credits = readCredits()
    const catLabel = Object.fromEntries(categories.map(c => [c.id, c.label]))
    const items = dishes.map(item => {
      const id = item.slug
      const photo = findPhoto(id)
      const credit = photo?.kind === 'stock' ? credits[id] ?? null : null
      return { item, id, photo, credit, category: catLabel[item.category] ?? item.category }
    })
    return { items, categories, addons }
  }

  function photoInfo(entry) {
    if (!entry.photo) return { type: 'none' }
    return {
      type: entry.photo.kind,
      thumb: `/images/menu/thumb/${entry.id}.jpg`,
      full: `/images/menu/full/${entry.id}.jpg`,
      credit: entry.credit,
    }
  }

  // /menu.json — a public contract with CrunchMarket. Existing fields never change meaning
  // (it reads id, name, description, price, category, badges, spice_level, available, image_*);
  // new fields are only ever ADDED, and add-ons live in their own list so they are never
  // mistaken for dishes to feature in a video.
  function menuJson({ items, categories, addons }) {
    return {
      restaurant: 'Crunch & Steam',
      currency: 'AUD',
      prices_include_gst: true,
      generated_at: new Date().toISOString(),
      categories: categories.map(c => ({ id: c.id, label: c.label, blurb: c.blurb })),
      items: items.map(({ item, id, photo, credit, category }) => ({
        id,
        site_id: item.id,
        name: item.name,
        description: item.description,
        price: item.price, // base price; some dishes let the customer pay extra for choices/add-ons
        category,
        badges: item.tag && BADGES[item.tag] ? [BADGES[item.tag]] : [],
        spice_level: item.spice ?? 0, // fixed heat 0-3; 0 when the customer chooses (see options)
        sizes: [],
        available: item.available,
        image_url: photo ? `/images/menu/full/${id}.jpg` : null,
        image_type: photo ? photo.kind : 'none',
        image_credit: credit,
        // ── added for the new menu (CrunchMarket ignores unknown fields) ──
        portion: item.portion,
        includes: item.includes,
        options: item.options, // [{id, label, required, choices:[{label, price}]}]; id 'spice' = heat
        addon_ids: item.addonIds,
      })),
      addons: addons.map(a => ({ id: a.id, name: a.name, price: a.price })),
    }
  }

  async function resized(file, width) {
    return sharp(file)
      .rotate() // respect phone EXIF orientation
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  }

  return {
    name: 'crunch-menu-data',

    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED
    },

    async load(id) {
      if (id !== RESOLVED) return
      const cat = await catalog()
      const photos = Object.fromEntries(cat.items.map(e => [e.id, photoInfo(e)]))
      this.addWatchFile(menuFile)
      return `export default ${JSON.stringify(photos)}`
    },

    configureServer(s) {
      server = s
      // Dev: serve menu.json and resized photos on the fly.
      s.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url.split('?')[0]
          if (url === '/menu.json') {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify(menuJson(await catalog()), null, 2))
          }
          const m = url.match(/^\/images\/menu\/(thumb|full)\/([a-z0-9-]+)\.jpg$/)
          if (m) {
            const photo = findPhoto(m[2])
            if (!photo) return next()
            res.setHeader('Content-Type', 'image/jpeg')
            return res.end(await resized(photo.file, SIZES[m[1]]))
          }
        } catch (e) {
          return next(e)
        }
        next()
      })
      // Dropping a new photo in menu-photos/, or saving menu.json, refreshes the page.
      const norm = p => p.split(path.sep).join('/')
      s.watcher.add(photosDir)
      s.watcher.add(menuFile)
      s.watcher.on('all', (_event, file) => {
        const f = norm(file)
        if (f.startsWith(norm(photosDir)) || f === norm(menuFile)) {
          const mod = s.moduleGraph.getModuleById(RESOLVED)
          if (mod) s.moduleGraph.invalidateModule(mod)
          s.ws.send({ type: 'full-reload' })
        }
      })
    },

    async generateBundle() {
      const cat = await catalog()
      let count = 0
      for (const entry of cat.items) {
        if (!entry.photo) continue
        for (const [size, width] of Object.entries(SIZES)) {
          this.emitFile({
            type: 'asset',
            fileName: `images/menu/${size}/${entry.id}.jpg`,
            source: await resized(entry.photo.file, width),
          })
        }
        count++
      }
      this.emitFile({
        type: 'asset',
        fileName: 'menu.json',
        source: JSON.stringify(menuJson(cat), null, 2),
      })
      const missing = cat.items.filter(e => !e.photo).map(e => e.id)
      const real = cat.items.filter(e => e.photo?.kind === 'real').length
      console.log(
        `\n[menu] ${cat.items.length} dishes, ${count} photos (${real} real, ${count - real} stand-in)` +
          (missing.length ? `, no photo yet: ${missing.join(', ')}` : ''),
      )
    },
  }
}
