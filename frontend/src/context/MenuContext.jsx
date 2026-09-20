import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as dataService from '../services/dataService.js';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.getMenu();
      setItems(data);
    } catch (err) {
      console.error('[menu] load failed', err);
      setError('Unable to load menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (item) => {
    const created = await dataService.addMenuItem(item);
    setItems((list) => [...list, created]);
    return created;
  }, []);

  const updateItem = useCallback(async (id, patch) => {
    const updated = await dataService.updateMenuItem(id, patch);
    setItems((list) => list.map((m) => (m.id === id ? updated : m)));
    return updated;
  }, []);

  const deleteItem = useCallback(async (id) => {
    await dataService.deleteMenuItem(id);
    setItems((list) => list.filter((m) => m.id !== id));
  }, []);

  /** Delete many items at once; removes only the ones that succeeded. */
  const deleteItems = useCallback(async (ids) => {
    const results = await Promise.allSettled(ids.map((id) => dataService.deleteMenuItem(id)));
    const deleted = ids.filter((_, i) => results[i].status === 'fulfilled');
    const failed = ids.length - deleted.length;
    if (deleted.length) {
      const gone = new Set(deleted);
      setItems((list) => list.filter((m) => !gone.has(m.id)));
    }
    if (failed) {
      throw new Error(`${failed} item${failed === 1 ? '' : 's'} could not be deleted.`);
    }
  }, []);

  const toggleAvailability = useCallback(
    async (id) => {
      const item = items.find((m) => m.id === id);
      if (!item) return;
      return updateItem(id, { available: !item.available });
    },
    [items, updateItem]
  );

  return (
    <MenuContext.Provider
      value={{ items, loading, error, refresh, addItem, updateItem, deleteItem, deleteItems, toggleAvailability }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
