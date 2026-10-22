// Stable dish id from its name: "Chilli Momo (8pc)" -> "chilli-momo-8pc".
// Used for photo file names and by CrunchMarket — keep in sync with
// crunchmarket/menu/schema.py::slugify.
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
