import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, RefreshCw } from 'lucide-react';
import { useTables } from '../context/TablesContext.jsx';
import { useOrders } from '../context/OrdersContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { TABLE_STATUSES } from '../data/constants.js';

const ACTIVE_STATUSES = ['Pending', 'Preparing', 'Ready'];

export default function TablesPage() {
  const { tables, loading, refresh, updateStatus } = useTables();
  const { orders } = useOrders();
  const cart = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  /** Map of tableId -> its active order (first Pending/Preparing/Ready). */
  const activeByTable = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      if (ACTIVE_STATUSES.includes(o.status) && o.tableId && !map.has(o.tableId)) {
        map.set(o.tableId, o);
      }
    }
    return map;
  }, [orders]);

  const handleNewOrder = (table) => {
    if (cart.items.length > 0 && cart.meta.tableId !== table.id) {
      toast.info('Cart has items for another table — clear the cart first or open that order.');
      return;
    }
    cart.setMeta({ tableId: table.id });
    navigate('/pos');
  };

  const handleOpenOrder = (order) => navigate(`/orders/${order.id}`);

  const handleStatusChange = async (tableId, status) => {
    try {
      await updateStatus(tableId, status);
      toast.success('Table status updated.');
    } catch (err) {
      console.error('[tables] status update failed', err);
      toast.error('Could not update table status.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading tables…" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-coffee-600">
          {tables.filter((t) => t.status === 'Available').length} available ·{' '}
          {tables.filter((t) => t.status === 'Occupied').length} occupied ·{' '}
          {tables.filter((t) => t.status === 'Reserved').length} reserved
        </p>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-xl border border-coffee-200 px-3 py-1.5 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {tables.length === 0 ? (
        <EmptyState icon={Armchair} title="No tables configured" description="Adjust the default table count in Settings." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tables.map((table) => (
            <div key={table.id} className="flex flex-col gap-2">
              <TableCard
                table={table}
                activeOrder={activeByTable.get(table.id)}
                onNewOrder={handleNewOrder}
                onOpenOrder={handleOpenOrder}
              />
              <select
                value={table.status}
                onChange={(e) => handleStatusChange(table.id, e.target.value)}
                className="rounded-lg border border-coffee-200 bg-white px-2 py-1.5 text-xs font-medium text-coffee-700 focus:outline-none"
                aria-label={`Change status of ${table.name}`}
              >
                {TABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
