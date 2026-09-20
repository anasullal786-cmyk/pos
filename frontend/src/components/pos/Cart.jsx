import { ShoppingCart, Trash } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';
import { PAYMENT_METHODS } from '../../data/constants.js';
import { useCart } from '../../context/CartContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useTables } from '../../context/TablesContext.jsx';
import CartItem from './CartItem.jsx';

export default function Cart({ onPlaceOrder, onClear, placing }) {
  const { items, meta, totals, taxPercent, changeQuantity, updateNotes, removeItem, setMeta } = useCart();
  const { settings } = useSettings();
  const { tables } = useTables();
  const symbol = settings.currencySymbol || '₹';
  const fmt = (v) => formatCurrency(v, symbol);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-coffee-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-coffee-100 px-4 py-3">
        <ShoppingCart size={18} className="text-coffee-600" />
        <h2 className="flex-1 text-sm font-bold uppercase tracking-wide text-coffee-800">Current Order</h2>
      </div>

      {/* Order meta */}
      <div className="grid grid-cols-2 gap-2 border-b border-coffee-100 px-4 py-3">
        <label className="col-span-2 text-xs font-semibold text-coffee-500">
          Customer name
          <input
            value={meta.customerName}
            onChange={(e) => setMeta({ customerName: e.target.value })}
            placeholder="Walk-in Customer"
            className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal text-coffee-900 placeholder:text-coffee-300 focus:border-coffee-400 focus:outline-none"
          />
        </label>

        <label className="col-span-2 text-xs font-semibold text-coffee-500">
          Contact number
          <input
            type="tel"
            value={meta.customerPhone}
            onChange={(e) => setMeta({ customerPhone: e.target.value })}
            placeholder="Optional — e.g. +91 98765 43210"
            className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal text-coffee-900 placeholder:text-coffee-300 focus:border-coffee-400 focus:outline-none"
          />
        </label>

        <label className="text-xs font-semibold text-coffee-500">
          Table
          <select
            value={meta.tableId}
            onChange={(e) => setMeta({ tableId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-coffee-200 bg-white px-3 py-2 text-sm font-normal text-coffee-900 focus:border-coffee-400 focus:outline-none"
          >
            <option value="">Takeaway</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-coffee-500">
          Payment method
          <select
            value={meta.paymentMethod}
            onChange={(e) => setMeta({ paymentMethod: e.target.value })}
            className="mt-1 w-full rounded-lg border border-coffee-200 bg-white px-3 py-2 text-sm font-normal text-coffee-900 focus:border-coffee-400 focus:outline-none"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 text-xs font-semibold text-coffee-500">
          Discount (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            value={meta.discount || ''}
            onChange={(e) => setMeta({ discount: Number(e.target.value) || 0 })}
            placeholder="0"
            className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal text-coffee-900 placeholder:text-coffee-300 focus:border-coffee-400 focus:outline-none"
          />
        </label>
      </div>

      {/* Items */}
      <div className="nice-scroll flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
            <ShoppingCart size={36} className="text-coffee-200" />
            <p className="text-sm font-medium text-coffee-500">Cart is empty</p>
            <p className="text-xs text-coffee-400">Tap menu items to add them here</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <CartItem
                key={`${item.productId}-${i}`}
                item={item}
                index={i}
                currencySymbol={symbol}
                onChangeQuantity={changeQuantity}
                onRemove={removeItem}
                onUpdateNotes={updateNotes}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Totals + actions */}
      <div className="space-y-1.5 border-t border-coffee-100 px-4 py-3 text-sm">
        <div className="flex justify-between text-coffee-600">
          <span>Subtotal</span><span>{fmt(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-coffee-600">
            <span>Discount</span><span>-{fmt(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-coffee-600">
          <span>Tax ({taxPercent}%)</span><span>{fmt(totals.tax)}</span>
        </div>
        <div className="flex justify-between border-t border-coffee-200 pt-2 text-base font-bold text-coffee-900">
          <span>Total</span><span>{fmt(totals.total)}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClear}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-coffee-200 px-3 py-2.5 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash size={15} /> Clear
          </button>
          <button
            onClick={onPlaceOrder}
            disabled={items.length === 0 || placing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-warm-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-warm-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {placing ? 'Placing…' : `Place Order · ${fmt(totals.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
