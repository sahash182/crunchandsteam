// `npm run dev` only: serves the files in /api the way Vercel does, so checkout, the admin
// orders page and the menu editor all work on http://localhost:5173.
//   - secrets come from .env.local (never committed)
//   - MENU_STORE=local makes the menu editor save to THIS folder instead of GitHub, so trying
//     it locally can never publish anything
// Not part of the production build (apply: 'serve').
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const MAX_BODY = 8 * 1024 * 1024

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', c => {
      size += c.length
      if (size > MAX_BODY) {
        reject(new Error('Request too large'))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default function devApi() {
  return {
    name: 'crunch-dev-api',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root
      for (const [k, v] of Object.entries(loadEnv(server.config.mode, root, ''))) {
        if (process.env[k] === undefined) process.env[k] = v
      }
      process.env.MENU_STORE = 'local'

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const m = url.pathname.match(/^\/api\/([a-z0-9-]+)$/)
        if (!m) return next()
        const file = path.join(root, 'api', `${m[1]}.js`)
        if (!fs.existsSync(file)) return next()

        try {
          const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await readBody(req)
          req.body = raw && (req.headers['content-type'] ?? '').includes('json') ? JSON.parse(raw) : raw
          req.query = Object.fromEntries(url.searchParams)
          res.status = code => {
            res.statusCode = code
            return res
          }
          res.json = obj => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
            return res
          }
          const mod = await import(pathToFileURL(file).href + `?t=${fs.statSync(file).mtimeMs}`)
          await mod.default(req, res)
        } catch (e) {
          console.error(`[dev-api] /api/${m[1]} failed:`, e)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error (see the dev server console)' }))
          }
        }
      })
    },
  }
}
