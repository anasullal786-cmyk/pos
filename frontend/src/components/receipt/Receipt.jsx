import { Printer } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function Receipt({ order }) {
  const { settings } = useSettings();
  const symbol = settings.currencySymbol || '₹';

  const fmt = (v) => formatCurrency(v, symbol);

  return (
    <div className="flex flex-col gap-4">
      <div
        id="receipt-print-area"
        className="font-receipt-mono mx-auto w-full max-w-xs rounded-lg border border-coffee-200 bg-white px-5 py-6 text-[12px] leading-relaxed text-coffee-900"
      >
        {/* Café header */}
        <div className="print-avoid-break text-center">
          <p className="text-[17px] font-extrabold uppercase tracking-[0.08em]">{settings.cafeName}</p>
          <p className="mx-auto mt-1 max-w-[85%] whitespace-pre-line text-[10.5px] leading-snug text-coffee-500">
            {settings.address}
          </p>
          <p className="mt-0.5 text-[10.5px] tracking-wide text-coffee-500">Tel: {settings.phone}</p>
        </div>

        <div className="my-4 border-t-2 border-dashed border-coffee-300" />

        {/* Cancelled-bill banner — printed only for cancelled orders */}
        {order.status === 'Cancelled' && (
          <div className="print-avoid-break my-3 border-y-2 border-double border-red-600 py-1.5 text-center">
            <p className="text-[15px] font-extrabold tracking-[0.2em] text-red-600">★ CANCELLED BILL ★</p>
            <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-red-500">
              Not a valid sale
            </p>
            {order.updatedAt && (
              <p className="mt-0.5 text-[9.5px] text-red-500">Cancelled on: {formatDateTime(order.updatedAt)}</p>
            )}
          </div>
        )}

        {/* Order meta — two-column label/value grid */}
        <div className="print-avoid-break grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
          <span className="text-coffee-500">Order</span>
          <span className="text-right font-bold">{order.id}</span>

          <span className="text-coffee-500">Date</span>
          <span className="text-right">{formatDateTime(order.createdAt)}</span>

          <span className="text-coffee-500">Table</span>
          <span className="text-right">{order.tableId ? `Table ${String(order.tableId).replace('T', '')}` : 'Takeaway'}</span>

          <span className="text-coffee-500">Customer</span>
          <span className="truncate text-right">{order.customerName}</span>

          {order.customerPhone && (
            <>
              <span className="text-coffee-500">Contact</span>
              <span className="text-right">{order.customerPhone}</span>
            </>
          )}

          <span className="text-coffee-500">Status</span>
          <span
            className={
              order.status === 'Cancelled'
                ? 'text-right font-bold text-red-600'
                : 'text-right font-semibold'
            }
          >
            {order.status}
          </span>
        </div>

        <div className="my-4 border-t-2 border-dashed border-coffee-300" />

        {/* Items */}
        <div className="print-avoid-break">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-coffee-300 text-left text-[10px] uppercase tracking-wider text-coffee-500">
                <th className="pb-1 font-semibold">Item</th>
                <th className="pb-1 text-center font-semibold">Qty</th>
                <th className="pb-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1 pr-2">
                    <span className="font-medium">{it.name}</span>
                    {it.notes ? (
                      <div className="mt-0.5 text-[9.5px] italic text-coffee-500">“{it.notes}”</div>
                    ) : null}
                    <div className="text-[9.5px] text-coffee-400">{fmt(it.price)} each</div>
                  </td>
                  <td className="py-1 text-center">×{it.quantity}</td>
                  <td className="py-1 text-right font-medium">{fmt(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="my-4 border-t-2 border-dashed border-coffee-300" />

        {/* Totals */}
        <div className="print-avoid-break space-y-1 text-[11.5px]">
          <div className="flex justify-between text-coffee-700">
            <span>Subtotal</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-coffee-700">
              <span>Discount</span>
              <span className="text-red-600">−{fmt(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-coffee-700">
            <span>Tax ({order.taxPercent ?? settings.taxPercent}%)</span>
            <span>{fmt(order.tax)}</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between border-t-2 border-coffee-800 pt-2 text-[15px] font-extrabold tracking-wide">
            <span className="uppercase">Total</span>
            <span>{fmt(order.total)}</span>
          </div>

          <div className="flex justify-between pt-0.5 text-coffee-500">
            <span>Paid via</span>
            <span className="font-semibold uppercase tracking-wide text-coffee-700">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="my-4 border-t-2 border-dashed border-coffee-300" />

        {/* Footer */}
        <div className="print-avoid-break text-center">
          <p className="mx-auto max-w-[90%] text-[10.5px] font-medium leading-snug text-coffee-600">
            {settings.receiptFooter}
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-coffee-400">— Thank You —</p>
          <p className="mt-1 text-[9px] text-coffee-400">Powered by Café POS</p>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="mx-auto flex items-center gap-2 rounded-xl bg-coffee-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee-700"
      >
        <Printer size={16} /> Print Receipt
      </button>
    </div>
  );
}
