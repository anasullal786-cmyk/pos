export default function StatCard({ icon: Icon, label, value, sub, tone = 'coffee' }) {
  const tones = {
    coffee: 'bg-coffee-600',
    warm: 'bg-warm-500',
    leaf: 'bg-leaf-600',
    blue: 'bg-blue-600',
    violet: 'bg-violet-600',
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${tones[tone] || tones.coffee}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-coffee-400">{label}</p>
        <p className="truncate text-xl font-bold text-coffee-900">{value}</p>
        {sub && <p className="truncate text-xs text-coffee-500">{sub}</p>}
      </div>
    </div>
  );
}
