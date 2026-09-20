import { Link } from 'react-router-dom';
import { Armchair, User, CreditCard } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function OrderCard({ order }) {
  const { settings } = useSettings();
  const symbol = settings.currencySymbol || '₹';
  const itemCount = (order.items || []).reduce((s, it) => s + it.quantity, 0);

  return (
    <Link
      to={`/orders/${order.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-coffee-100 bg-white p-4 shadow-sm transition hover:border-coffee-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold text-coffee-900">{order.id}</span>
        <Badge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-coffee-600">
        <span className="flex items-center gap-1.5"><Armchair size={13} className="text-coffee-400" />{order.tableId ? `Table ${String(order.tableId).replace('T', '')}` : 'Takeaway'}</span>
        <span className="flex items-center gap-1.5"><User size={13} className="text-coffee-400" /><span className="truncate">{order.customerName}</span></span>
        <span className="flex items-center gap-1.5"><CreditCard size={13} className="text-coffee-400" />{order.paymentMethod}</span>
        <span className="text-right">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
      </div>

      <div className="flex items-center justify-between border-t border-coffee-100 pt-2">
        <span className="text-[11px] text-coffee-400">{formatDateTime(order.createdAt)}</span>
        <span className="text-sm font-bold text-coffee-800">{formatCurrency(order.total, symbol)}</span>
      </div>
    </Link>
  );
}
