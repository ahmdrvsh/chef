import { FridgeItem, Ingredient, IngredientConversion } from '../data/initialData';

// Standardize Persian text for exact or soft matching
export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/آ/g, 'ا')
    .replace(/[\u064B-\u065F]/g, '') // remove diacritics
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export interface FridgeMatchResult {
  isInFridge: boolean;
  fridgeQuantity: number;
  fridgeUnit: string;
  statusText: string;
  isSufficient: boolean;
  deficitQuantity?: number | string;
}

export function matchIngredientInFridge(
  requiredName: string,
  requiredQuantity: number | string,
  requiredUnit: string,
  fridge: FridgeItem[]
): FridgeMatchResult {
  const normRequired = normalizePersianText(requiredName);

  // Find in fridge by name
  const found = fridge.find(item => {
    const normItem = normalizePersianText(item.name);
    return normItem === normRequired || normItem.includes(normRequired) || normRequired.includes(normItem);
  });

  if (!found || found.quantity <= 0) {
    return {
      isInFridge: false,
      fridgeQuantity: 0,
      fridgeUnit: requiredUnit,
      statusText: 'موجود نیست',
      isSufficient: false
    };
  }

  const fridgeQty = Number(found.quantity) || 0;
  const reqQty = Number(requiredQuantity) || 0;

  // If required quantity is not a number or 0 (like "به مقدار لازم")
  if (isNaN(reqQty) || reqQty === 0) {
    return {
      isInFridge: true,
      fridgeQuantity: fridgeQty,
      fridgeUnit: found.unit,
      statusText: 'در یخچال موجود است',
      isSufficient: true
    };
  }

  // Same unit check or simple numeric comparison
  if (fridgeQty >= reqQty) {
    return {
      isInFridge: true,
      fridgeQuantity: fridgeQty,
      fridgeUnit: found.unit,
      statusText: 'در یخچال موجود است',
      isSufficient: true
    };
  } else {
    const deficit = reqQty - fridgeQty;
    return {
      isInFridge: true,
      fridgeQuantity: fridgeQty,
      fridgeUnit: found.unit,
      statusText: `بخشی در یخچال موجود است (موجود: ${fridgeQty} ${found.unit} | کسری: ${deficit} ${requiredUnit})`,
      isSufficient: false,
      deficitQuantity: deficit
    };
  }
}

// ============================================================================
// UNIT CONVERSION ENGINE (تبدیل هوشمند واحدها با نسبت‌های دقیق)
// ============================================================================

/**
 * Standard fallbacks for common cooking units if an ingredient does not have explicit conversion ratios set.
 * Each entry maps a base unit to alternative units and their conversion ratio (1 baseUnit = ratio * altUnit).
 */
const DEFAULT_UNIT_CONVERSIONS: Record<string, IngredientConversion[]> = {
  'پیمانه': [
    { unit: 'پیمانه', ratio: 1 },
    { unit: 'گرم', ratio: 240 },
    { unit: 'میلی‌لیتر', ratio: 240 },
    { unit: 'قاشق غذاخوری', ratio: 16 },
    { unit: 'قاشق چای‌خوری', ratio: 48 },
    { unit: 'لیوان', ratio: 1 }
  ],
  'لیوان': [
    { unit: 'لیوان', ratio: 1 },
    { unit: 'پیمانه', ratio: 1 },
    { unit: 'گرم', ratio: 240 },
    { unit: 'میلی‌لیتر', ratio: 240 },
    { unit: 'قاشق غذاخوری', ratio: 16 },
    { unit: 'قاشق چای‌خوری', ratio: 48 }
  ],
  'کیلوگرم': [
    { unit: 'کیلوگرم', ratio: 1 },
    { unit: 'گرم', ratio: 1000 },
    { unit: 'عدد بزرگ', ratio: 5 },
    { unit: 'عدد', ratio: 7 },
    { unit: 'عدد کوچک', ratio: 10 }
  ],
  'کیلو': [
    { unit: 'کیلو', ratio: 1 },
    { unit: 'کیلوگرم', ratio: 1 },
    { unit: 'گرم', ratio: 1000 },
    { unit: 'عدد بزرگ', ratio: 5 },
    { unit: 'عدد', ratio: 7 },
    { unit: 'عدد کوچک', ratio: 10 }
  ],
  'گرم': [
    { unit: 'گرم', ratio: 1 },
    { unit: 'کیلوگرم', ratio: 0.001 },
    { unit: 'پیمانه', ratio: 0.00416 },
    { unit: 'قاشق غذاخوری', ratio: 0.0667 }
  ],
  'عدد': [
    { unit: 'عدد', ratio: 1 },
    { unit: 'عدد بزرگ', ratio: 0.75 },
    { unit: 'عدد کوچک', ratio: 1.5 },
    { unit: 'گرم', ratio: 150 },
    { unit: 'کیلوگرم', ratio: 0.15 }
  ],
  'قاشق غذاخوری': [
    { unit: 'قاشق غذاخوری', ratio: 1 },
    { unit: 'قاشق چای‌خوری', ratio: 3 },
    { unit: 'میلی‌لیتر', ratio: 15 },
    { unit: 'گرم', ratio: 15 },
    { unit: 'پیمانه', ratio: 0.0625 }
  ],
  'قاشق چای‌خوری': [
    { unit: 'قاشق چای‌خوری', ratio: 1 },
    { unit: 'قاشق غذاخوری', ratio: 0.3333 },
    { unit: 'میلی‌لیتر', ratio: 5 },
    { unit: 'گرم', ratio: 5 }
  ],
  'میلی‌لیتر': [
    { unit: 'میلی‌لیتر', ratio: 1 },
    { unit: 'گرم', ratio: 1 },
    { unit: 'پیمانه', ratio: 0.00416 },
    { unit: 'قاشق غذاخوری', ratio: 0.0667 },
    { unit: 'قاشق چای‌خوری', ratio: 0.2 }
  ]
};

