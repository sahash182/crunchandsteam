// The menu as the website uses it: menu.json (checked by model.js) + photo info from menu-photos/.
// Pages and components import from here, not from menu.json directly.
import photos from 'virtual:menu-photos'
import rawMenu from './menu.json'
import { buildMenu } from './model'

// The checked menu (also what pricing.js prices orders against). The build plugin has
// already failed with a readable message if menu.json has problems.
export const menu = buildMenu(rawMenu)

export const categories = menu.categories
export const addons = menu.addons
export const addonById = menu.addonById

export const PLACEHOLDER_IMAGE = '/images/placeholder-dish.jpg'

export const menuItems = menu.items
  .filter(item => item.available)
  .map(item => {
    const photo = photos[item.slug] ?? { type: 'none' }
    return {
      ...item,
      image: photo.thumb ?? PLACEHOLDER_IMAGE,
      imageFull: photo.full ?? PLACEHOLDER_IMAGE,
      imageType: photo.type, // 'real' | 'stock' | 'none'
      imageCredit: photo.credit ?? null,
    }
  })

export const byId = Object.fromEntries(menuItems.map(i => [i.id, i]))

// Dishes featured on the home page (dish ids from menu.json).
export const signatureDishes = ['fc-1', 'mo-3', 'cb-1'].map(id => byId[id]).filter(Boolean)

// Stand-in photos that need a credit on /credits.
export const photoCredits = menuItems
  .filter(i => i.imageType === 'stock' && i.imageCredit)
  .map(i => ({ dish: i.name, ...i.imageCredit }))
