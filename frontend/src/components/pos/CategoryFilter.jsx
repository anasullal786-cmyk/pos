import { CATEGORIES } from '../../data/constants.js';

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="nice-scroll flex gap-2 overflow-x-auto pb-1">
      {['All', ...CATEGORIES].map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            active === cat
              ? 'border-coffee-600 bg-coffee-600 text-white'
              : 'border-coffee-200 bg-white text-coffee-700 hover:border-coffee-400'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
