import { ImageOff, Clock } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../utils/format.js';

export default function MenuCard({ item, currencySymbol, onAdd }) {
  const disabled = !item.available;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;

  return (
    <button
      onClick={() => !disabled && onAdd(item)}
      disabled={disabled}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
        disabled
          ? 'cursor-not-allowed border-coffee-100 opacity-60'
          : 'border-coffee-100 hover:-translate-y-0.5 hover:border-coffee-300 hover:shadow-md active:translate-y-0'
      }`}
    >
      <div className="relative h-24 w-full overflow-hidden bg-coffee-100">
        {showImage ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-coffee-300">
            <ImageOff size={24} />
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-coffee-900/60 text-xs font-semibold text-white">
            <Clock size={12} /> Unavailable
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-coffee-900">{item.name}</p>
        <p className="text-[11px] uppercase tracking-wide text-coffee-400">{item.category}</p>
        <p className="mt-auto text-sm font-bold text-coffee-700">{formatCurrency(item.price, currencySymbol)}</p>
      </div>
    </button>
  );
}
