import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Armchair,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings as SettingsIcon,
  Coffee,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'New Order', icon: ShoppingCart },
  { to: '/tables', label: 'Tables', icon: Armchair },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-coffee-900/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-coffee-900 text-cream-100 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-500 text-white">
            <Coffee size={20} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Café POS</p>
            <p className="text-xs text-coffee-300">Order Management</p>
          </div>
        </div>

        <nav className="nice-scroll flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-warm-500 text-white shadow'
                    : 'text-coffee-200 hover:bg-coffee-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-coffee-800 px-5 py-4 text-xs text-coffee-400">
          Café POS v1.0 · localStorage mode
        </div>
      </aside>
    </>
  );
}
