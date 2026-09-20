import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  Plus,
  Armchair,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import * as dataService from '../services/dataService.js';
import { useSettings } from '../context/SettingsContext.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { BarChart } from '../components/charts/SalesChart.jsx';
import { formatCurrency, formatCompactCurrency } from '../utils/format.js';

export default function DashboardPage() {
  const { settings } = useSettings();
  const symbol = settings.currencySymbol || '₹';
  const fmt = (v) => formatCurrency(v, symbol);
  const fmtCompact = (v) => formatCompactCurrency(v, symbol);

  const [reports, setReports] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([dataService.getReports(), dataService.getOrders()]);
      setReports(r);
      setOrders(o.slice(0, 6));
    } catch (err) {
      console.error('[dashboard] load failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Preparing your dashboard…" />;
  if (!reports) {
    return <EmptyState title="Unable to load statistics." description="Please refresh the page to try again." />;
  }

  const quickActions = [
    { to: '/pos', label: 'New Order', icon: Plus, tone: 'bg-warm-500 hover:bg-warm-600' },
    { to: '/tables', label: 'Tables', icon: Armchair, tone: 'bg-coffee-600 hover:bg-coffee-700' },
    { to: '/orders', label: 'Orders', icon: ClipboardList, tone: 'bg-coffee-600 hover:bg-coffee-700' },
    { to: '/reports', label: 'Reports', icon: BarChart3, tone: 'bg-coffee-600 hover:bg-coffee-700' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's Sales" value={fmt(reports.todaySales)} sub={`${reports.todayOrders} orders today`} tone="warm" />
        <StatCard icon={ShoppingCart} label="Today's Orders" value={reports.todayOrders} sub="including pending" tone="coffee" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={fmt(reports.averageOrderValue)} sub="all time" tone="leaf" />
        <StatCard icon={Clock} label="Pending Orders" value={reports.pendingOrders} sub="active in kitchen" tone="blue" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map(({ to, label, icon: Icon, tone }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-sm transition ${tone}`}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Sales trend */}
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-coffee-700">Sales — Last 14 Days</h2>
            <Link to="/reports" className="flex items-center gap-1 text-xs font-semibold text-coffee-500 hover:text-coffee-700">
              Full reports <ArrowRight size={12} />
            </Link>
          </div>
          <BarChart
            data={reports.trend.map((t) => ({ label: t.label, value: t.revenue, count: t.orders }))}
            formatValue={fmtCompact}
          />
        </div>

        {/* Popular items */}
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-coffee-700">
            <Flame size={15} className="text-warm-500" /> Popular Items
          </h2>
          {reports.bestSellers.length === 0 ? (
            <p className="text-sm text-coffee-400">No sales yet.</p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {reports.bestSellers.slice(0, 5).map((item, i) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-warm-500 text-white' : 'bg-coffee-100 text-coffee-600'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-coffee-800">{item.name}</span>
                  <span className="text-xs text-coffee-500">{item.quantity} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent orders + summary */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-coffee-700">Recent Orders</h2>
            <Link to="/orders" className="flex items-center gap-1 text-xs font-semibold text-coffee-500 hover:text-coffee-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-coffee-400">No orders yet — create one from the POS screen.</p>
          ) : (
            <ul className="divide-y divide-coffee-100">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/orders/${o.id}`} className="flex items-center gap-3 py-2.5 transition hover:bg-cream-50">
                    <span className="font-mono text-xs font-bold text-coffee-800">{o.id}</span>
                    <span className="flex-1 truncate text-sm text-coffee-600">{o.customerName}</span>
                    <Badge status={o.status} />
                    <span className="w-20 text-right text-sm font-semibold text-coffee-800">{fmt(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-coffee-700">
            <CheckCircle2 size={15} className="text-leaf-600" /> Sales Summary
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-coffee-500">Week sales</dt><dd className="font-semibold text-coffee-800">{fmt(reports.weekSales)}</dd></div>
            <div className="flex justify-between"><dt className="text-coffee-500">Month sales</dt><dd className="font-semibold text-coffee-800">{fmt(reports.monthSales)}</dd></div>
            <div className="flex justify-between"><dt className="text-coffee-500">Total orders</dt><dd className="font-semibold text-coffee-800">{reports.totalOrders}</dd></div>
            <div className="flex justify-between"><dt className="text-coffee-500">Completed</dt><dd className="font-semibold text-coffee-800">{reports.completedOrders}</dd></div>
            <div className="flex justify-between border-t border-coffee-100 pt-3">
              <dt className="text-coffee-500">Best seller</dt>
              <dd className="truncate font-semibold text-coffee-800">{reports.bestSellers[0]?.name || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
