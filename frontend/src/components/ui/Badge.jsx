import { STATUS_STYLES } from '../../data/constants.js';

export default function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-coffee-100 text-coffee-700 border-coffee-200'}`}
    >
      {status}
    </span>
  );
}
