// Helper utilities for Persian/Arabic digit normalization and mobile validation

export function normalizePersianDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰٠]/g, '0')
    .replace(/[۱١]/g, '1')
    .replace(/[۲٢]/g, '2')
    .replace(/[۳٣]/g, '3')
    .replace(/[۴٤]/g, '4')
    .replace(/[۵٥]/g, '5')
    .replace(/[۶٦]/g, '6')
    .replace(/[۷٧]/g, '7')
    .replace(/[۸٨]/g, '8')
    .replace(/[۹٩]/g, '9');
}

export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizePersianDigits(phone).trim().replace(/[\s-]/g, '');
  // Matches 09123456789 or +989123456789 or 9123456789
  return /^09\d{9}$/.test(normalized) || /^\+989\d{9}$/.test(normalized);
}

export function formatIranianMobile(phone: string): string {
  const normalized = normalizePersianDigits(phone).trim().replace(/[\s-]/g, '');
  if (normalized.startsWith('+98')) {
    return '0' + normalized.slice(3);
  }
  if (normalized.length === 10 && normalized.startsWith('9')) {
    return '0' + normalized;
  }
  return normalized;
}
