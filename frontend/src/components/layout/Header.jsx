import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, Plus, Wifi, WifiOff } from 'lucide-react';
import { pingBackend } from '../../services/dataService.js';

const titles = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/pos': 'New Order',
  '/tables': 'Tables',
  '/orders': 'Orders',
  '/menu': 'Menu Management',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const [online, setOnline] = useState(null);

  // Poll the backend so staff can see whether API mode is active.
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await pingBackend();
      if (!cancelled) setOnline(ok);
    };
    check();
    const timer = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const title = titles[pathname] || (pathname.startsWith('/orders/') ? 'Order Details' : 'Café POS');

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-coffee-100 bg-cream-50/90 px-4 py-3 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-coffee-600 hover:bg-coffee-100 md:hidden"
        aria-label="Toggle navigation"
      >
        <MenuIcon size={20} />
      </button>

      <h1 className="flex-1 truncate text-lg font-bold text-coffee-900">{title}</h1>

      <span
        className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex ${
          online === null
            ? 'border-coffee-200 bg-coffee-50 text-coffee-500'
            : online
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online === null ? 'Checking…' : online ? 'API connected' : 'Local mode'}
      </span>

      <Link
        to="/pos"
        className="flex items-center gap-1.5 rounded-xl bg-coffee-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-coffee-700"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Order</span>
      </Link>
    </header>
  );
}
