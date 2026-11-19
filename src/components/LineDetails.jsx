// The choices and add-ons on a cart line, e.g. "Spice: Very Hot" / "+ Extra Fries, Cheese Slice".
export default function LineDetails({ line, className = '' }) {
  const choices = (line.options ?? []).map(o => `${o.label}: ${o.value}`).join(' · ')
  const extras = (line.addons ?? []).map(a => a.name).join(', ')
  if (!choices && !extras) return null
  return (
    <>
      {choices && <p className={className}>{choices}</p>}
      {extras && <p className={className}>+ {extras}</p>}
    </>
  )
}
