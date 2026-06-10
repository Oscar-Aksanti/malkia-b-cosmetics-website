'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartState, CartAction, CartItem } from '@/types';

/* ── Initial state ────────────────────────────────────────────────────────── */
const initialState: CartState = {
  items: [],
  isOpen: false,
};

/* ── Reducer ──────────────────────────────────────────────────────────────── */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      };

    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };

    case 'CLEAR':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'HYDRATE':
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

/* ── Context ──────────────────────────────────────────────────────────────── */
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  cartCount: number;
  cartTotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('malkia-cart');
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch {
      /* ignore malformed data */
    }
  }, []);

  /* Persist to localStorage on every change */
  useEffect(() => {
    localStorage.setItem('malkia-cart', JSON.stringify(state.items));
  }, [state.items]);

  /* Computed values */
  const cartCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = state.items.reduce(
    (s, i) => s + i.price_usd * i.quantity,
    0
  );

  /* Actions */
  const addItem = useCallback(
    (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
    []
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
    []
  );
  const updateQty = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        cartCount,
        cartTotal,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
