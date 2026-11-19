# Crunch & Steam website — notes for Claude sessions

React 18 + Vite 5 + Tailwind 3 + framer-motion, deployed on Vercel from GitHub `main`
(sahash182/crunchandsteam, **public repo** — never commit secrets; keys live in Vercel env vars
and the gitignored `.env.local`). Restaurant: Erina Fair, Central Coast NSW (en-AU, AUD).

Owner how-to: `MAINTENANCE.md` — keep it in sync when behaviour changes.

## Single source of truth: the menu
- `src/data/menu.json` — the menu: `{categories, optionSets, addons, items}`. Edited by
  restaurant staff in `/admin` → Menu (saved as a git commit), or by hand. **Prices are AUD and
  include GST.** Dishes reference reusable choice lists (`options: [{set:'spice'}]`, optional
  `id`/`label` overrides) and get add-ons from their category unless `addons` overrides.
  `available: false` hides a dish everywhere. Each dish has a **stored `slug`** (its photo/video
  id, set once from the name; renaming never changes it).
- `src/data/model.js` — `buildMenu()` validates + normalises menu.json (plain-English
  `problems`); `assertValid()` fails the build. Pure JS, `.js` import extensions, no browser APIs.
- `src/data/pricing.js` — `priceLine/priceCart`, GST (`gstIncluded` = total/11), `lineKey`.
  Shared by the cart **and the payment API, which re-prices every order itself** (the browser
  never sends a price). Same file for both = cart and charge cannot disagree.
- `menu-photos/{real,stock}/<slug>.jpg` — dish photos (real wins). Stock credits live in
  `menu-photos/stock/credits.json` keyed by slug.
- `vite-plugins/menu-data.js` — build plugin: validates the menu, resizes photos (sharp) to
  `/images/menu/{thumb 600,full 1600}/<slug>.jpg`, emits `/menu.json`, exposes
  `virtual:menu-photos`. Dev server serves the same URLs on the fly.
- `src/data/catalog.js` — what pages import (menu + photo URLs + `imageType`). Don't import
  `menu.json` directly from components.
- `src/data/site.js` — social links (empty = hidden), site URL, `showReviews` switch (off until
  there are real reviews; `testimonials.js` is sample content), link-in-bio UTM.

## Server side (Vercel functions in `api/`, shared code in `server/`)
- `create-payment-intent` — prices `lines` from the menu, creates the Stripe PaymentIntent.
- `save-order` — only saves if Stripe says the payment succeeded; idempotent per payment;
  items/total come from server + Stripe. If Supabase is down it still emails the kitchen
  (subject "NOT SAVED").
- `menu-admin` (GET) / `menu-save` (POST) — the staff menu editor API (`x-admin-password`).
  `server/menu-store.js`: **GitHub** in production (one commit per save via the Git Data API,
  only `src/data/menu.json` + `menu-photos/real/<slug>.jpg` can be written; needs
  `GITHUB_TOKEN` in Vercel) and **local files** when `MENU_STORE=local`.
- `get-orders`, `update-order` — order dashboard. `server/auth.js` = constant-time password check.
- `npm run dev` mounts `api/*` via `vite-plugins/dev-api.js` (reads `.env.local`, sets
  `MENU_STORE=local`), so checkout, admin and the menu editor work on localhost and **saving in
  the editor locally edits files in this folder, never GitHub**. API handlers are re-imported on
  change; edits to `src/data/model.js`/`pricing.js` need a dev-server restart.
  Local test password: put `ADMIN_PASSWORD=...` in `.env.development.local` (gitignored).

## Consumers of /menu.json
CrunchMarket (C:\CrunchMarket, private repo sahash182/crunchmarket) builds daily social videos
from `https://crunchandsteam.vercel.app/menu.json`. Schema (keep backwards compatible —
**only ever add fields**): `{restaurant, currency, prices_include_gst, generated_at,
categories[{id,label,blurb}], items[{id (slug), site_id, name, description, price (base),
category (label), badges[], spice_level (0 when the customer chooses), sizes[] (always empty),
available, image_url (relative), image_type: real|stock|none, image_credit, portion, includes[],
options[{id,label,required,choices[{label,price}]}] (id 'spice' = heat levels), addon_ids[]}],
addons[{id,name,price}]}`. Add-ons are deliberately **not** in `items` so videos never feature
"Extra Sauce". CrunchMarket reads `id,name,description,price,category,badges,spice_level,
available,image_*`; it ignores the rest. It matches on **category labels** (`config/calendar.yaml`
`prefer_categories`, `shotlist.py` keywords `steam`/`combo`/`drink`), so renaming a category in
the menu needs a matching edit there.

## Rules
- Stand-in photos must show the "Representative image" label and be credited on `/credits`
  (Australian Consumer Law + CC BY/BY-SA licences). Descriptions: plain facts only (videos and
  ads are written from them). No invented claims, awards, reviews or popularity badges.
- Prices include GST; checkout never adds GST on top. Show "Includes GST of $x".
- `vercel.json` rewrites everything to `index.html`; Vercel serves real files first, so
  `/menu.json` and `/images/...` work. `/api/*` is passed through.

## Commands
`npm run dev` (site + API on :5173) · `npm run build` (validates the menu, prints photo summary)
· `npm run preview`
