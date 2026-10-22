# Crunch & Steam website — notes for Claude sessions

React 18 + Vite 5 + Tailwind 3 + framer-motion, deployed on Vercel from GitHub `main`
(sahash182/crunchandsteam, **public repo** — never commit secrets; keys live in Vercel env vars
and the gitignored `.env.local`). Restaurant: Erina Fair, Central Coast NSW (en-AU, AUD).

Owner how-to: `MAINTENANCE.md` — keep it in sync when behaviour changes.

## Single source of truth
- `src/data/menu.js` — the menu (pure data; no image fields). `available: false` hides a dish.
- `menu-photos/{real,stock}/<slug>.jpg` — dish photos. `slug` = `src/data/slug.js::slugify(name)`,
  which must stay identical to CrunchMarket's `crunchmarket/menu/schema.py::slugify`.
- `vite-plugins/menu-data.js` — build plugin: resizes photos (sharp) to
  `/images/menu/{thumb 600,full 1600}/<slug>.jpg`, emits `/menu.json`, exposes
  `virtual:menu-photos`. Dev server serves the same URLs on the fly.
- `src/data/catalog.js` — what pages import (menu + photo URLs + `imageType`). Don't import
  `menu.js` directly from components.
- `src/data/site.js` — social links (empty = hidden), site URL, link-in-bio UTM.

## Consumers of /menu.json
CrunchMarket (C:\CrunchMarket, private repo sahash182/crunchmarket) builds daily social videos
from `https://crunchandsteam.vercel.app/menu.json`. Schema (keep backwards compatible):
`{restaurant, currency, generated_at, categories[{id,label}], items[{id (slug), site_id, name,
description, price, category (label), badges[], spice_level, sizes[], available, image_url
(relative), image_type: real|stock|none, image_credit}]}`.

## Rules
- Stand-in photos must show the "Representative image" label and be credited on `/credits`
  (Australian Consumer Law + CC BY/BY-SA licences).
- `vercel.json` rewrites everything to `index.html`; Vercel serves real files first, so
  `/menu.json` and `/images/...` work.

## Commands
`npm run dev` · `npm run build` (prints photo summary) · `npm run preview`
