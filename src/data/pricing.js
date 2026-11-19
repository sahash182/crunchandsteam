// Prices, GST and order-line checking. Shared by the browser cart and by the payment API,
// which re-prices every order itself — the browser's total is never trusted.
// Menu prices include GST (Australian consumer pricing), so GST is 1/11 of the total.

export const cents = n => Math.round(n * 100)
export const round2 = n => cents(n) / 100
export const money = n => `$${round2(n).toFixed(2)}`
export const gstIncluded = total => Math.round(cents(total) / 11) / 100

// "Choose your wing spice" -> "Wing spice" (compact label for carts, tickets and emails).
export const shortLabel = label => {
  const s = String(label).replace(/^choose (your |a )?/i, '').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Same dish with the same choices = same cart line.
export function lineKey(id, selections = {}, addonIds = []) {
  const sel = Object.keys(selections)
    .sort()
    .map(k => `${k}=${selections[k]}`)
    .join(',')
  return `${id}|${sel}|${[...addonIds].sort().join(',')}`
}

export function missingOptions(item, selections = {}) {
  return item.options.filter(o => o.required && !selections[o.id])
}

// Price one order line: { id, quantity, selections: {optionId: 'Choice'}, addons: ['addon-id'] }.
// Throws an Error with a customer-readable message when the line is not valid.
export function priceLine(menu, line) {
  const quantity = line?.quantity
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new Error('Quantity must be between 1 and 50.')
  }
  const selections = line.selections ?? {}
  const addonIds = line.addons ?? []

  // An add-on bought on its own.
  const standalone = menu.addonById[line.id]
  if (standalone) {
    if (Object.keys(selections).length || addonIds.length) throw new Error(`${standalone.name} has no choices.`)
    return {
      id: standalone.id,
      name: standalone.name,
      quantity,
      unit: round2(standalone.price),
      options: [],
      addons: [],
      total: round2(standalone.price * quantity),
    }
  }

  const item = menu.byId[line.id]
  if (!item || !item.available) throw new Error('An item in your cart is no longer on the menu.')

  const known = new Set(item.options.map(o => o.id))
  for (const k of Object.keys(selections)) {
    if (!known.has(k)) throw new Error(`${item.name}: unknown choice "${k}".`)
  }

  let unit = item.price
  const options = []
  for (const o of item.options) {
    const value = selections[o.id]
    if (!value) {
      if (o.required) throw new Error(`${item.name}: please choose "${o.label}".`)
      continue
    }
    const choice = o.choices.find(c => c.label === value)
    if (!choice) throw new Error(`${item.name}: "${value}" is not a choice for "${o.label}".`)
    unit += choice.price
    options.push({ id: o.id, label: shortLabel(o.label), value: choice.label })
  }

  if (new Set(addonIds).size !== addonIds.length) throw new Error(`${item.name}: an add-on was picked twice.`)
  const addons = addonIds.map(id => {
    if (!item.addonIds.includes(id)) throw new Error(`${item.name}: add-on "${id}" is not available with it.`)
    const a = menu.addonById[id]
    unit += a.price
    return { id: a.id, name: a.name, price: a.price }
  })

  unit = round2(unit)
  return { id: item.id, name: item.name, quantity, unit, options, addons, total: round2(unit * quantity) }
}

export function priceCart(menu, lines) {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error('Your cart is empty.')
  if (lines.length > 50) throw new Error('Too many items in one order.')
  const priced = lines.map(l => priceLine(menu, l))
  return { lines: priced, total: round2(priced.reduce((s, l) => s + l.total, 0)) }
}
