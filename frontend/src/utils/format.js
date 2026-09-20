/** Formatting helpers — INR-first with Indian digit grouping. */

export function formatCurrency(value, symbol = '₹') {
  const n = Number(value) || 0;
  return `${symbol}${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Short form for stat cards: ₹1,24,500 etc. */
export function formatCompactCurrency(value, symbol = '₹') {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)}Cr`;
  if (Math.abs(n) >= 100000) return `${symbol}${(n / 100000).toFixed(2)}L`;
  if (Math.abs(n) >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`;
  return formatCurrency(n, symbol);
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
