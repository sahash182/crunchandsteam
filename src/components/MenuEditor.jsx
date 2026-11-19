import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, ChevronUp, ChevronDown, X, Camera, Save, RotateCcw, AlertTriangle,
  CheckCircle, Loader2, Pencil, Image as ImageIcon,
} from 'lucide-react'
import { buildMenu, uniqueSlug } from '../data/model'
import { money } from '../data/pricing'

// ── small helpers ───────────────────────────────────────────────
const rid = prefix => `${prefix}-${Math.random().toString(36).slice(2, 7)}`
const clone = x => JSON.parse(JSON.stringify(x))
// What gets saved: no editor-only fields.
const clean = d => ({
  categories: d.categories,
  optionSets: d.optionSets,
  addons: d.addons,
  items: d.items.map(({ _new, ...rest }) => rest),
})
const move = (arr, i, d) => {
  const j = i + d
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
const MAX_PHOTO_TOTAL = 3_400_000 // bytes of base64 per save (hosting limit is 4.5 MB)

// Phone photos are 4-10 MB: shrink in the browser before uploading.
async function toJpeg(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  for (const [maxSide, quality] of [[1600, 0.82], [1400, 0.75], [1200, 0.7], [1000, 0.65]]) {
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality))
    if (blob && blob.size <= 800_000) {
      const preview = URL.createObjectURL(blob)
      const data = await new Promise(resolve => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result).split(',')[1])
        fr.readAsDataURL(blob)
      })
      return { data, preview, bytes: data.length }
    }
  }
  throw new Error('That photo is too detailed to shrink enough. Try a different one.')
}

// ── tiny UI pieces ──────────────────────────────────────────────
const inputCls =
  'w-full border border-brand-dark/15 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
const btnGhost =
  'inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border border-brand-dark/15 bg-white hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-text/50 mb-1.5'

