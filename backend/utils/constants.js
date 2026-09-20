/**
 * Shared seed data used to initialise a fresh installation.
 * The backend uses this for the API; the frontend uses the same shape
 * for its localStorage fallback so both sides stay consistent.
 */

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

export const DEFAULT_TAX_PERCENT = 5;
