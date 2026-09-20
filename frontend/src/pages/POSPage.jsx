import { useMemo, useState } from 'react';
import { Search, ReceiptText, SearchX, ClipboardList } from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useOrders } from '../context/OrdersContext.jsx';
import { useTables } from '../context/TablesContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import MenuCard from '../components/pos/MenuCard.jsx';
import CategoryFilter from '../components/pos/CategoryFilter.jsx';
import Cart from '../components/pos/Cart.jsx';
import Modal from '../components/ui/Modal.jsx';
import Receipt from '../components/receipt/Receipt.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function POSPage() {
  const { items: menu, loading, error, refresh: refreshMenu } = useMenu();
  const cart = useCart();
  const { createOrder, refresh: refreshOrders } = useOrders();
  const { tables, refresh: refreshTables } = useTables();
  const { settings } = useSettings();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const symbol = settings.currencySymbol || '₹';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter(
      (m) =>
        (category === 'All' || m.category === category) &&
        (!q || m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q))
    );
  }, [menu, search, category]);

  const handleAdd = (item) => {
    if (!item.available) {
      toast.error('This item is currently unavailable.');
      return;
    }
    cart.addItem(item);
  };

  const handlePlaceOrder = async () => {
    if (cart.isEmpty) {
      toast.error('Please add at least one item.');
      return;
    }
    if (cart.totals.total <= 0) {
      toast.error('Order total must be greater than zero.');
      return;
    }

    setPlacing(true);
    try {
      const created = await createOrder(
        {
          tableId: cart.meta.tableId || null,
          customerName: cart.meta.customerName,
          customerPhone: cart.meta.customerPhone || '',
          items: cart.items,
          discount: cart.meta.discount,
          paymentMethod: cart.meta.paymentMethod,
          status: 'Pending',
        },
        cart.totals,
        cart.taxPercent
      );

      setPlacedOrder(created);
      cart.clear();
      toast.success(`Order ${created.id} placed successfully!`);
      refreshOrders();
      refreshTables();
    } catch (err) {
      console.error('[pos] place order failed', err);
      toast.error('Could not create order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleClear = () => {
    cart.clear();
    toast.info('Order cleared.');
  };

  if (loading) return <LoadingSpinner label="Loading menu…" />;
  if (error) {
    return (
      <EmptyState
        icon={SearchX}
        title="Unable to load menu."
        description={error}
        action={
          <button
            onClick={refreshMenu}
            className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white hover:bg-coffee-700"
          >
            Try Again
          </button>
        }
      />
    );
  }

  return (
    <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      {/* LEFT: menu browser */}
      <section className="flex min-h-0 flex-col gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items…"
            className="w-full rounded-xl border border-coffee-200 bg-white py-2.5 pl-10 pr-4 text-sm text-coffee-900 placeholder:text-coffee-300 focus:border-coffee-400 focus:outline-none"
          />
        </div>

        <CategoryFilter active={category} onChange={setCategory} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No items found"
            description={`Nothing matches "${search || category}". Try a different search or category.`}
          />
        ) : (
          <div className="nice-scroll grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} currencySymbol={symbol} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </section>

      {/* RIGHT: cart */}
      <aside className="hidden min-h-0 lg:block">
        <Cart onPlaceOrder={handlePlaceOrder} onClear={handleClear} placing={placing} />
      </aside>

      {/* Mobile cart: fixed bottom bar + full-screen sheet */}
      <MobileCart onPlaceOrder={handlePlaceOrder} onClear={handleClear} placing={placing} />

      {/* Receipt modal after successful placement */}
      <Modal open={!!placedOrder} onClose={() => setPlacedOrder(null)} title="Order Placed ☕" size="md">
        {placedOrder && (
          <div className="flex flex-col gap-4">
            <Receipt order={placedOrder} />
            <button
              onClick={() => setPlacedOrder(null)}
              className="mx-auto flex items-center gap-2 rounded-xl border border-coffee-200 px-5 py-2 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50"
            >
              <ClipboardList size={16} /> Continue to POS
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

/** Compact cart launcher for small screens. */
function MobileCart({ onPlaceOrder, onClear, placing }) {
  const { totals, isEmpty } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!isEmpty && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between rounded-2xl bg-coffee-800 px-5 py-3 text-white shadow-xl lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ReceiptText size={16} />
            {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'} · {`₹${totals.total.toFixed(2)}`}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide">View cart</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 bg-coffee-900/60 backdrop-blur-sm lg:hidden" onMouseDown={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 top-14 mx-auto max-w-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Cart onPlaceOrder={onPlaceOrder} onClear={onClear} placing={placing} />
          </div>
        </div>
      )}
    </>
  );
}
