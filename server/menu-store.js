// Where the editable menu lives and how admin edits are saved.
//   production (Vercel)  -> the GitHub repo: one commit per save, Vercel redeploys (~1 min)
//   `npm run dev`        -> files in this checkout (MENU_STORE=local, set by the dev server),
//                           so trying the editor locally can never touch GitHub or production.
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const MENU_PATH = 'src/data/menu.json'
const PHOTO_DIR = 'menu-photos/real'

export class StoreError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
  }
}

const json = menu => JSON.stringify(menu, null, 2) + '\n'

// ── Local files (dev) ───────────────────────────────────────────
const local = {
  name: 'local',
  async read() {
    const text = fs.readFileSync(path.join(process.cwd(), MENU_PATH), 'utf8')
    return { menu: JSON.parse(text), version: createHash('sha1').update(text).digest('hex') }
  },
  async commit({ menu, baseVersion, photos }) {
    const { version } = await this.read()
    if (version !== baseVersion) {
      throw new StoreError('The menu was changed somewhere else since you opened it. Reload and try again.', 409)
    }
    for (const p of photos) {
      const dir = path.join(process.cwd(), PHOTO_DIR)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, `${p.slug}.jpg`), p.buffer)
    }
    fs.writeFileSync(path.join(process.cwd(), MENU_PATH), json(menu))
    return { where: 'this computer (dev mode, nothing was published)' }
  },
}

// ── GitHub (production) ─────────────────────────────────────────
const repo = () => process.env.GITHUB_REPO || 'sahash182/crunchandsteam'
const branch = () => process.env.GITHUB_BRANCH || 'main'

async function gh(pathname, { method = 'GET', body } = {}) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new StoreError('Menu saving is not set up yet: GITHUB_TOKEN is missing in Vercel (see MAINTENANCE.md).', 503)
  }
  const res = await fetch(`https://api.github.com/repos/${repo()}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'crunch-steam-menu-editor',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('GitHub API', method, pathname, res.status, data.message)
    if (res.status === 401 || res.status === 403) {
      throw new StoreError('GitHub rejected the saved token (expired or missing "Contents: read and write" permission).', 502)
    }
    const err = new StoreError(`GitHub error (${res.status}).`, 502)
    err.github = res.status
    throw err
  }
  return data
}

const github = {
  name: 'github',
  async read() {
    const f = await gh(`/contents/${MENU_PATH}?ref=${encodeURIComponent(branch())}`)
    const text = Buffer.from(f.content, 'base64').toString('utf8')
    return { menu: JSON.parse(text), version: f.sha }
  },
  async commit({ menu, baseVersion, photos, message }) {
    const head = (await gh(`/git/ref/heads/${branch()}`)).object.sha
    const headCommit = await gh(`/git/commits/${head}`)

    // Refuse if someone saved a newer menu since this editor loaded.
    const current = await gh(`/contents/${MENU_PATH}?ref=${head}`)
    if (current.sha !== baseVersion) {
      throw new StoreError('The menu was changed somewhere else since you opened it. Reload and try again.', 409)
    }

    const entries = []
    const addBlob = async (filePath, content, encoding) => {
      const blob = await gh('/git/blobs', { method: 'POST', body: { content, encoding } })
      entries.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha })
    }
    await addBlob(MENU_PATH, json(menu), 'utf-8')
    for (const p of photos) await addBlob(`${PHOTO_DIR}/${p.slug}.jpg`, p.buffer.toString('base64'), 'base64')

    const tree = await gh('/git/trees', { method: 'POST', body: { base_tree: headCommit.tree.sha, tree: entries } })
    const commit = await gh('/git/commits', {
      method: 'POST',
      body: { message, tree: tree.sha, parents: [head] },
    })
    try {
      await gh(`/git/refs/heads/${branch()}`, { method: 'PATCH', body: { sha: commit.sha, force: false } })
    } catch (e) {
      if (e.github === 422) {
        throw new StoreError('The site was updated by someone else a moment ago. Reload and try again.', 409)
      }
      throw e
    }
    return { where: 'GitHub', commit: commit.sha }
  },
}

export const getStore = () => (process.env.MENU_STORE === 'local' ? local : github)

// A short, human description of what changed, used as the commit message.
export function summarise(before, after) {
  const lines = []
  const byId = menu => Object.fromEntries((menu.items ?? []).map(i => [i.id, i]))
  const a = byId(before)
  const b = byId(after)
  for (const [id, item] of Object.entries(b)) {
    const old = a[id]
    if (!old) lines.push(`added "${item.name}"`)
    else {
      if (old.price !== item.price) lines.push(`"${item.name}" price $${old.price} -> $${item.price}`)
      if (old.name !== item.name) lines.push(`renamed "${old.name}" -> "${item.name}"`)
      if ((old.available !== false) !== (item.available !== false)) {
        lines.push(`"${item.name}" ${item.available === false ? 'hidden / sold out' : 'back on the menu'}`)
      }
      if (JSON.stringify({ ...old, price: 0, name: '', available: 0 }) !== JSON.stringify({ ...item, price: 0, name: '', available: 0 })) {
        lines.push(`edited "${item.name}"`)
      }
    }
  }
  for (const [id, item] of Object.entries(a)) if (!b[id]) lines.push(`removed "${item.name}"`)
  if (JSON.stringify(before.optionSets) !== JSON.stringify(after.optionSets)) lines.push('edited choice lists')
  if (JSON.stringify(before.addons) !== JSON.stringify(after.addons)) lines.push('edited add-ons')
  if (JSON.stringify(before.categories) !== JSON.stringify(after.categories)) lines.push('edited sections')
  return lines
}
