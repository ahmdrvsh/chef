import { FridgeItem } from '../data/initialData';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'safe' | 'no_date';

export interface ExpiryAnalysis {
  status: ExpiryStatus;
  daysDifference: number | null; // negative = expired, 0 = today, positive = future days
  badgeText: string;
  badgeClass: string;
  cardBorderClass: string;
  cardBgClass: string;
}

/**
 * Analyzes an expiration date string (YYYY-MM-DD) against current date
 */
export function analyzeExpiry(expiryDateStr?: string, warningThresholdDays = 3): ExpiryAnalysis {
  if (!expiryDateStr || !expiryDateStr.trim()) {
    return {
      status: 'no_date',
      daysDifference: null,
      badgeText: 'بدون انقضا',
      badgeClass: 'text-stone-400 bg-stone-100 border-stone-200',
      cardBorderClass: 'border-stone-200/80',
      cardBgClass: 'bg-stone-50/90'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(expiryDateStr);
  target.setHours(0, 0, 0, 0);

  if (isNaN(target.getTime())) {
    return {
      status: 'no_date',
      daysDifference: null,
      badgeText: 'تاریخ نامعتبر',
      badgeClass: 'text-stone-400 bg-stone-100 border-stone-200',
      cardBorderClass: 'border-stone-200/80',
      cardBgClass: 'bg-stone-50/90'
    };
  }

  const diffMs = target.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const daysAgo = Math.abs(daysDiff);
    return {
      status: 'expired',
      daysDifference: daysDiff,
      badgeText: daysAgo === 1 ? 'منقضی شده (دیروز)' : `منقضی شده (${daysAgo} روز پیش)`,
      badgeClass: 'text-rose-800 bg-rose-100 border-rose-200 font-bold',
      cardBorderClass: 'border-rose-300',
      cardBgClass: 'bg-rose-50/70'
    };
  } else if (daysDiff === 0) {
    return {
      status: 'expiring_soon',
      daysDifference: 0,
      badgeText: 'انقضا: امروز',
      badgeClass: 'text-amber-900 bg-amber-100 border-amber-300 font-bold',
      cardBorderClass: 'border-amber-300',
      cardBgClass: 'bg-amber-50/70'
    };
  } else if (daysDiff <= warningThresholdDays) {
    return {
      status: 'expiring_soon',
      daysDifference: daysDiff,
      badgeText: `انقضا: ${daysDiff} روز دیگر`,
      badgeClass: 'text-amber-800 bg-amber-100 border-amber-200 font-bold',
      cardBorderClass: 'border-amber-200',
      cardBgClass: 'bg-amber-50/50'
    };
  } else {
    return {
      status: 'safe',
      daysDifference: daysDiff,
      badgeText: `انقضا: ${daysDiff} روز دیگر`,
      badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold',
      cardBorderClass: 'border-stone-200/80',
      cardBgClass: 'bg-white'
    };
  }
}

/**
 * Group fridge items by expiration status
 */
export function groupFridgeItemsByExpiry(items: FridgeItem[], warningThresholdDays = 3) {
  const expired: { item: FridgeItem; analysis: ExpiryAnalysis }[] = [];
  const expiringSoon: { item: FridgeItem; analysis: ExpiryAnalysis }[] = [];
  const safe: { item: FridgeItem; analysis: ExpiryAnalysis }[] = [];
  const noDate: { item: FridgeItem; analysis: ExpiryAnalysis }[] = [];

  items.forEach(item => {
    const analysis = analyzeExpiry(item.expiryDate, warningThresholdDays);
    if (analysis.status === 'expired') {
      expired.push({ item, analysis });
    } else if (analysis.status === 'expiring_soon') {
      expiringSoon.push({ item, analysis });
    } else if (analysis.status === 'safe') {
      safe.push({ item, analysis });
    } else {
      noDate.push({ item, analysis });
    }
  });

  return { expired, expiringSoon, safe, noDate };
}

/**
 * Trigger native Web Browser Notification if permitted
 */
export async function requestAndSendBrowserNotification(title: string, body: string): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  try {
    let permission = Notification.permission;
    if (permission !== 'granted' && permission !== 'denied') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        dir: 'rtl'
      });
      return true;
    }
  } catch (e) {
    console.warn('Browser notification error:', e);
  }
  return false;
}
