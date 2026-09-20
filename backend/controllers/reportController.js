import * as store from '../services/store.js';

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

function withinDays(iso, days) {
  const d = new Date(iso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return d >= cutoff;
}

export function getReports(_req, res) {
  const orders = store.getOrders().filter((o) => o.status !== 'Cancelled');
  const completed = orders.filter((o) => o.status === 'Completed');

  const sum = (list) => list.reduce((s, o) => s + (o.total || 0), 0);

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const weekOrders = orders.filter((o) => withinDays(o.createdAt, 7));
  const monthOrders = orders.filter((o) => withinDays(o.createdAt, 30));

  // Best-selling items across all valid orders.
  const itemMap = new Map();
  for (const o of orders) {
    for (const it of o.items || []) {
      const cur = itemMap.get(it.name) || { name: it.name, quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      itemMap.set(it.name, cur);
    }
  }
  const bestSellers = [...itemMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 8);

  // Sales by category using the menu for product -> category lookup.
  const menu = store.getMenu();
  const catMap = new Map();
  for (const o of orders) {
    for (const it of o.items || []) {
      const product = menu.find((m) => m.id === it.productId);
      const cat = product ? product.category : 'Other';
      const cur = catMap.get(cat) || { category: cat, quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      catMap.set(cat, cur);
    }
  }
  const salesByCategory = [...catMap.values()].sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown.
  const payMap = new Map();
  for (const o of orders) {
    const cur = payMap.get(o.paymentMethod) || { method: o.paymentMethod, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += o.total || 0;
    payMap.set(o.paymentMethod, cur);
  }
  const paymentBreakdown = [...payMap.values()].sort((a, b) => b.revenue - a.revenue);

  // Last 14 days trend for the charts.
  const trend = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toDateString();
    const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === key);
    trend.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: +sum(dayOrders).toFixed(2),
      orders: dayOrders.length,
    });
  }

  res.json({
    success: true,
    data: {
      todaySales: +sum(todayOrders).toFixed(2),
      todayOrders: todayOrders.length,
      weekSales: +sum(weekOrders).toFixed(2),
      monthSales: +sum(monthOrders).toFixed(2),
      totalOrders: orders.length,
      completedOrders: completed.length,
      pendingOrders: store.getOrders().filter((o) => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length,
      averageOrderValue: orders.length ? +(sum(orders) / orders.length).toFixed(2) : 0,
      bestSellers,
      salesByCategory,
      paymentBreakdown,
      trend,
    },
  });
}
