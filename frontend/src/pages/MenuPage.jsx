import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, UtensilsCrossed, ImageOff, CheckSquare, X } from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import MenuForm from '../components/menu/MenuForm.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { formatCurrency } from '../utils/format.js';
import { CATEGORIES } from '../data/constants.js';

export default function MenuPage() {
  const { items, loading, error, addItem, updateItem, deleteItem, deleteItems, toggleAvailability, refresh } = useMenu();
  const { settings } = useSettings();
  const toast = useToast();
  const symbol = settings.currencySymbol || '₹';

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (m) =>
        (categoryFilter === 'All' || m.category === categoryFilter) &&
        (!q || m.name.toLowerCase().includes(q))
    );
  }, [items, search, categoryFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  /* ----- selection helpers ----- */
  const selectedIds = useMemo(() => [...selected], [selected]);
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());
  const allVisibleSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) {
        // Deselect everything currently visible.
        const next = new Set(prev);
        filtered.forEach((m) => next.delete(m.id));
        return next;
      }
      return new Set([...prev, ...filtered.map((m) => m.id)]);
    });
  };

  // Drop ids that no longer exist (e.g. deleted elsewhere) from the selection.
  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set(items.map((m) => m.id));
      const next = [...prev].filter((id) => valid.has(id));
      return next.length === prev.size ? prev : new Set(next);
    });
  }, [items]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeletingBulk(true);
    try {
      await deleteItems(selectedIds);
      toast.success(`${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'} deleted.`);
      clearSelection();
    } catch (err) {
      console.error('[menu] bulk delete failed', err);
      toast.error(err.message || 'Some items could not be deleted.');
      clearSelection();
    } finally {
      setDeletingBulk(false);
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        // Duplicate check against other items.
        const dup = items.find(
          (m) => m.id !== editing.id && m.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
        );
        if (dup) {
          toast.error(`"${dup.name}" already exists in the menu.`);
          return;
        }
        await updateItem(editing.id, payload);
        toast.success(`"${payload.name}" updated.`);
      } else {
        const dup = items.find(
          (m) => m.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
        );
        if (dup) {
          toast.error(`"${dup.name}" already exists in the menu.`);
          return;
        }
        await addItem(payload);
        toast.success(`"${payload.name}" added to the menu.`);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      console.error('[menu] save failed', err);
      toast.error(err.message || 'Could not save the menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteItem(deleting.id);
      toast.success(`"${deleting.name}" removed from the menu.`);
      setDeleting(null);
    } catch (err) {
      console.error('[menu] delete failed', err);
      toast.error('Could not delete the menu item.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading menu…" />;
  if (error) {
    return <EmptyState icon={UtensilsCrossed} title="Unable to load menu." description={error} action={<button onClick={refresh} className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white hover:bg-coffee-700">Try Again</button>} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items…"
            className="w-full rounded-xl border border-coffee-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-coffee-400 focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-coffee-200 bg-white px-3 py-2.5 text-sm text-coffee-700 focus:outline-none"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {filtered.length > 0 && (
          <label className="flex select-none items-center gap-2 rounded-xl border border-coffee-200 bg-white px-3 py-2.5 text-sm font-medium text-coffee-700">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = !allVisibleSelected && filtered.some((m) => selected.has(m.id));
              }}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-coffee-600"
            />
            Select all
          </label>
        )}
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-coffee-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee-700"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Bulk selection bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <CheckSquare size={15} className="text-red-600" />
          <span className="text-sm font-semibold text-red-700">
            {selected.size} item{selected.size === 1 ? '' : 's'} selected
          </span>
          <span className="flex-1" />
          <button
            onClick={clearSelection}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-coffee-600 transition hover:bg-white"
          >
            <X size={12} /> Clear selection
          </button>
          <button
            onClick={() => setConfirmBulk(true)}
            disabled={deletingBulk}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={13} /> {deletingBulk ? 'Deleting…' : 'Delete selected'}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items"
          description={search || categoryFilter !== 'All' ? 'Nothing matches this filter.' : 'Add your first menu item to get started.'}
          action={<button onClick={openAdd} className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white hover:bg-coffee-700">Add Item</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 rounded-2xl border bg-white p-3 shadow-sm transition ${
                selected.has(item.id)
                  ? 'border-coffee-400 ring-1 ring-coffee-300'
                  : item.available
                    ? 'border-coffee-100'
                    : 'border-coffee-100 opacity-70'
              }`}
            >
              <label className="flex items-center" aria-label={`Select ${item.name}`}>
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="h-4 w-4 accent-coffee-600"
                />
              </label>
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-coffee-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-coffee-300">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-coffee-900">{item.name}</p>
                    <p className="text-[11px] uppercase tracking-wide text-coffee-400">{item.category}</p>
                  </div>
                  <p className="text-sm font-bold text-coffee-700">{formatCurrency(item.price, symbol)}</p>
                </div>

                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-coffee-500">{item.description}</p>
                )}

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                      item.available
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  <span className="flex-1" />
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-1.5 text-coffee-400 transition hover:bg-coffee-50 hover:text-coffee-700"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleting(item)}
                    className="rounded-lg p-1.5 text-coffee-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialItem={editing}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete menu item?"
        message={`"${deleting?.name}" will be removed from the menu. Past orders keep their recorded copy of the item.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} menu item${selected.size === 1 ? '' : 's'}?`}
        message={`All ${selected.size} selected items will be permanently removed from the menu. Past orders keep their recorded copies of the items. This cannot be undone.`}
        confirmLabel="Delete Selected"
      />
    </div>
  );
}
