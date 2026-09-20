import { Armchair, ClipboardList, PlusCircle } from 'lucide-react';
import { TABLE_STATUS_STYLES } from '../../data/constants.js';

const dotColors = {
  Available: 'bg-leaf-500',
  Occupied: 'bg-warm-500',
  Reserved: 'bg-blue-500',
};

export default function TableCard({ table, activeOrder, onNewOrder, onOpenOrder }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center shadow-sm transition ${
        TABLE_STATUS_STYLES[table.status] || 'bg-coffee-100 border-coffee-200'
      } text-white`}
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
          <span className={`h-2 w-2 rounded-full ${dotColors[table.status] || 'bg-coffee-400'} ring-2 ring-white/40`} />
          {table.status}
        </span>
        <Armchair size={18} className="opacity-80" />
      </div>

      <p className="text-lg font-bold">{table.name}</p>

      {activeOrder ? (
        <>
          <p className="text-xs opacity-90">
            {activeOrder.customerName} · {activeOrder.id}
          </p>
          <button
            onClick={() => onOpenOrder(activeOrder)}
            className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-coffee-800 shadow transition hover:bg-white"
          >
            <ClipboardList size={14} /> Open Order
          </button>
        </>
      ) : (
        <>
          <p className="text-xs opacity-75">No active order</p>
          <button
            onClick={() => onNewOrder(table)}
            className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-coffee-800 shadow transition hover:bg-white"
          >
            <PlusCircle size={14} /> New Order
          </button>
        </>
      )}
    </div>
  );
}
