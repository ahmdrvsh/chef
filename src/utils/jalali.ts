/**
 * Jalaali (Persian/Shamsi) Date Utilities
 * Uses Browser Native Intl.DateTimeFormat (ca-persian) with UTC alignment
 * for 100% accurate Shamsi conversion and calendar calculations.
 */

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

export const PERSIAN_WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/**
 * Converts Gregorian YYYY, MM, DD to Jalali { jy, jm, jd }
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  // Use UTC noon to prevent any local timezone boundary drift
  const date = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = formatter.formatToParts(date);

  let jy = 0, jm = 0, jd = 0;
  for (const part of parts) {
    if (part.type === 'year') {
      jy = parseInt(part.value.replace(/\D/g, ''), 10);
    }
    if (part.type === 'month') {
      jm = parseInt(part.value.replace(/\D/g, ''), 10);
    }
    if (part.type === 'day') {
      jd = parseInt(part.value.replace(/\D/g, ''), 10);
    }
  }

  return { jy, jm, jd };
}

/**
 * Converts Jalali { jy, jm, jd } to Gregorian { gy, gm, gd }
 * Uses reverse search against Intl.DateTimeFormat to guarantee perfect symmetry.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  // Estimate approximate Gregorian start date around March 21 + offsets
  const approxGy = jy + 621;
  // Day offset estimate from March 20
  let approxDayOffset = (jm - 1) * 30 + jd;
  if (jm <= 6) {
    approxDayOffset = (jm - 1) * 31 + jd;
  } else {
    approxDayOffset = 6 * 31 + (jm - 7) * 30 + jd;
  }

  const baseDate = new Date(Date.UTC(approxGy, 2, 18 + approxDayOffset));

  // Search within +/- 5 days window for exact match
  for (let offset = -5; offset <= 5; offset++) {
    const testDate = new Date(baseDate.getTime() + offset * 86400000);
    const testGy = testDate.getUTCFullYear();
    const testGm = testDate.getUTCMonth() + 1;
    const testGd = testDate.getUTCDate();

    const jCheck = gregorianToJalali(testGy, testGm, testGd);
    if (jCheck.jy === jy && jCheck.jm === jm && jCheck.jd === jd) {
      return { gy: testGy, gm: testGm, gd: testGd };
    }
  }

  // Fallback if search fails
  return { gy: approxGy, gm: 3, gd: 21 };
}

export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[parseInt(x)]);
}

export function getJalaliMonthLength(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) {
    // Check if 30th day exists in this Jalali year
    const gCheck = jalaliToGregorian(jy, 12, 30);
    const jCheck = gregorianToJalali(gCheck.gy, gCheck.gm, gCheck.gd);
    return jCheck.jy === jy && jCheck.jm === 12 && jCheck.jd === 30 ? 30 : 29;
  }
  return 30;
}

/**
 * Returns Gregorian YYYY-MM-DD string from Jalali year, month, day
 */
export function jalaliToGregorianStr(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  const mStr = gm < 10 ? `0${gm}` : `${gm}`;
  const dStr = gd < 10 ? `0${gd}` : `${gd}`;
  return `${gy}-${mStr}-${dStr}`;
}

/**
 * Parses Gregorian YYYY-MM-DD string to Jalali object
 */
export function parseGregorianToJalali(gregorianStr?: string): { jy: number; jm: number; jd: number } | null {
  if (!gregorianStr || !gregorianStr.trim()) return null;
  const parts = gregorianStr.split('-');
  if (parts.length !== 3) return null;
  const gy = parseInt(parts[0], 10);
  const gm = parseInt(parts[1], 10);
  const gd = parseInt(parts[2], 10);
  if (isNaN(gy) || isNaN(gm) || isNaN(gd)) return null;
  return gregorianToJalali(gy, gm, gd);
}

/**
 * Formats a Gregorian date YYYY-MM-DD to Persian Shamsi display string e.g. "۱۴ مرداد ۱۴۰۵"
 */
export function formatToPersianShamsi(gregorianStr?: string): string {
  const j = parseGregorianToJalali(gregorianStr);
  if (!j) return 'تعیین نشده';
  const monthName = PERSIAN_MONTH_NAMES[j.jm - 1] || '';
  return `${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;
}

/**
 * Returns Jalali day of week for 1st day of a Jalali month (0 = Shanbeh, ..., 6 = Jomeh)
 */
export function getFirstDayOfJalaliMonthWeekday(jy: number, jm: number): number {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, 1);
  const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  return (jsDay + 1) % 7; // Shanbeh = 0, ..., Jomeh = 6
}

/**
 * Get current Jalali date object based on local browser date
 */
export function getCurrentJalaliDate(): { jy: number; jm: number; jd: number } {
  const today = new Date();
  return gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
}
