export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-6 py-12 text-center">
      {Icon && <Icon size={40} className="text-coffee-300" />}
      <h3 className="mt-1 text-base font-semibold text-coffee-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-coffee-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
