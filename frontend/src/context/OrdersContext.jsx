import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as dataService from '../services/dataService.js';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('[orders] load failed', err);
      setError('Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrder = useCallback(async (orderInput, totals, taxPercent) => {
    const created = await dataService.saveOrder(orderInput, totals, taxPercent);
    setOrders((list) => [created, ...list.filter((o) => o.id !== created.id)]);
    return created;
  }, []);

  const updateOrder = useCallback(async (id, patch) => {
    const updated = await dataService.updateOrder(id, patch);
    setOrders((list) => list.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const deleteOrder = useCallback(async (id) => {
    await dataService.deleteOrder(id);
    setOrders((list) => list.filter((o) => o.id !== id));
  }, []);

  /** Convenience wrapper for the status pipeline buttons. */
  const setOrderStatus = useCallback(
    (id, status) => updateOrder(id, { status }),
    [updateOrder]
  );

  return (
    <OrdersContext.Provider
      value={{ orders, loading, error, refresh, createOrder, updateOrder, deleteOrder, setOrderStatus }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