function Switch({ on, onChange, labelOn, labelOff }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-full"
    >
      <span className={`relative w-10 h-6 rounded-full transition-colors ${on ? 'bg-brand-green' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      <span className={on ? 'text-brand-green' : 'text-brand-text/50'}>{on ? labelOn : labelOff}</span>
    </button>
  )
}

// Price box that never commits half-typed or invalid values.
function MoneyInput({ value, onChange, className = '', ariaLabel }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const n = Number(text)
  const valid = text.trim() !== '' && Number.isFinite(n) && n >= 0
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 text-sm">$</span>
      <input
        inputMode="decimal"
        aria-label={ariaLabel}
        value={text}
        onChange={e => {
          setText(e.target.value)
          const v = Number(e.target.value)
          if (e.target.value.trim() !== '' && Number.isFinite(v) && v >= 0) onChange(Math.round(v * 100) / 100)
        }}
        onBlur={() => setText(String(value))}
        className={`${inputCls} pl-6 ${valid ? '' : 'border-red-400 focus:border-red-400 focus:ring-red-200'}`}
      />
    </div>
  )
}

// ── main component ──────────────────────────────────────────────
export default function MenuEditor({ password }) {
  const [state, setState] = useState({ status: 'loading' }) // loading | ready | error
  const [draft, setDraft] = useState(null)
  const [base, setBase] = useState(null)
  const [version, setVersion] = useState(null)
  const [store, setStore] = useState('github')
  const [photos, setPhotos] = useState({}) // itemId -> { data, preview, bytes }
  const [view, setView] = useState('dishes') // dishes | choices | addons | sections
  const [editingId, setEditingId] = useState(null)
  const [deployed, setDeployed] = useState(null) // the live /menu.json (for photo info)
  const [save, setSave] = useState({ status: 'idle' }) // idle | saving | waiting | live | error
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/menu-admin', { headers: { 'x-admin-password': password } })
      const data = await res.json()
      if (!res.ok) throw Object.assign(new Error(data.error || 'Could not load the menu'), { status: res.status })
      setDraft(clone(data.menu))
      setBase(clone(data.menu))
      setVersion(data.version)
      setStore(data.store)
      setPhotos({})
      setState({ status: 'ready' })
    } catch (e) {
      setState({ status: 'error', message: e.message })
    }
    fetch('/menu.json', { cache: 'no-store' }).then(r => r.json()).then(setDeployed).catch(() => {})
  }, [password])

  useEffect(() => {
    load()
    return () => clearInterval(pollRef.current)
  }, [load])

  const update = fn => setDraft(d => { const c = clone(d); fn(c); return c })

  const built = useMemo(() => (draft ? buildMenu(clean(draft)) : null), [draft])
  const problems = useMemo(() => {
    if (!draft) return []
    const p = [...built.problems]
    draft.items.forEach(i => {
      if (!String(i.name ?? '').trim()) p.push('A dish has no name yet.')
      else if (!(i.price > 0)) p.push(`"${i.name}": set a price above $0.`)
    })
    if (!draft.items.some(i => i.available !== false)) p.push('At least one dish must be on the menu.')
    return [...new Set(p)]
  }, [draft, built])

  const dirty = draft && (JSON.stringify(clean(draft)) !== JSON.stringify(base) || Object.keys(photos).length > 0)
  const photoBytes = Object.values(photos).reduce((s, p) => s + p.bytes, 0)

  // ── save ──
  const publish = async () => {
    setSave({ status: 'saving' })
    clearInterval(pollRef.current)
    try {
      const menu = clean(draft)
      const slugById = Object.fromEntries(draft.items.map(i => [i.id, i.slug]))
      const res = await fetch('/api/menu-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          menu,
          baseVersion: version,
          photos: Object.entries(photos).map(([id, p]) => ({ slug: slugById[id], data: p.data })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSave({ status: 'error', message: data.error || 'Saving failed', problems: data.problems, conflict: res.status === 409 })
        return
      }
      if (data.unchanged) { setSave({ status: 'idle' }); return }
      const wanted = buildMenu(menu)
      await load()
      setSave({ status: 'waiting', changes: data.changes, where: data.where, since: Date.now() })
      // Is the new menu live yet? Check now, then every 8 seconds.
      const check = async () => {
        try {
          const live = await (await fetch('/menu.json', { cache: 'no-store' })).json()
          const same =
            live.items.length === wanted.items.length &&
            wanted.items.every(w => {
              const l = live.items.find(x => x.site_id === w.id)
              return l && l.price === w.price && l.name === w.name && l.available === w.available
            })
          if (same) {
            clearInterval(pollRef.current)
            setDeployed(live)
            setSave(s => ({ ...s, status: 'live' }))
          }
        } catch { /* keep trying */ }
      }
      check()
      pollRef.current = setInterval(check, 8000)
    } catch (e) {
      setSave({ status: 'error', message: 'Could not reach the server. Check your connection and try again.' })
    }
  }

  const discard = () => {
    if (!confirm('Throw away all unsaved changes?')) return
    setDraft(clone(base))
    setPhotos({})
    setEditingId(null)
  }

  // ── states ──
  if (state.status === 'loading' && !draft) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-brand-text/50 flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Loading the menu…</div>
  }
  if (state.status === 'error') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="font-bold text-red-600 mb-1 flex items-center gap-2"><AlertTriangle size={18} /> Menu editor unavailable</p>
          <p className="text-sm text-brand-text/70">{state.message}</p>
          <button onClick={load} className={`${btnGhost} mt-4`}><RotateCcw size={14} /> Try again</button>
        </div>
      </div>
    )
  }
  if (!draft) return null

  const editing = draft.items.find(i => i.id === editingId)
  const thumbFor = item => {
    if (photos[item.id]) return { src: photos[item.id].preview, kind: 'New (unsaved)' }
    const d = deployed?.items.find(x => x.site_id === item.id)
    if (d && d.image_type !== 'none') {
      return { src: `/images/menu/thumb/${d.id}.jpg?v=${deployed.generated_at}`, kind: d.image_type === 'real' ? 'Real photo' : 'Stand-in' }
    }
    return { src: null, kind: 'No photo' }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
      {/* View switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-5" role="tablist" aria-label="Menu sections">
        {[
          ['dishes', 'Dishes'],
          ['choices', 'Choice lists'],
          ['addons', 'Add-ons'],
          ['sections', 'Sections'],
        ].map(([id, text]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              view === id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-text/70 border-brand-dark/10 hover:border-brand-primary/40'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {store === 'local' && (
        <p className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-3 py-2 mb-5">
          Test mode: you are running on your own computer. Saving changes the files here and does <strong>not</strong> publish anything.
        </p>
      )}

      {/* ── Dishes ── */}
      {view === 'dishes' && (
        <div className="space-y-8">
          {draft.categories.map(cat => {
            const items = draft.items.filter(i => i.category === cat.id)
            return (
              <section key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif font-bold text-brand-dark text-xl">{cat.label}</h2>
                  <button
                    className={btnGhost}
                    onClick={() => {
                      const id = rid('dish')
                      update(d => d.items.push({ id, slug: id, category: cat.id, name: '', description: '', price: 0, _new: true }))
                      setEditingId(id)
                    }}
                  >
                    <Plus size={15} /> Add dish
                  </button>
                </div>
                {items.length === 0 && <p className="text-sm text-brand-text/40 bg-white rounded-xl border border-dashed border-brand-dark/15 px-4 py-5">No dishes in this section yet.</p>}
                <div className="space-y-2">
                  {items.map(item => {
                    const t = thumbFor(item)
                    const off = item.available === false
                    return (
                      <div key={item.id} className={`bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-3 flex flex-wrap items-center gap-3 ${off ? 'opacity-60' : ''}`}>
                        <button onClick={() => setEditingId(item.id)} className="relative w-16 h-16 rounded-xl bg-brand-cream overflow-hidden shrink-0 flex items-center justify-center text-brand-text/30" aria-label={`Edit ${item.name || 'new dish'}`}>
                          {t.src ? <img src={t.src} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={22} />}
                        </button>
                        <div className="flex-1 min-w-[10rem]">
                          <p className="font-semibold text-brand-text leading-tight">{item.name || <span className="text-red-500">Unnamed dish</span>}</p>
                          <p className="text-xs text-brand-text/50 mt-0.5">
                            {[item.portion, (item.options ?? []).length ? `${item.options.length} choice${item.options.length > 1 ? 's' : ''}` : null, t.kind].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <MoneyInput value={item.price} ariaLabel={`Price of ${item.name}`} className="w-24" onChange={v => update(d => { d.items.find(i => i.id === item.id).price = v })} />
                        <Switch on={!off} labelOn="On menu" labelOff="Sold out" onChange={v => update(d => { d.items.find(i => i.id === item.id).available = v })} />
                        <button onClick={() => setEditingId(item.id)} className={btnGhost}><Pencil size={14} /> Edit</button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* ── Choice lists ── */}
      {view === 'choices' && (
        <div className="space-y-4">
          <p className="text-sm text-brand-text/60">Choice lists are what customers pick from, such as spice levels or momo styles. A change here applies to every dish that uses the list.</p>
          {Object.entries(draft.optionSets).map(([key, set]) => {
            const usedBy = draft.items.filter(i => (i.options ?? []).some(o => o.set === key))
            return (
              <div key={key} className="bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input className={`${inputCls} font-semibold`} aria-label="List name" value={set.label} onChange={e => update(d => { d.optionSets[key].label = e.target.value })} />
                  <button
                    className={btnGhost}
                    disabled={usedBy.length > 0}
                    title={usedBy.length ? `Used by ${usedBy.length} dish(es): remove it from them first` : 'Delete this list'}
                    onClick={() => confirm(`Delete "${set.label}"?`) && update(d => { delete d.optionSets[key] })}
                    aria-label={`Delete ${set.label}`}
                  ><Trash2 size={14} /></button>
                </div>
                <p className="text-xs text-brand-text/40 mb-2">{usedBy.length ? `Used by: ${usedBy.map(i => i.name).join(', ')}` : 'Not used by any dish yet.'}</p>
                <div className="space-y-2">
                  {set.choices.map((c, i) => {
                    const obj = typeof c === 'string' ? { label: c, price: 0 } : c
                    const setChoice = patch => update(d => { d.optionSets[key].choices[i] = { label: obj.label, price: obj.price ?? 0, ...patch } })
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input className={inputCls} aria-label="Choice name" value={obj.label} onChange={e => setChoice({ label: e.target.value })} />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-brand-text/40">extra</span>
                          <MoneyInput value={obj.price ?? 0} ariaLabel={`Extra price for ${obj.label}`} className="w-20" onChange={v => setChoice({ price: v })} />
                        </div>
                        <button className={btnGhost} aria-label="Move up" disabled={i === 0} onClick={() => update(d => move(d.optionSets[key].choices, i, -1))}><ChevronUp size={14} /></button>
                        <button className={btnGhost} aria-label="Move down" disabled={i === set.choices.length - 1} onClick={() => update(d => move(d.optionSets[key].choices, i, 1))}><ChevronDown size={14} /></button>
                        <button className={btnGhost} aria-label="Remove choice" onClick={() => update(d => d.optionSets[key].choices.splice(i, 1))}><X size={14} /></button>
                      </div>
                    )
                  })}
                </div>
                <button className={`${btnGhost} mt-3`} onClick={() => update(d => d.optionSets[key].choices.push({ label: '', price: 0 }))}><Plus size={14} /> Add choice</button>
              </div>
            )
          })}
          <button className={btnGhost} onClick={() => update(d => { d.optionSets[rid('list')] = { label: 'New choice list', choices: [{ label: '', price: 0 }] } })}><Plus size={14} /> New choice list</button>
        </div>
      )}

      {/* ── Add-ons ── */}
      {view === 'addons' && (
        <div className="space-y-3">
          <p className="text-sm text-brand-text/60">Extras customers can add to a dish (or buy on their own). Choose which dishes offer them in the dish editor or under Sections.</p>
          {draft.addons.map((a, i) => (
            <div key={a.id} className="bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-3 flex items-center gap-2">
              <input className={inputCls} aria-label="Add-on name" value={a.name} onChange={e => update(d => { d.addons[i].name = e.target.value })} />
              <MoneyInput value={a.price} ariaLabel={`Price of ${a.name}`} className="w-24 shrink-0" onChange={v => update(d => { d.addons[i].price = v })} />
              <button className={btnGhost} aria-label={`Remove ${a.name}`} onClick={() => confirm(`Remove "${a.name}"? It will disappear from every dish.`) && update(d => {
                d.addons.splice(i, 1)
                d.categories.forEach(c => { c.addons = (c.addons ?? []).filter(x => x !== a.id) })
                d.items.forEach(it => { if (it.addons) it.addons = it.addons.filter(x => x !== a.id) })
              })}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className={btnGhost} onClick={() => update(d => d.addons.push({ id: rid('addon'), name: '', price: 0 }))}><Plus size={14} /> Add an add-on</button>
        </div>
      )}

      {/* ── Sections ── */}
      {view === 'sections' && (
        <div className="space-y-3">
          <p className="text-sm text-brand-text/60">Sections are the headings on the menu page. The add-ons ticked here are offered on every dish in the section.</p>
          {draft.categories.map((c, i) => {
            const count = draft.items.filter(it => it.category === c.id).length
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-brand-dark/5 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} font-semibold`} aria-label="Section name" value={c.label} onChange={e => update(d => { d.categories[i].label = e.target.value })} />
                  <button className={btnGhost} aria-label="Move up" disabled={i === 0} onClick={() => update(d => move(d.categories, i, -1))}><ChevronUp size={14} /></button>
                  <button className={btnGhost} aria-label="Move down" disabled={i === draft.categories.length - 1} onClick={() => update(d => move(d.categories, i, 1))}><ChevronDown size={14} /></button>
                  <button className={btnGhost} disabled={count > 0} title={count ? 'Move or delete its dishes first' : 'Delete this section'} aria-label={`Delete ${c.label}`}
                    onClick={() => confirm(`Delete the section "${c.label}"?`) && update(d => d.categories.splice(i, 1))}><Trash2 size={14} /></button>
                </div>
                <div>
                  <label className={label}>Short line under the heading (optional)</label>
                  <input className={inputCls} value={c.blurb ?? ''} onChange={e => update(d => { d.categories[i].blurb = e.target.value })} />
                </div>
                <div>
                  <label className={label}>Add-ons offered on these dishes</label>
                  <div className="flex flex-wrap gap-2">
                    {draft.addons.map(a => {
                      const on = (c.addons ?? []).includes(a.id)
                      return (
                        <button key={a.id} type="button" role="checkbox" aria-checked={on}
                          onClick={() => update(d => { const cc = d.categories[i]; cc.addons = on ? cc.addons.filter(x => x !== a.id) : [...(cc.addons ?? []), a.id] })}
                          className={`px-3 py-1.5 rounded-full text-sm border ${on ? 'bg-brand-primary text-white border-brand-primary' : 'border-brand-dark/15 text-brand-text/70'}`}>
                          {a.name || 'Unnamed'}
                        </button>
                      )
                    })}
                    {draft.addons.length === 0 && <span className="text-xs text-brand-text/40">No add-ons yet.</span>}
                  </div>
                </div>
              </div>
            )
          })}
          <button className={btnGhost} onClick={() => update(d => d.categories.push({ id: rid('sec'), label: 'New section', blurb: '', addons: [] }))}><Plus size={14} /> Add section</button>
        </div>
      )}

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-brand-dark/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-2">
          {problems.length > 0 && dirty && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
              <p className="font-bold mb-1 flex items-center gap-1"><AlertTriangle size={13} /> Fix before saving:</p>
              <ul className="list-disc ml-4 space-y-0.5">{problems.slice(0, 5).map(p => <li key={p}>{p}</li>)}{problems.length > 5 && <li>…and {problems.length - 5} more</li>}</ul>
            </div>
          )}
          {save.status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
              <p className="font-bold">{save.message}</p>
              {save.problems?.length > 0 && <ul className="list-disc ml-4 mt-1">{save.problems.map(p => <li key={p}>{p}</li>)}</ul>}
              {save.conflict && <button onClick={() => { setSave({ status: 'idle' }); load() }} className="underline font-semibold mt-1">Reload the latest menu (your unsaved edits will be lost)</button>}
            </div>
          )}
          {(save.status === 'waiting' || save.status === 'live') && (
            <div className={`text-xs rounded-xl px-3 py-2 border flex items-start gap-2 ${save.status === 'live' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              {save.status === 'live' ? <CheckCircle size={15} className="shrink-0 mt-0.5" /> : <Loader2 size={15} className="animate-spin shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{save.status === 'live' ? 'Live on the website now.' : store === 'local' ? 'Saved on this computer.' : 'Saved. The website is updating (about a minute)…'}</p>
                {save.changes?.length > 0 && <p className="opacity-80">{save.changes.slice(0, 4).join(' · ')}{save.changes.length > 4 ? ` · +${save.changes.length - 4} more` : ''}</p>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <p className="text-sm text-brand-text/60 flex-1">
              {dirty ? <span className="font-semibold text-brand-text">You have unsaved changes{Object.keys(photos).length ? ` (${Object.keys(photos).length} new photo${Object.keys(photos).length > 1 ? 's' : ''})` : ''}</span> : 'No unsaved changes'}
            </p>
            <button onClick={discard} disabled={!dirty || save.status === 'saving'} className={btnGhost}><RotateCcw size={14} /> Discard</button>
            <button
              onClick={publish}
              disabled={!dirty || problems.length > 0 || save.status === 'saving' || photoBytes > MAX_PHOTO_TOTAL}
              className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {save.status === 'saving' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {save.status === 'saving' ? 'Saving…' : store === 'local' ? 'Save (test mode)' : 'Save & publish'}
            </button>
          </div>
          {photoBytes > MAX_PHOTO_TOTAL && <p className="text-xs text-red-600">Too many photos for one save. Save these first, then add the rest.</p>}
        </div>
      </div>

      {/* ── Dish drawer ── */}
      <AnimatePresence>
        {editing && (
          <DishDrawer
            key={editing.id}
            item={editing}
            draft={draft}
            thumb={thumbFor(editing)}
            pendingPhoto={photos[editing.id]}
            update={update}
            setPhoto={p => setPhotos(ph => { const n = { ...ph }; if (p) n[editing.id] = p; else delete n[editing.id]; return n })}
            onClose={() => {
              if (editing._new && !editing.name.trim()) update(d => { d.items = d.items.filter(i => i.id !== editing.id) })
              setEditingId(null)
            }}
            onDelete={() => { update(d => { d.items = d.items.filter(i => i.id !== editing.id) }); setPhotos(ph => { const n = { ...ph }; delete n[editing.id]; return n }); setEditingId(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── one dish ────────────────────────────────────────────────────
function DishDrawer({ item, draft, thumb, pendingPhoto, update, setPhoto, onClose, onDelete }) {
  const [photoError, setPhotoError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const category = draft.categories.find(c => c.id === item.category)
  const set = patch => update(d => Object.assign(d.items.find(i => i.id === item.id), patch))

  const setName = name =>
    update(d => {
      const it = d.items.find(i => i.id === item.id)
      it.name = name
      // A brand-new dish picks its photo/video id from its first name; renames later never change it.
      if (it._new) it.slug = uniqueSlug(name, new Set(d.items.filter(x => x.id !== it.id).map(x => x.slug)))
    })

  const refsOf = key => (item.options ?? []).filter(o => o.set === key)
  const toggleSet = (key, on) =>
    update(d => {
      const it = d.items.find(i => i.id === item.id)
      it.options = (it.options ?? []).filter(o => o.set !== key)
      if (on) it.options.push({ set: key })
    })

  const customAddons = Array.isArray(item.addons)
  const effectiveAddons = customAddons ? item.addons : category?.addons ?? []

  const onFile = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setPhotoError(null)
    try {
      setPhoto(await toJpeg(file))
    } catch (err) {
      setPhotoError(err.message || 'Could not read that photo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 bg-black/50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        role="dialog" aria-modal="true" aria-label="Edit dish"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-brand-cream w-full max-w-lg h-full overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-brand-dark/10 px-5 py-3 flex items-center justify-between">
          <h3 className="font-serif font-bold text-brand-dark text-lg">{item._new && !item.name ? 'New dish' : item.name || 'Edit dish'}</h3>
          <button onClick={onClose} className={btnGhost}>Done</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className={label} htmlFor="d-name">Name</label>
            <input id="d-name" className={inputCls} value={item.name} onChange={e => setName(e.target.value)} placeholder="e.g. Chilli Momo" autoFocus={item._new} />
            {!item._new && <p className="text-[11px] text-brand-text/40 mt-1">Renaming is safe: the photo and videos stay linked.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Price (incl. GST)</label>
              <MoneyInput value={item.price} ariaLabel="Price" onChange={v => set({ price: v })} />
            </div>
            <div>
              <label className={label} htmlFor="d-portion">Portion (optional)</label>
              <input id="d-portion" className={inputCls} value={item.portion ?? ''} onChange={e => set({ portion: e.target.value || undefined })} placeholder="e.g. 4 pcs" />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="d-cat">Section</label>
            <select id="d-cat" className={inputCls} value={item.category} onChange={e => set({ category: e.target.value })}>
              {draft.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="d-desc">Description</label>
            <textarea id="d-desc" rows={3} className={inputCls} value={item.description ?? ''} onChange={e => set({ description: e.target.value })} />
            <p className="text-[11px] text-brand-text/40 mt-1">Only facts you can stand behind. Social videos and ads are written from this text.</p>
          </div>

          <div>
            <label className={label} htmlFor="d-inc">What is included (optional, one per line)</label>
            <textarea id="d-inc" rows={2} className={inputCls} value={(item.includes ?? []).join('\n')} onChange={e => { const l = e.target.value.split('\n').filter(x => x.trim()); set({ includes: l.length ? l : undefined }) }} placeholder={'e.g.\n12 pcs bucket wings\nFries'} />
          </div>

          <div>
            <label className={label}>Customer must choose</label>
            <div className="space-y-2">
              {Object.entries(draft.optionSets).map(([key, s]) => {
                const refs = refsOf(key)
                const on = refs.length > 0
                return (
                  <button key={key} type="button" role="checkbox" aria-checked={on} onClick={() => toggleSet(key, !on)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${on ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-dark/15 bg-white'}`}>
                    <span className="font-semibold text-brand-text">{on && refs[0].label ? refs[0].label : s.label}{refs.length > 1 ? ` (×${refs.length})` : ''}</span>
                    <span className="block text-xs text-brand-text/50 mt-0.5">{s.choices.map(c => (typeof c === 'string' ? c : c.label)).join(', ')}</span>
                  </button>
                )
              })}
              {Object.keys(draft.optionSets).length === 0 && <p className="text-xs text-brand-text/40">No choice lists yet. Create one under "Choice lists".</p>}
            </div>
          </div>

          <div>
            <label className={label}>Add-ons offered</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => set({ addons: undefined })} className={`px-3 py-1.5 rounded-full text-sm border ${!customAddons ? 'bg-brand-primary text-white border-brand-primary' : 'border-brand-dark/15 bg-white'}`}>Section default</button>
              <button type="button" onClick={() => set({ addons: [...effectiveAddons] })} className={`px-3 py-1.5 rounded-full text-sm border ${customAddons ? 'bg-brand-primary text-white border-brand-primary' : 'border-brand-dark/15 bg-white'}`}>Custom</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.addons.map(a => {
                const on = effectiveAddons.includes(a.id)
                return (
                  <button key={a.id} type="button" role="checkbox" aria-checked={on} disabled={!customAddons}
                    onClick={() => set({ addons: on ? item.addons.filter(x => x !== a.id) : [...item.addons, a.id] })}
                    className={`px-3 py-1.5 rounded-full text-sm border disabled:cursor-default ${on ? (customAddons ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/30') : 'border-brand-dark/15 text-brand-text/50 bg-white'}`}>
                    {a.name || 'Unnamed'} · {money(a.price)}
                  </button>
                )
              })}
              {effectiveAddons.length === 0 && <span className="text-xs text-brand-text/40">None offered.</span>}
            </div>
          </div>

          <div>
            <label className={label}>Photo</label>
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-brand-dark/5 p-3">
              <div className="w-24 h-24 rounded-xl bg-brand-cream overflow-hidden flex items-center justify-center text-brand-text/30 shrink-0">
                {pendingPhoto ? <img src={pendingPhoto.preview} alt="" className="w-full h-full object-cover" /> : thumb.src ? <img src={thumb.src} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={28} />}
              </div>
              <div className="space-y-2 min-w-0">
                <p className="text-xs font-semibold text-brand-text/70">{pendingPhoto ? 'New photo (saved when you press Save)' : thumb.kind}</p>
                <label className={`${btnGhost} cursor-pointer ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {thumb.src || pendingPhoto ? 'Replace photo' : 'Upload photo'}
                  <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
                </label>
                {pendingPhoto && <button className="block text-xs underline text-brand-text/50" onClick={() => setPhoto(null)}>Remove new photo</button>}
                {photoError && <p className="text-xs text-red-600">{photoError}</p>}
              </div>
            </div>
            <p className="text-[11px] text-brand-text/40 mt-1">Use a real photo of your own dish: bright light, close up, food filling the frame. It is resized for you.</p>
          </div>

          <div className="pt-2 border-t border-brand-dark/10">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="text-sm font-semibold text-red-600 inline-flex items-center gap-1.5"><Trash2 size={14} /> Delete this dish</button>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-red-700">Delete "{item.name || 'this dish'}" for good?</span>
                <button onClick={onDelete} className="font-bold text-white bg-red-600 rounded-xl px-3 py-1.5">Yes, delete</button>
                <button onClick={() => setConfirmDelete(false)} className="underline">Cancel</button>
              </div>
            )}
            <p className="text-[11px] text-brand-text/40 mt-2">Not selling it for a while? Use the "On menu" switch instead, so you can bring it back later.</p>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  )
}
