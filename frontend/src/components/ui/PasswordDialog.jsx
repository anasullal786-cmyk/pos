import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import Modal from './Modal.jsx';
import { MANAGER_PASSWORD } from '../../data/constants.js';

/**
 * Confirmation dialog protected by the manager password.
 * Used for destructive billing actions (cancelling / deleting bills).
 * The confirm callback only runs when the correct password is entered.
 */
export default function PasswordDialog({
  open,
  onClose,
  onConfirm,
  title = 'Password required',
  message = 'Enter the manager password to continue.',
  confirmLabel = 'Confirm',
  danger = true,
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fresh state each time the dialog opens.
  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [open]);

  const submit = () => {
    if (password === MANAGER_PASSWORD) {
      onConfirm?.();
      onClose?.();
    } else {
      setError('Incorrect password. Action not performed.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-xl border border-coffee-200 px-4 py-2 text-sm font-medium text-coffee-700 transition hover:bg-coffee-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-coffee-600 hover:bg-coffee-700'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm leading-relaxed text-coffee-700">{message}</p>
        </div>

        <label className="text-xs font-semibold text-coffee-500">
          <span className="flex items-center gap-1.5">
            <Lock size={13} /> Manager password *
          </span>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoFocus
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="Enter password"
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 pr-10 text-sm font-normal text-coffee-900 focus:border-coffee-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-coffee-400 transition hover:text-coffee-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
