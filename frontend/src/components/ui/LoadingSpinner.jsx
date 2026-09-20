import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <Loader2 size={32} className="animate-spin text-coffee-500" />
      <p className="text-sm text-coffee-600">{label}</p>
    </div>
  );
}
