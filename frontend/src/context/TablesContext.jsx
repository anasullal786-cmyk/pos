import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as dataService from '../services/dataService.js';

const TablesContext = createContext(null);

export function TablesProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.getTables();
      setTables(data);
    } catch (err) {
      console.error('[tables] load failed', err);
      setError('Unable to load tables.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = useCallback(async (id, status) => {
    const updated = await dataService.updateTableStatus(id, status);
    setTables((list) => list.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  return (
    <TablesContext.Provider value={{ tables, loading, error, refresh, updateStatus }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error('useTables must be used within TablesProvider');
  return ctx;
}
