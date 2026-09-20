import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSettings } from './SettingsContext.jsx';
import { calculateTotals, addLine, setLineQuantity, setLineNotes } from '../utils/calc.js';
import { read, write } from '../utils/storage.js';

const CART_KEY = 'cafe_active_cart';

const CartContext = createContext(null);

const initialMeta = {
  tableId: '',
  customerName: '',
  customerPhone: '',
  paymentMethod: 'Cash',
  discount: 0,
};

/** Load the in-progress cart saved before a refresh. */
function loadCart() {
  const saved = read(CART_KEY, null);
  if (saved && Array.isArray(saved.items)) {
    return {
      items: saved.items,
      meta: { ...initialMeta, ...(saved.meta || {}) },
    };
  }
  return { items: [], meta: { ...initialMeta } };
}

export function CartProvider({ children }) {
  // Load the persisted cart exactly once on mount.
  const [initial] = useState(() => loadCart());

  // Split state so meta edits don't re-render item lists unnecessarily.
  const [cartItems, setCartItems] = useState(initial.items);
  const [cartMeta, setCartMeta] = useState(initial.meta);

  // Persist after every change — refreshing must not lose the cart.
  useEffect(() => {
    write(CART_KEY, { items: cartItems, meta: cartMeta });
  }, [cartItems, cartMeta]);

  const taxPercent = useSettingsTax();

  const totals = useMemo(
    () => calculateTotals({ items: cartItems, discount: cartMeta.discount, taxPercent }),
    [cartItems, cartMeta.discount, taxPercent]
  );

  const addItem = useCallback((product, quantity = 1, notes = '') => {
    setCartItems((list) => addLine(list, product, quantity, notes));
  }, []);

  const changeQuantity = useCallback((index, delta) => {
    setCartItems((list) => {
      const current = list[index];
      if (!current) return list;
      return setLineQuantity(list, index, current.quantity + delta);
    });
  }, []);

  const setQuantity = useCallback((index, quantity) => {
    setCartItems((list) => setLineQuantity(list, index, Number(quantity)));
  }, []);

  const updateNotes = useCallback((index, notes) => {
    setCartItems((list) => setLineNotes(list, index, notes));
  }, []);

  const removeItem = useCallback((index) => {
    setCartItems((list) => list.filter((_, i) => i !== index));
  }, []);

  const setMeta = useCallback((patch) => {
    setCartMeta((m) => ({ ...m, ...patch }));
  }, []);

  const clear = useCallback(() => {
    setCartItems([]);
    setCartMeta({ ...initialMeta });
  }, []);

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        meta: cartMeta,
        totals,
        taxPercent,
        addItem,
        changeQuantity,
        setQuantity,
        updateNotes,
        removeItem,
        setMeta,
        clear,
        isEmpty: cartItems.length === 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Reads the tax rate from SettingsContext. Kept as a tiny internal hook so
 * CartProvider can nest inside SettingsProvider without a circular import.
 */
function useSettingsTax() {
  const { settings } = useSettings();
  return Number(settings.taxPercent) || 0;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
