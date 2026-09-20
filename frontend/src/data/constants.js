/** Frontend constants — mirrors backend/utils/constants.js. */

/**
 * Manager password gate for destructive billing actions
 * (cancelling / deleting bills). NOTE: this is a client-side check only —
 * it stops accidental taps, not determined tampering.
 */
export const MANAGER_PASSWORD = 'king00';

export const CATEGORIES = [
  'Coffee',
  'Tea',
  'Cold Drinks',
  'Snacks',
  'Breakfast',
  'Desserts',
  'Meals',
  'Other',
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Other'];

export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export const TABLE_STATUSES = ['Available', 'Occupied', 'Reserved'];

export const DEFAULT_SETTINGS = {
  cafeName: 'The Daily Grind Café',
  address: '12, MG Road, Bengaluru, Karnataka 560001',
  phone: '+91 98765 43210',
  taxPercent: 5,
  currency: 'INR',
  currencySymbol: '₹',
  receiptFooter: 'Thank you for visiting! Please come again. ☕',
  defaultTableCount: 10,
};

export const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Preparing: 'bg-blue-100 text-blue-800 border-blue-200',
  Ready: 'bg-violet-100 text-violet-800 border-violet-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const TABLE_STATUS_STYLES = {
  Available: 'bg-leaf-500 border-leaf-600',
  Occupied: 'bg-warm-500 border-warm-600',
  Reserved: 'bg-blue-500 border-blue-600',
};
