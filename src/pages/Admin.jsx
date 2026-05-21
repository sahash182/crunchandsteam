import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, LogOut, Clock, CheckCircle, ChefHat, Package, Lock } from 'lucide-react'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-400',  icon: Clock },
  preparing:  { label: 'Preparing',  color: 'bg-blue-100 text-blue-800 border-blue-200',        dot: 'bg-blue-400',    icon: ChefHat },
  ready:      { label: 'Ready',      color: 'bg-green-100 text-green-800 border-green-200',     dot: 'bg-green-400',   icon: Package },
  completed:  { label: 'Completed',  color: 'bg-gray-100 text-gray-500 border-gray-200',        dot: 'bg-gray-300',    icon: CheckCircle },
}

const NEXT_STATUS = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'completed',
}

function OrderCard({ order, adminPassword, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  const nextStatus = NEXT_STATUS[order.status]
  const nextCfg = nextStatus ? STATUS_CONFIG[nextStatus] : null

  const advance = async () => {
    if (!nextStatus) return
    setUpdating(true)
    await fetch('/api/update-order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({ id: order.id, status: nextStatus }),
    })
    onStatusChange(order.id, nextStatus)
    setUpdating(false)
  }

  const time = new Date(order.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(order.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border p-5 shadow-sm ${order.status === 'completed' ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-brand-dark text-base">{order.name}</p>
          <p className="text-xs text-brand-text/50 mt-0.5">{order.phone} · {order.method}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-brand-primary text-lg">${Number(order.total).toFixed(2)}</p>
          <p className="text-xs text-brand-text/40">{date} {time}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-brand-cream rounded-xl p-3 mb-3 space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-brand-text/70">{item.name}{item.size ? ` (${item.size})` : ''}</span>
            <span className="font-semibold text-brand-text">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Status + action */}
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <Icon size={11} />
          {cfg.label}
        </span>

        {nextCfg && (
          <button
            onClick={advance}
            disabled={updating}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${nextCfg.color} hover:opacity-80`}
          >
            {updating ? '…' : `Mark ${nextCfg.label}`}
          </button>
        )}
      </div>

      <p className="text-xs text-brand-text/30 mt-2">#{order.id.slice(0, 8).toUpperCase()}</p>
    </motion.div>
  )
}

export default function Admin() {
  const [password, setPassword]     = useState('')
  const [input, setInput]           = useState('')
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchOrders = useCallback(async (pwd) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/get-orders', {
        headers: { 'x-admin-password': pwd },
      })
      if (res.status === 401) {
        setError('Wrong password')
        setPassword('')
        return
      }
      const data = await res.json()
      setOrders(data)
      setLastRefresh(new Date())
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!password) return
    fetchOrders(password)
    const interval = setInterval(() => fetchOrders(password), 30000)
    return () => clearInterval(interval)
  }, [password, fetchOrders])

  const handleLogin = (e) => {
    e.preventDefault()
    setPassword(input)
  }

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  const activeOrders    = orders.filter(o => o.status !== 'completed')
  const completedOrders = orders.filter(o => o.status === 'completed')

  // ── Login screen ──────────────────────────────────────────────────
  if (!password) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-2xl text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-primary/10 rounded-full text-brand-primary mb-5">
            <Lock size={26} />
          </div>
          <h1 className="font-serif font-bold text-brand-dark text-2xl mb-1">Admin</h1>
          <p className="text-brand-text/50 text-sm mb-6">Crunch & Steam · Order Dashboard</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border border-brand-dark/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3">
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Top bar */}
      <div className="bg-brand-dark px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-serif font-bold text-white text-lg">Crunch & Steam</p>
          <p className="text-white/40 text-xs">Order Dashboard{lastRefresh ? ` · Updated ${lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(password)}
            disabled={loading}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setPassword(''); setOrders([]) }}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Orders',    value: activeOrders.length,    color: 'text-brand-primary' },
            { label: 'Today\'s Orders',  value: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, color: 'text-brand-dark' },
            { label: 'Today\'s Revenue', value: `$${orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).reduce((s, o) => s + Number(o.total), 0).toFixed(2)}`, color: 'text-brand-green' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-brand-dark/5 text-center">
              <p className={`font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-brand-text/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        <h2 className="font-serif font-bold text-brand-dark text-xl mb-4">
          Active Orders {activeOrders.length > 0 && <span className="text-brand-primary">({activeOrders.length})</span>}
        </h2>

        {loading && orders.length === 0 && (
          <div className="text-center py-12 text-brand-text/40">Loading orders…</div>
        )}

        {!loading && activeOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-brand-dark/5">
            <p className="text-brand-text/40 text-sm">No active orders right now.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <AnimatePresence>
            {activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                adminPassword={password}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Completed */}
        {completedOrders.length > 0 && (
          <>
            <h2 className="font-serif font-bold text-brand-dark/40 text-lg mb-4">Completed</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {completedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  adminPassword={password}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