/**
 * Normalizes unit strings for flexible comparison (e.g., 'کیلو' vs 'کیلوگرم', 'گرم' vs 'گرمی')
 */
export function normalizeUnitName(unit: string): string {
  if (!unit) return '';
  const u = unit.trim().toLowerCase();
  if (u === 'کیلو' || u === 'کیلوگرم' || u === 'کیلو گرم') return 'کیلوگرم';
  if (u === 'گرمی' || u === 'گرم') return 'گرم';
  if (u === 'پیمانه' || u === 'لیوان') return 'پیمانه';
  if (u === 'قاشق غذاخوری' || u === 'قاشق غذا خوری' || u === 'ق.غ') return 'قاشق غذاخوری';
  if (u === 'قاشق چای‌خوری' || u === 'قاشق چای خوری' || u === 'ق.چ') return 'قاشق چای‌خوری';
  if (u === 'میلی لیتر' || u === 'سی سی' || u === 'سی‌سی') return 'میلی‌لیتر';
  return u;
}

/**
 * Gets all logical units and their conversion ratios for a given ingredient.
 */
export function getIngredientConversions(
  ingredientName: string,
  currentUnit: string,
  ingredientsList?: Ingredient[]
): IngredientConversion[] {
  const normName = normalizePersianText(ingredientName);
  const matchedIng = ingredientsList?.find(i => normalizePersianText(i.name) === normName);

  const baseUnit = matchedIng?.defaultUnit || currentUnit || 'عدد';
  let conversions: IngredientConversion[] = [];

  if (matchedIng?.conversions && matchedIng.conversions.length > 0) {
    conversions = [...matchedIng.conversions];
    // Ensure base unit is included
    if (!conversions.some(c => c.unit === baseUnit)) {
      conversions.unshift({ unit: baseUnit, ratio: 1 });
    }
  } else {
    const fallback = DEFAULT_UNIT_CONVERSIONS[baseUnit] || DEFAULT_UNIT_CONVERSIONS[currentUnit] || [
      { unit: currentUnit, ratio: 1 },
      { unit: 'گرم', ratio: 100 },
      { unit: 'عدد', ratio: 1 }
    ];
    conversions = [...fallback];
  }

  // Always ensure currentUnit is present in conversions if not yet
  if (!conversions.some(c => c.unit === currentUnit)) {
    conversions.push({ unit: currentUnit, ratio: 1 });
  }

  return conversions;
}

/**
 * Converts a numeric quantity from `fromUnit` to `toUnit` based on specified or default conversion ratios.
 */
export function convertUnitValue(
  numericAmount: number,
  fromUnit: string,
  toUnit: string,
  conversions: IngredientConversion[],
  defaultUnit: string
): number {
  if (isNaN(numericAmount) || fromUnit === toUnit) {
    return numericAmount;
  }

  // Find ratio of fromUnit relative to defaultUnit
  let fromRatio = 1;
  if (fromUnit !== defaultUnit) {
    const foundFrom = conversions.find(c => c.unit === fromUnit || normalizeUnitName(c.unit) === normalizeUnitName(fromUnit));
    if (foundFrom && foundFrom.ratio > 0) {
      fromRatio = foundFrom.ratio;
    }
  }

  // Find ratio of toUnit relative to defaultUnit
  let toRatio = 1;
  if (toUnit !== defaultUnit) {
    const foundTo = conversions.find(c => c.unit === toUnit || normalizeUnitName(c.unit) === normalizeUnitName(toUnit));
    if (foundTo && foundTo.ratio > 0) {
      toRatio = foundTo.ratio;
    }
  }

  // Conversion formula:
  // 1. Convert amount to defaultUnit: amountInDefault = numericAmount / fromRatio
  // 2. Convert defaultUnit to toUnit: amountInTo = amountInDefault * toRatio
  const amountInDefault = numericAmount / fromRatio;
  const result = amountInDefault * toRatio;

  // Round to max 2 decimal places cleanly
  return Math.round(result * 100) / 100;
}

/**
 * Parses quantity string or number into a clean number.
 * Example: "0.3", "۳.۵", "3 کیلو" -> 0.3, 3.5, 3
 */
export function parseQuantityNumber(rawQty: number | string): { num: number; unitSuffix?: string } {
  if (typeof rawQty === 'number') return { num: rawQty };
  if (!rawQty) return { num: 1 };

  // Convert Persian numbers to English
  const englishNumStr = rawQty
    .toString()
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/,/g, '.');

  const match = englishNumStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    return { num: isNaN(num) ? 1 : num };
  }

  return { num: 1 };
}
