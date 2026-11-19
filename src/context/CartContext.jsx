import React, { createContext, useContext, useReducer } from 'react'
import { round2 } from '../data/pricing'

const CartContext = createContext(null)

// A cart line:
//   { key, id, name, image, price (per unit, incl. choices + add-ons), quantity,
//     selections: { optionId: 'Choice' }, options: [{ id, label, value }],
//     addons: [{ id, name, price }] }
// `key` = same dish + same choices + same add-ons, so identical lines merge.
const initialState = {
  items: [],
  isOpen: false,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.key === action.item.key)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.key === action.item.key ? { ...i, quantity: i.quantity + action.item.quantity } : i,
          ),
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.key !== action.key) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map(i => (i.key === action.key ? { ...i, quantity: action.quantity } : i))
          .filter(i => i.quantity > 0),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

// What the payment API needs: ids and choices only. It prices the order itself.
export function toApiLines(items) {
  return items.map(i => ({
    id: i.id,
    quantity: i.quantity,
    selections: i.selections ?? {},
    addons: (i.addons ?? []).map(a => a.id),
  }))
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const total = round2(state.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ ...state, total, itemCount, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
