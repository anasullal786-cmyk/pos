import { useEffect, useState } from 'react';
import { Save, RotateCcw, Store, ReceiptText, Database } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTables } from '../context/TablesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateSettings } from '../utils/validation.js';
import { resetLocalData, resetServerData } from '../services/dataService.js';
import { ensureSeedData } from '../data/seedInit.js';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { STORAGE_KEYS } from '../utils/storage.js';

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const { refresh: refreshTables, tables } = useTables();
  const toast = useToast();

  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmTables, setConfirmTables] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    const { ok, errors: errs } = validateSettings(form);
    if (!ok) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      await update(form);
      toast.success('Settings saved.');
      // If the default table count changed, offer to regenerate tables.
      if (Number(form.defaultTableCount) !== tables.length) {
        setConfirmTables(true);
      }
    } catch (err) {
      console.error('[settings] save failed', err);
      toast.error(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const regenerateTables = async () => {
    resetLocalData();
    ensureSeedData();
    await resetServerData();
    window.location.reload();
  };

  const handleReset = async () => {
    resetLocalData();
    ensureSeedData();
    await resetServerData();
    toast.success('Demo data has been reset. Reloading…');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Café profile */}
      <section className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-coffee-700">
          <Store size={15} /> Café Profile
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-coffee-500 sm:col-span-2">
            Café name *
            <input
              value={form.cafeName}
              onChange={(e) => set({ cafeName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500 sm:col-span-2">
            Address
            <textarea
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500">
            Phone
            <input
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500">
            Tax percentage *
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.taxPercent}
              onChange={(e) => set({ taxPercent: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500">
            Currency code
            <input
              value={form.currency}
              onChange={(e) => set({ currency: e.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500">
            Currency symbol
            <input
              value={form.currencySymbol}
              onChange={(e) => set({ currencySymbol: e.target.value })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500 sm:col-span-2">
            Receipt footer message
            <input
              value={form.receiptFooter}
              onChange={(e) => set({ receiptFooter: e.target.value })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-coffee-500">
            Default table count
            <input
              type="number"
              min="1"
              max="50"
              value={form.defaultTableCount}
              onChange={(e) => set({ defaultTableCount: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
            />
          </label>
        </div>

        {errors.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.map((e) => <li key={e}>• {e}</li>)}
          </ul>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-coffee-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee-700 disabled:opacity-50"
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </section>

      {/* Receipt preview note + data management */}
      <section className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-coffee-700">
          <ReceiptText size={15} /> Receipt Preview
        </h2>
        <p className="text-sm text-coffee-600">
          Receipts print with: <span className="font-semibold text-coffee-800">{form.cafeName}</span> ·{' '}
          {form.phone} · tax {form.taxPercent}% · footer “{form.receiptFooter}”.
          Place an order or open one from Orders to see the live receipt.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-800">
          <Database size={15} /> Demo Data
        </h2>
        <p className="mb-3 text-sm text-amber-800">
          Reset wipes all locally stored menu, orders, tables and settings, then re-seeds the demo data.
          Current keys in use: <code className="rounded bg-amber-100 px-1">{STORAGE_KEYS.menu}</code>,{' '}
          <code className="rounded bg-amber-100 px-1">{STORAGE_KEYS.orders}</code>,{' '}
          <code className="rounded bg-amber-100 px-1">{STORAGE_KEYS.tables}</code>,{' '}
          <code className="rounded bg-amber-100 px-1">{STORAGE_KEYS.settings}</code>.
        </p>
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          <RotateCcw size={15} /> Reset Demo Data
        </button>
      </section>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset all demo data?"
        message="Every menu item, order, table and setting stored in this browser will be wiped and replaced with fresh sample data. This cannot be undone."
        confirmLabel="Reset Data"
      />

      <ConfirmDialog
        open={confirmTables}
        onClose={() => setConfirmTables(false)}
        onConfirm={regenerateTables}
        title="Regenerate tables?"
        message={`You changed the default table count to ${form.defaultTableCount} (currently ${tables.length}). This resets ALL local data and re-seeds with ${form.defaultTableCount} tables.`}
        confirmLabel="Reset & Regenerate"
        danger={false}
      />
    </div>
  );
}
