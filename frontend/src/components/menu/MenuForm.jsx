import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { CATEGORIES } from '../../data/constants.js';
import { validateMenuItem } from '../../utils/validation.js';
import { fileToStoredDataUrl, ACCEPTED_LABEL, MAX_UPLOAD_BYTES } from '../../utils/imageUpload.js';

const blank = {
  name: '',
  category: 'Coffee',
  price: '',
  description: '',
  image: '',
  available: true,
};

export default function MenuForm({ open, onClose, onSave, initialItem, saving }) {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState([]);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialItem ? { ...blank, ...initialItem, price: String(initialItem.price) } : blank);
      setErrors([]);
    }
  }, [open, initialItem]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleImageFile = async (file) => {
    if (!file) return;
    setImgError('');
    setImgBusy(true);
    try {
      const dataUrl = await fileToStoredDataUrl(file);
      set({ image: dataUrl });
    } catch (err) {
      setImgError(err.message || `Could not load image (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`);
    } finally {
      setImgBusy(false);
    }
  };

  const clearImage = () => {
    set({ image: '' });
    setImgError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = () => {
    const payload = { ...form, price: Number(form.price) };
    const { ok, errors: errs } = validateMenuItem(payload);
    if (!ok) {
      setErrors(errs);
      return;
    }
    onSave(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialItem ? 'Edit Menu Item' : 'Add Menu Item'}
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
            disabled={saving}
            className="rounded-xl bg-coffee-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : initialItem ? 'Save Changes' : 'Add Item'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 text-xs font-semibold text-coffee-500">
          Name *
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Caramel Latte"
            className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
          />
        </label>

        <label className="text-xs font-semibold text-coffee-500">
          Category *
          <select
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-coffee-200 bg-white px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-coffee-500">
          Price (₹) *
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={(e) => set({ price: e.target.value })}
            placeholder="120"
            className="mt-1 w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
          />
        </label>

        <label className="col-span-2 text-xs font-semibold text-coffee-500">
          Description
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            placeholder="Short description shown to staff"
            className="mt-1 w-full resize-none rounded-lg border border-coffee-200 px-3 py-2 text-sm font-normal focus:border-coffee-400 focus:outline-none"
          />
        </label>

        <div className="col-span-2">
          <span className="text-xs font-semibold text-coffee-500">Image</span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleImageFile(e.dataTransfer.files?.[0]);
            }}
            className={`mt-1 rounded-xl border-2 border-dashed p-3 text-center transition ${
              dragActive ? 'border-coffee-400 bg-coffee-50' : 'border-coffee-200 bg-coffee-50/50'
            }`}
          >
            {form.image ? (
              <div className="flex items-center gap-3">
                <img
                  src={form.image}
                  alt="Menu item preview"
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold text-coffee-800">Image ready</p>
                  <p className="truncate text-[11px] text-coffee-400">
                    Stored as data URL ({Math.round(form.image.length / 1024)} KB)
                  </p>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-coffee-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-coffee-700 hover:bg-coffee-50"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                  {imgBusy && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-coffee-500">
                      <Loader2 size={11} className="animate-spin" /> Processing…
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-coffee-300 shadow-sm">
                  {imgBusy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                </div>
                <p className="text-xs text-coffee-500">
                  Drag &amp; drop an image here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-semibold text-coffee-700 underline hover:text-coffee-900"
                  >
                    browse
                  </button>
                </p>
                <p className="text-[11px] text-coffee-400">{ACCEPTED_LABEL} · auto-resized &amp; compressed</p>
                {imgBusy && (
                  <p className="text-[11px] text-coffee-500">Processing…</p>
                )}
              </div>
            )}
            {imgError && <p className="mt-2 text-[11px] font-semibold text-red-600">{imgError}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              handleImageFile(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>


        <label className="col-span-2 flex items-center gap-2 text-sm font-medium text-coffee-800">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => set({ available: e.target.checked })}
            className="h-4 w-4 accent-coffee-600"
          />
          Available for ordering
        </label>
      </div>

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
