import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as dataService from '../services/dataService.js';
import { useOrders } from '../context/OrdersContext.jsx';
import { useTables } from '../context/TablesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import PasswordDialog from '../components/ui/PasswordDialog.jsx';
import Receipt from '../components/receipt/Receipt.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import { ORDER_STATUSES } from '../data/constants.js';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateOrder, deleteOrder } = useOrders();
  const { refresh: refreshTables } = useTables();
  const toast = useToast();
  const { settings } = useSettings();
  const symbol = settings.currencySymbol || '₹';
  const fmt = (v) => formatCurrency(v, symbol);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await dataService.getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error('[order details] load failed', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (status) => {
    try {
      const updated = await updateOrder(id, { status });
      setOrder(updated);
      refreshTables();
      toast.success(`Order marked as ${status}.`);
    } catch (err) {
      console.error('[order details] status change failed', err);
      toast.error('Could not update the order.');
    }
  };

  const handleCancel = async () => {
    try {
      const updated = await updateOrder(id, { status: 'Cancelled' });
      setOrder(updated);
      refreshTables();
      toast.info('Order cancelled.');
    } catch (err) {
      console.error('[order details] cancel failed', err);
      toast.error('Could not cancel the order.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(id);
      refreshTables();
      toast.success('Order deleted.');
      navigate('/orders');
    } catch (err) {
      console.error('[order details] delete failed', err);
      toast.error('Could not delete the order.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading order…" />;
  if (notFound || !order) {
    return (
      <EmptyState
        title="Order not found"
        description="It may have been deleted or the link is incorrect."
        action={
          <Link to="/orders" className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white hover:bg-coffee-700">
            Back to Orders
          </Link>
        }
      />
    );
  }

  const activeIndex = ORDER_STATUSES.indexOf(order.status);
  const pipeline = ORDER_STATUSES.filter((s) => s !== 'Cancelled');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-xl border border-coffee-200 px-3 py-2 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <h1 className="font-mono text-xl font-bold text-coffee-900">{order.id}</h1>
        <Badge status={order.status} />
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center gap-1.5 rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee-700"
          >
            <Printer size={15} /> Receipt
          </button>
          {!['Completed', 'Cancelled'].includes(order.status) && (
            <button
              onClick={() => setShowCancel(true)}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-xl border border-coffee-200 px-4 py-2 text-sm font-semibold text-coffee-600 transition hover:bg-coffee-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: details + items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-coffee-700">Order Information</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              <div><dt className="text-xs text-coffee-400">Placed</dt><dd className="font-medium text-coffee-800">{formatDateTime(order.createdAt)}</dd></div>
              <div><dt className="text-xs text-coffee-400">Table</dt><dd className="font-medium text-coffee-800">{order.tableId ? `Table ${String(order.tableId).replace('T', '')}` : 'Takeaway'}</dd></div>
              <div><dt className="text-xs text-coffee-400">Customer</dt><dd className="font-medium text-coffee-800">{order.customerName}</dd></div>
              {order.customerPhone && (
                <div><dt className="text-xs text-coffee-400">Contact</dt><dd className="font-medium text-coffee-800">{order.customerPhone}</dd></div>
              )}
              <div><dt className="text-xs text-coffee-400">Payment</dt><dd className="font-medium text-coffee-800">{order.paymentMethod}</dd></div>
              <div><dt className="text-xs text-coffee-400">Items</dt><dd className="font-medium text-coffee-800">{order.items.reduce((s, it) => s + it.quantity, 0)}</dd></div>
              <div><dt className="text-xs text-coffee-400">Last update</dt><dd className="font-medium text-coffee-800">{formatDateTime(order.updatedAt)}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-coffee-100 bg-white shadow-sm">
            <h2 className="border-b border-coffee-100 px-5 py-3 text-sm font-bold uppercase tracking-wide text-coffee-700">Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-coffee-100 text-left text-xs uppercase tracking-wide text-coffee-400">
                  <th className="px-5 py-2 font-semibold">Item</th>
                  <th className="px-3 py-2 text-center font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">Price</th>
                  <th className="px-5 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {order.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-coffee-900">{it.name}</p>
                      {it.notes && <p className="text-xs italic text-coffee-500">“{it.notes}”</p>}
                    </td>
                    <td className="px-3 py-2.5 text-center text-coffee-700">{it.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-coffee-700">{fmt(it.price)}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-coffee-900">{fmt(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto max-w-xs space-y-1.5 border-t border-coffee-100 px-5 py-4 text-sm">
              <div className="flex justify-between text-coffee-600"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-coffee-600"><span>Discount</span><span>-{fmt(order.discount)}</span></div>}
              <div className="flex justify-between text-coffee-600"><span>Tax ({order.taxPercent ?? settings.taxPercent}%)</span><span>{fmt(order.tax)}</span></div>
              <div className="flex justify-between border-t border-coffee-200 pt-2 text-base font-bold text-coffee-900"><span>Total</span><span>{fmt(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Right: status pipeline */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-coffee-700">Status Pipeline</h2>
            <div className="flex flex-col gap-2">
              {pipeline.map((status, i) => {
                const isCurrent = order.status === status;
                const isPast = activeIndex > i && order.status !== 'Cancelled';
                return (
                  <button
                    key={status}
                    onClick={() => changeStatus(status)}
                    disabled={isCurrent || order.status === 'Cancelled'}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      isCurrent
                        ? 'border-coffee-600 bg-coffee-600 text-white'
                        : isPast
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-coffee-200 text-coffee-700 hover:border-coffee-400'
                    } ${order.status === 'Cancelled' ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {status}
                    {isCurrent && <span className="text-xs">● current</span>}
                  </button>
                );
              })}
            </div>
            {order.status === 'Cancelled' && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">This order was cancelled.</p>
            )}
          </div>

          <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-coffee-700">Payment Summary</h2>
            <div className="space-y-2 text-sm text-coffee-700">
              <div className="flex justify-between"><span>Method</span><span className="font-semibold">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Total charged</span><span className="font-bold text-coffee-900">{fmt(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <PasswordDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancel this bill?"
        message={`Order ${order.id} will be marked as cancelled and the table will be freed. This cannot be undone from the pipeline.`}
        confirmLabel="Cancel Order"
      />
      <PasswordDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete this bill?"
        message={`Order ${order.id} will be permanently removed. Reports and history will no longer include it.`}
        confirmLabel="Delete Bill"
      />
      <ReceiptModal order={order} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </div>
  );
}

function ReceiptModal({ order, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={`Receipt — ${order.id}`}>
      <Receipt order={order} />
    </Modal>
  );
}
