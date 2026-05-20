import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Minus, Plus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartSidebar() {
  const { isOpen, items, total, dispatch } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-dark/10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-brand-primary" />
                <h2 className="font-serif font-bold text-brand-dark text-lg">Your Cart</h2>
              </div>
              <button
                onClick={() => dispatch({ type: 'CLOSE_CART' })}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart size={48} className="text-brand-text/15 mb-4" />
                  <p className="font-serif font-bold text-brand-text/40 text-xl mb-2">It's quiet in here</p>
                  <p className="text-brand-text/30 text-sm mb-6">Add some momos or chicken to get started.</p>
                  <Link
                    to="/menu"
                    onClick={() => dispatch({ type: 'CLOSE_CART' })}
                    className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2"
                  >
                    Browse Menu <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {items.map(item => (
                      <motion.div
                        key={`${item.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                        className="flex gap-3 items-center bg-brand-cream rounded-xl p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-text text-xs leading-tight truncate">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="text-brand-text/40 text-[10px] mt-0.5">{item.size}</p>
                          )}
                          <p className="text-brand-primary font-bold text-sm mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, size: item.size, quantity: item.quantity - 1 })}
                            className="w-6 h-6 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, size: item.size, quantity: item.quantity + 1 })}
                            className="w-6 h-6 rounded-full border border-brand-dark/15 flex items-center justify-center hover:border-brand-primary transition-colors"
                            aria-label="Increase"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id, size: item.size })}
                            className="w-6 h-6 ml-0.5 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                            aria-label="Remove"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-brand-dark/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-text/60">Subtotal</span>
                  <span className="font-bold text-brand-dark">${total.toFixed(2)}</span>
                </div>
                <Link
                  to="/order"
                  onClick={() => dispatch({ type: 'CLOSE_CART' })}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base"
                >
                  Checkout · ${(total * 1.0825).toFixed(2)} <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
