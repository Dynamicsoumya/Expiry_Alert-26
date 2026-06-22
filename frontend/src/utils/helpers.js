import { differenceInDays, format, isAfter, isBefore, addDays } from 'date-fns';

export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
};

export const getStatusFromDays = (days) => {
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring_soon';
  return 'active';
};

export const getDaysPillClass = (days) => {
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'safe';
};

export const formatDays = (days) => {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const CATEGORY_ICONS = {
  'Vendor Contract': '📄',
  'Compliance Certificate': '✅',
  'Safety Training': '🦺',
  'Insurance Policy': '🛡️',
  'Machine Inspection': '⚙️',
  'Government License': '🏛️',
  'Audit Document': '📊',
  'Other': '📁'
};

export const CATEGORY_COLORS = {
  'Vendor Contract': '#3B82F6',
  'Compliance Certificate': '#10B981',
  'Safety Training': '#F59E0B',
  'Insurance Policy': '#8B5CF6',
  'Machine Inspection': '#EF4444',
  'Government License': '#0EA5E9',
  'Audit Document': '#EC4899',
  'Other': '#6B7280'
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS);
