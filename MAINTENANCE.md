# Crunch & Steam website — Maintenance Guide

Live site: https://crunchandsteam.vercel.app · Code: github.com/sahash182/crunchandsteam
Every push to `main` on GitHub is deployed automatically by Vercel (check Vercel → Deployments).

> This site also feeds the daily social videos: CrunchMarket reads
> https://crunchandsteam.vercel.app/menu.json. Change the menu or a photo **here** and both
> the website and the videos update after the next deploy.

---

## Changing the menu (no code): `/admin` → Menu

Go to `https://crunchandsteam.vercel.app/admin`, sign in, open the **Menu** tab.

| I want to… | Do this |
|---|---|
| **Change a price** | Type the new price in the box on the dish's row |
| **Mark a dish sold out / bring it back** | Flip the **On menu / Sold out** switch on its row |
| **Edit a name, description, portion, section** | **Edit** on the dish |
| **Add a dish** | **Add dish** in the right section → name, price (above $0), then **Done** |
| **Delete a dish** | **Edit** → **Delete this dish** (or just switch it off to keep it for later) |
| **Change what customers must choose** (spice, style, drink…) | In the dish: tick the choice lists under **Customer must choose** |
| **Change spice levels / styles / drink options** | **Choice lists** tab. A change applies to every dish using the list. A choice can have an extra price |
| **Change add-ons (Extra Fries…) or their prices** | **Add-ons** tab. Which dishes offer them: **Sections** tab (per section) or **Edit** a dish → **Add-ons offered** |
| **Rename / reorder sections** | **Sections** tab |
| **Add a real photo** | **Edit** the dish → **Upload photo** (straight from your phone; it is resized for you) |

Then press **Save & publish** at the bottom. The site updates in about a minute; the bar tells you
when it is **live**. The editor refuses to save anything that would break the menu and tells you
why in plain English (e.g. "set a price above $0"). Every save is a commit in GitHub, so
anything can be undone (GitHub → the repo → History).

Good to know:
- **Prices include GST.** Checkout does not add GST on top.
- Descriptions should be plain facts. Social videos and ads are written from them, so don't
  claim anything you can't stand behind (ingredients, awards, "best", allergens).
- Renaming a dish is safe: its photo and its link to the videos don't change.
- "Sold out" takes about a minute to reach the site (it is a normal deploy).

### One-time setup so saving works on the live site

Saving writes to GitHub, so Vercel needs a key (the editor says "Menu saving is not set up yet"
until this is done):

1. GitHub → your avatar → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Repository access: Only select repositories → crunchandsteam.**
3. **Permissions → Repository permissions → Contents: Read and write.** (Nothing else.)
4. Set an expiry (e.g. 1 year; put a reminder in your calendar), generate, copy the token.
5. Vercel → your project → **Settings → Environment Variables** → add `GITHUB_TOKEN` = the
   token (all environments) → **Redeploy**.

The admin password (`ADMIN_PASSWORD`) now protects both orders **and** the ability to change the
live menu. Make it long and unique, and change it in Vercel if a staff member leaves.

## Other changes (needs the code)

| I want to… | Do this |
|---|---|
| Change the menu by hand | Edit `src/data/menu.json` (same data the editor writes) |
| Add Instagram / Facebook / TikTok / YouTube | Fill in the links in `src/data/site.js`: icons appear automatically |
| Show customer reviews on the home page | Replace `src/data/testimonials.js` with **real** reviews, then set `showReviews: true` in `src/data/site.js` |
| Change address, phone, hours | `src/data/locations.js` |
| Change the link-in-bio page | Buttons come from `site.js` + `locations.js`; page is `src/pages/Links.jsx` |
| Change the share preview (title/description/image) | `index.html` (og: tags) and `public/og-image.jpg` (1200×630) |

After any code change:
```bash
npm run build      # must finish without errors; it also checks the menu and prints a photo summary
git add -A
git commit -m "Describe the change"
git push           # Vercel deploys in ~1 minute
```

## Photos

Easiest: upload in the editor (above). By hand, one folder, no resizing:

| Folder | What goes there | Shown as |
|---|---|---|
| `menu-photos/real/<dish-id>.jpg` | **Your own photos** (`.jpg`, `.jpeg`, `.png` or `.webp`, any size, straight off the phone) | Normal photo; publishable in social videos |
| `menu-photos/stock/<dish-id>.jpg` | Representative stand-ins until real photos exist (licences in `menu-photos/stock/credits.json`) | Small "Representative image" label + listed on `/credits` |
| neither | — | Branded "Photo coming soon" image |

- A real photo always wins over a stand-in. You can delete the stand-in once the real one is in.
- **Dish id** = the dish's `slug` in `src/data/menu.json` (e.g. `crunch-burger`). It is set when the
  dish is created and never changes. The full list is in
  https://crunchandsteam.vercel.app/menu.json (`"id"`), or run `npm run build` and read the summary.
- The build makes two sizes automatically: 600 px for the website, 1600 px for the videos.
- Good photos: bright natural light, close-up, food fills the frame, no people's faces without consent.

## Pages

| URL | File |
|---|---|
| `/` | `src/pages/Home.jsx` (category tiles use dishes `fc-1`, `mo-3`, `bg-1`, `cb-1`; signature row = `fc-1`, `mo-3`, `cb-1`, set in `src/data/catalog.js`) |
| `/menu` | `src/pages/Menu.jsx` + `src/components/MenuCard.jsx` + `OrderModal.jsx` |
| `/links` | `src/pages/Links.jsx`: put this URL in your Instagram/TikTok bio |
| `/credits` | `src/pages/Credits.jsx`: automatic list of stand-in photo licences |
| `/menu.json` | generated by `vite-plugins/menu-data.js` (don't edit by hand) |
| `/order`, `/admin`, `api/*` | ordering, Stripe, Supabase, the order dashboard and the menu editor (keys in Vercel → Settings → Environment Variables) |

## Running locally

```bash
npm install        # first time
npm run dev        # http://localhost:5173: site AND api, updates as you edit
npm run build && npm run preview   # check the production build at http://localhost:4173
```

Locally, `/admin` → Menu runs in **test mode**: saving edits the files in this folder and
never touches GitHub or the live site. Keys come from `.env.local` (copy `.env.local.example`).
To use a different admin password locally, put `ADMIN_PASSWORD=...` in `.env.development.local`.
Placing an order locally uses Stripe **test** keys but your real database and email.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Menu saving is not set up yet" in the editor | Add `GITHUB_TOKEN` in Vercel (see above) and redeploy |
| "GitHub rejected the saved token" | The token expired or lacks *Contents: Read and write*: make a new one and update it in Vercel |
| "The menu was changed somewhere else" | Someone else saved first: press the reload link, redo your change |
| Orders tab says "Orders could not be loaded" | The Supabase project is probably paused (free projects pause after a week unused): supabase.com/dashboard → your project → **Restore** |
| An email arrives with "NOT SAVED" | The customer paid but the database was down. Make the order from the email, then restore Supabase |
| Photo not showing | The file name must match the dish id exactly and be in `menu-photos/real/`; rebuild |
| Build fails after editing `menu.json` | The error lists each problem in plain English with the dish name |
| Dish missing on site | It is switched off ("Sold out"), or its section was removed |
| Site not updated after a save/push | Vercel → Deployments: check the latest build log |
| Social videos still show old menu | CrunchMarket reads `/menu.json` on its next run; check the deploy finished |
