// The checked menu for server code (payment + order APIs). On Vercel this is the menu.json that
// was deployed with the site, so the server prices orders against exactly what customers saw.
import fs from 'node:fs'
import rawMenu from '../src/data/menu.json' with { type: 'json' }
import { buildMenu } from '../src/data/model.js'

const deployed = buildMenu(rawMenu)

export function getMenu() {
  // `npm run dev`: re-read the file so edits made in the admin editor apply straight away.
  if (process.env.MENU_STORE === 'local') {
    return buildMenu(JSON.parse(fs.readFileSync(new URL('../src/data/menu.json', import.meta.url), 'utf8')))
  }
  return deployed
}
