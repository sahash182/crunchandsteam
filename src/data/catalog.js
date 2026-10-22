// The menu as the website uses it: menu.js + photo info from menu-photos/.
// Pages and components import from here, not from menu.js directly.
import photos from 'virtual:menu-photos'
import { menuItems as rawItems, categories } from './menu'
import { slugify } from './slug'

export { categories }

export const PLACEHOLDER_IMAGE = '/images/placeholder-dish.jpg'

export const menuItems = rawItems
  .filter(item => item.available !== false)
  .map(item => {
    const slug = slugify(item.name)
    const photo = photos[slug] ?? { type: 'none' }
    return {
      ...item,
      slug,
      image: photo.thumb ?? PLACEHOLDER_IMAGE,
      imageFull: photo.full ?? PLACEHOLDER_IMAGE,
      imageType: photo.type, // 'real' | 'stock' | 'none'
      imageCredit: photo.credit ?? null,
    }
  })

export const byId = Object.fromEntries(menuItems.map(i => [i.id, i]))

export const signatureDishes = ['fc-1', 'sm-1', 'cb-1'].map(id => byId[id]).filter(Boolean)

// Stand-in photos that need a credit on /credits.
export const photoCredits = menuItems
  .filter(i => i.imageType === 'stock' && i.imageCredit)
  .map(i => ({ dish: i.name, ...i.imageCredit }))
