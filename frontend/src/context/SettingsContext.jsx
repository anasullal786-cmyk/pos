import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSettings, saveSettings } from '../services/dataService.js';
import { DEFAULT_SETTINGS } from '../data/constants.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getSettings();
        if (!cancelled && s) setSettings({ ...DEFAULT_SETTINGS, ...s });
      } catch (err) {
        console.error('[settings] load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (next) => {
    const saved = await saveSettings(next);
    setSettings({ ...DEFAULT_SETTINGS, ...saved });
    return saved;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
