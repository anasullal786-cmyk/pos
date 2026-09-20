import { useMemo, useState, useEffect } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { useOrders } from '../context/OrdersContext.jsx';
import OrderCard from '../components/orders/OrderCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { ORDER_STATUSES } from '../data/constants.js';

const FILTERS = ['All', ...ORDER_STATUSES];

export default function OrdersPage() {
  const { orders, loading, error, refresh } = useOrders();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  // Debounce the search box so typing feels smooth on big lists.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'All' || o.status === filter) &&
        (!q || o.id.toLowerCase().includes(q) || String(o.customerName || '').toLowerCase().includes(q))
    );
  }, [orders, filter, debounced]);

  const counts = useMemo(() => {
    const map = { All: orders.length };
    for (const s of ORDER_STATUSES) map[s] = orders.filter((o) => o.status === s).length;
    return map;
  }, [orders]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or customer…"
            className="w-full rounded-xl border border-coffee-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-coffee-400 focus:outline-none"
          />
        </div>
        <button
          onClick={refresh}
          className="rounded-xl border border-coffee-200 px-4 py-2.5 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50"
        >
          Refresh
        </button>
      </div>

      <div className="nice-scroll flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === f
                ? 'border-coffee-600 bg-coffee-600 text-white'
                : 'border-coffee-200 bg-white text-coffee-700 hover:border-coffee-400'
            }`}
          >
            {f} <span className="opacity-70">({counts[f] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading orders…" />
      ) : error ? (
        <EmptyState icon={ClipboardList} title="Unable to load orders." description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders found"
          description={search || filter !== 'All' ? 'Try changing the search or filter.' : 'Create your first order from the POS screen.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
