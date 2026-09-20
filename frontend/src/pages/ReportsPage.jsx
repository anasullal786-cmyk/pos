import { useEffect, useState, useCallback } from 'react';
import {
  IndianRupee,
  CalendarDays,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import * as dataService from '../services/dataService.js';
import { useSettings } from '../context/SettingsContext.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { BarChart, HBarList } from '../components/charts/SalesChart.jsx';
import { formatCurrency, formatCompactCurrency } from '../utils/format.js';

export default function ReportsPage() {
  const { settings } = useSettings();
  const symbol = settings.currencySymbol || '₹';
  const fmt = (v) => formatCurrency(v, symbol);
  const fmtCompact = (v) => formatCompactCurrency(v, symbol);

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await dataService.getReports();
      setReports(r);
    } catch (err) {
      console.error('[reports] load failed', err);
      setError('Unable to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Crunching numbers…" />;
  if (error || !reports) {
    return (
      <EmptyState
        icon={BarChart3}
        title={error || 'No report data.'}
        action={<button onClick={load} className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white hover:bg-coffee-700">Try Again</button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-coffee-600">All figures are calculated from stored orders (cancelled orders excluded).</p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-coffee-200 px-3 py-1.5 text-sm font-semibold text-coffee-700 transition hover:bg-coffee-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's Sales" value={fmt(reports.todaySales)} sub={`${reports.todayOrders} orders`} tone="warm" />
        <StatCard icon={CalendarDays} label="Weekly Sales" value={fmt(reports.weekSales)} sub="last 7 days" tone="coffee" />
        <StatCard icon={TrendingUp} label="Monthly Sales" value={fmt(reports.monthSales)} sub="last 30 days" tone="leaf" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={reports.totalOrders} sub={`Avg ${fmt(reports.averageOrderValue)}`} tone="blue" />
      </div>

      {/* Trend */}
      <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-coffee-700">Revenue — Last 14 Days</h2>
        <BarChart
          data={reports.trend.map((t) => ({ label: t.label, value: t.revenue, count: t.orders }))}
          formatValue={fmtCompact}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Best sellers */}
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-coffee-700">Best-Selling Items</h2>
          {reports.bestSellers.length === 0 ? (
            <p className="text-sm text-coffee-400">No sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-coffee-400">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="pb-2 text-center font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {reports.bestSellers.map((it) => (
                  <tr key={it.name}>
                    <td className="py-1.5 font-medium text-coffee-800">{it.name}</td>
                    <td className="py-1.5 text-center text-coffee-600">{it.quantity}</td>
                    <td className="py-1.5 text-right text-coffee-700">{fmt(it.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-coffee-700">Sales by Category</h2>
          {reports.salesByCategory.length === 0 ? (
            <p className="text-sm text-coffee-400">No sales yet.</p>
          ) : (
            <HBarList
              data={reports.salesByCategory.map((c) => ({ label: c.category, value: c.revenue }))}
              formatValue={fmtCompact}
            />
          )}
        </div>

        {/* Payment breakdown */}
        <div className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-coffee-700">Payment Methods</h2>
          {reports.paymentBreakdown.length === 0 ? (
            <p className="text-sm text-coffee-400">No sales yet.</p>
          ) : (
            <HBarList
              data={reports.paymentBreakdown.map((p) => ({ label: `${p.method} (${p.count})`, value: p.revenue }))}
              formatValue={fmtCompact}
            />
          )}
        </div>
      </div>
    </div>
  );
}
