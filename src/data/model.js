// Turns the hand-edited (or admin-edited) src/data/menu.json into a checked, normalised menu.
// Used by: the website (catalog.js), the build plugin (menu.json feed + friendly errors), the
// payment API (re-prices every order on the server) and the admin menu editor (validates before
// saving). Pure JS: no browser or Vite APIs, and imports carry .js so Node can load it too.
import { slugify } from './slug.js'

const isNum = n => typeof n === 'number' && Number.isFinite(n) && n >= 0

function normaliseChoices(choices) {
  return (choices ?? []).map(c =>
    typeof c === 'string' ? { label: c, price: 0 } : { label: c.label, price: c.price ?? 0 },
  )
}

// Stable id for photos/videos. Set once when a dish is created and kept when it is renamed.
export function uniqueSlug(name, taken) {
  const base = slugify(name) || 'dish'
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

export function buildMenu({ categories = [], optionSets = {}, addons = [], items: rawItems = [] }) {
  const problems = []

  // ── Choice sets (spice levels, momo styles, drinks…) ──
  for (const [key, set] of Object.entries(optionSets)) {
    const name = `Choice list "${set.label ?? key}"`
    if (!set.label) problems.push(`${name}: needs a name.`)
    const choices = normaliseChoices(set.choices)
    if (choices.length === 0) problems.push(`${name}: add at least one choice.`)
    const labels = choices.map(c => c.label)
    if (new Set(labels).size !== labels.length) problems.push(`${name}: a choice is repeated.`)
    choices.forEach(c => {
      if (!c.label) problems.push(`${name}: a choice has no name.`)
      if (!isNum(c.price)) problems.push(`${name}: "${c.label}" has a bad extra price (use a number like 2 or 1.5).`)
    })
  }

  // ── Categories ──
  const catIds = new Set()
  const cats = categories.map(c => {
    if (!c.id || !c.label) problems.push(`A category needs a name (got ${JSON.stringify(c)}).`)
    if (catIds.has(c.id)) problems.push(`Category id "${c.id}" is used twice.`)
    catIds.add(c.id)
    return { id: c.id, label: c.label, blurb: c.blurb ?? '', addonIds: c.addons ?? [] }
  })
  const catById = Object.fromEntries(cats.map(c => [c.id, c]))

  // ── Add-ons ──
  const addonList = addons.map(a => {
    if (!a.id || !a.name) problems.push(`An add-on needs a name (got ${JSON.stringify(a)}).`)
    if (!isNum(a.price)) problems.push(`Add-on "${a.name ?? a.id}": price must be a number like 2 or 1.5.`)
    return { id: a.id, name: a.name, price: a.price }
  })
  const addonById = Object.fromEntries(addonList.map(a => [a.id, a]))
  if (addonList.length !== Object.keys(addonById).length) problems.push('Two add-ons share the same id.')
  for (const c of cats) {
    for (const id of c.addonIds) {
      if (!addonById[id]) problems.push(`Category "${c.label}": add-on "${id}" does not exist.`)
    }
  }

  // ── Dishes ──
  const ids = new Set(addonList.map(a => a.id)) // dish ids and add-on ids share one namespace
  const slugs = new Map()

  const items = rawItems.map(raw => {
    const who = `"${raw.name ?? raw.id ?? '(unnamed dish)'}"`
    if (!raw.id) problems.push(`${who}: missing id.`)
    if (ids.has(raw.id)) problems.push(`${who}: id "${raw.id}" is already used by another dish or add-on.`)
    ids.add(raw.id)
    if (!raw.name || !String(raw.name).trim()) problems.push(`Dish ${raw.id}: needs a name.`)
    if (!catById[raw.category]) {
      problems.push(`${who}: pick a section for it (got "${raw.category}").`)
    }
    if (!isNum(raw.price)) problems.push(`${who}: price must be a number like 16 or 15.5 (got ${JSON.stringify(raw.price)}).`)

    const slug = raw.slug || (raw.name ? slugify(raw.name) : '')
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) problems.push(`${who}: photo/video id "${slug}" is not valid.`)
    if (slugs.has(slug)) problems.push(`${who}: shares its photo/video id ("${slug}") with ${slugs.get(slug)}.`)
    slugs.set(slug, who)

    const optionIds = new Set()
    const options = (raw.options ?? []).map(ref => {
      const set = ref.set ? optionSets[ref.set] : null
      if (ref.set && !set) problems.push(`${who}: choice list "${ref.set}" does not exist.`)
      const id = ref.id ?? ref.set
      const label = ref.label ?? set?.label ?? ref.set
      if (!id || !label) problems.push(`${who}: every choice needs an id and a label.`)
      if (optionIds.has(id)) problems.push(`${who}: choice "${id}" is added twice (give the second one its own id).`)
      optionIds.add(id)
      const choices = normaliseChoices(ref.choices ?? set?.choices)
      if (choices.length === 0) problems.push(`${who}: "${label}" has no choices.`)
      return { id, label, required: (ref.required ?? set?.required) !== false, choices }
    })

    const addonIds = raw.addons ?? catById[raw.category]?.addonIds ?? []
    for (const id of addonIds) {
      if (!addonById[id]) problems.push(`${who}: add-on "${id}" does not exist.`)
    }

    return {
      id: raw.id,
      slug,
      category: raw.category,
      name: raw.name,
      description: raw.description ?? '',
      price: raw.price,
      portion: raw.portion ?? null,
      includes: raw.includes ?? [],
      options,
      addonIds,
      spice: raw.spice ?? 0, // optional fixed heat 0-3 (not needed when the customer chooses)
      tag: raw.tag ?? null, // 'fan-favorite' | 'new' | 'spicy' — only use if it is true
      available: raw.available !== false,
    }
  })

  return {
    categories: cats,
    items,
    addons: addonList,
    byId: Object.fromEntries(items.map(i => [i.id, i])),
    addonById,
    problems,
  }
}

// One readable error for the build / dev overlay.
export function assertValid(menu) {
  if (menu.problems.length === 0) return
  throw new Error(
    `\n\nsrc/data/menu.json has ${menu.problems.length} problem${menu.problems.length > 1 ? 's' : ''}:\n` +
      menu.problems.map(p => `  - ${p}`).join('\n') +
      '\n',
  )
}
