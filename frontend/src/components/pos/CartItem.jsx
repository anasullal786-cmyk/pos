import { Plus, Minus, Trash2, StickyNote } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

export default function CartItem({ item, index, currencySymbol, onChangeQuantity, onRemove, onUpdateNotes }) {
  return (
    <li className="rounded-xl border border-coffee-100 bg-cream-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-coffee-900">{item.name}</p>
          <p className="text-xs text-coffee-500">{formatCurrency(item.price, currencySymbol)} each</p>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="rounded-lg p-1.5 text-coffee-300 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-coffee-200 bg-white">
          <button
            onClick={() => onChangeQuantity(index, -1)}
            className="p-1.5 text-coffee-600 transition hover:text-coffee-900"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
          <button
            onClick={() => onChangeQuantity(index, 1)}
            className="p-1.5 text-coffee-600 transition hover:text-coffee-900"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="text-sm font-bold text-coffee-800">
          {formatCurrency(item.price * item.quantity, currencySymbol)}
        </p>
      </div>

      <div className="relative mt-2">
        <StickyNote size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-coffee-300" />
        <input
          value={item.notes || ''}
          onChange={(e) => onUpdateNotes(index, e.target.value)}
          placeholder="Add note (e.g. less sugar)"
          className="w-full rounded-lg border border-coffee-200 bg-white py-1.5 pl-8 pr-2 text-xs text-coffee-800 placeholder:text-coffee-300 focus:border-coffee-400 focus:outline-none"
        />
      </div>
    </li>
  );
}
