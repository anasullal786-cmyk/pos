/**
 * Dependency-free charts (pure SVG/divs) — keeps the project light while
 * still giving the dashboard and reports real visualisations.
 */

/** Vertical bar chart for the 14-day revenue trend. */
export function BarChart({ data, formatValue }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-48 items-end gap-1.5">
      {data.map((d, i) => (
        <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
          <div className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-lg bg-coffee-900 px-2 py-1 text-xs text-cream-50 group-hover:block">
            {d.label}: {formatValue(d.value)} ({d.count} orders)
          </div>
          <div
            className="w-full rounded-t-md bg-warm-500 transition-all group-hover:bg-warm-600"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
          />
          <span className="w-full truncate text-center text-[10px] text-coffee-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars for category / payment breakdowns. */
export function HBarList({ data, formatValue }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-coffee-800">{d.label}</span>
            <span className="text-coffee-600">{formatValue(d.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-coffee-100">
            <div
              className="h-full rounded-full bg-warm-500 transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
