import { FridgeItem, Ingredient, IngredientConversion, INITIAL_INGREDIENTS, COMMON_UNITS } from '../data/initialData';

export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/ۀ/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getIngredientConversions(ingredientName: string, unit: string, ingredientsList?: Ingredient[]): IngredientConversion[] {
  const normName = normalizePersianText(ingredientName);
  const list = ingredientsList && ingredientsList.length > 0 ? ingredientsList : INITIAL_INGREDIENTS;
  const matchedIng = list.find(i => normalizePersianText(i.name) === normName || normalizePersianText(i.name).includes(normName) || normName.includes(normalizePersianText(i.name)));
  if (matchedIng && matchedIng.conversions && matchedIng.conversions.length > 0) {
    return matchedIng.conversions;
  }
  return [];
}

export function convertUnitValue(
  value: number,
  fromUnit: string,
  toUnit: string,
  conversions: IngredientConversion[],
  defaultUnit: string = 'گرم'
): number {
  if (isNaN(value)) return 0;
  const f = (fromUnit || '').trim().toLowerCase();
  const t = (toUnit || '').trim().toLowerCase();

  if (f === t) return value;

  // Handle direct unit weight equivalents
  const unitWeights: Record<string, number> = {
    'گرم': 1,
    'g': 1,
    'gr': 1,
    'کیلوگرم': 1000,
    'kg': 1000,
    'میلی‌لیتر': 1,
    'ml': 1,
    'سی‌سی': 1,
    'لیتر': 1000,
    'قاشق غذاخوری': 15,
    'ق.غ': 15,
    'قاشق چای‌خوری': 5,
    'ق.چ': 5,
    'پیمانه': 240,
    'لیوان': 240,
    'عدد': 100,
    'حبه': 5,
    'بسته': 100,
    'دسته': 100
  };

  // If both units have standard weights, convert via grams
  let valueInGrams = value;
  if (unitWeights[f] !== undefined) {
    valueInGrams = value * unitWeights[f];
  } else {
    // Check conversions array
    const conv = conversions.find(c => 
      (c.fromUnit?.toLowerCase() === f && c.toUnit?.toLowerCase() === t) ||
      (c.unit?.toLowerCase() === f && c.toUnit?.toLowerCase() === t)
    );
    if (conv && conv.ratio) {
      return value * conv.ratio;
    }
    // Try via default unit
    const toDef = conversions.find(c => c.unit?.toLowerCase() === f || c.fromUnit?.toLowerCase() === f);
    if (toDef && toDef.ratio) {
      valueInGrams = value * toDef.ratio;
    } else {
      valueInGrams = value * (unitWeights[defaultUnit.toLowerCase()] || 100);
    }
  }

  if (unitWeights[t] !== undefined) {
    return valueInGrams / unitWeights[t];
  }

  const revConv = conversions.find(c => 
    (c.fromUnit?.toLowerCase() === t && c.toUnit?.toLowerCase() === f) ||
    (c.unit?.toLowerCase() === t && c.toUnit?.toLowerCase() === f)
  );
  if (revConv && revConv.ratio && revConv.ratio > 0) {
    return valueInGrams / revConv.ratio;
  }

  return valueInGrams / (unitWeights[defaultUnit.toLowerCase()] || 100);
}

export function matchIngredientInFridge(
  recipeIngName: string,
  recipeIngAmount: number,
  recipeIngUnit: string,
  fridgeItems: FridgeItem[],
  allIngredients: Ingredient[] = INITIAL_INGREDIENTS
): { isInFridge: boolean; isSufficient: boolean; statusText: string } {
  const normRecipeName = normalizePersianText(recipeIngName);
  
  const matchedFridgeItem = fridgeItems.find(item => {
    const normItemName = normalizePersianText(item.name);
    return normItemName === normRecipeName || normItemName.includes(normRecipeName) || normRecipeName.includes(normItemName);
  });

  if (!matchedFridgeItem) {
    return { isInFridge: false, isSufficient: false, statusText: 'موجود نیست' };
  }

  const conversions = getIngredientConversions(recipeIngName, recipeIngUnit, allIngredients);
  const dbIng = allIngredients.find(i => normalizePersianText(i.name) === normRecipeName);
  
  const fridgeAmountInGrams = convertUnitValue(matchedFridgeItem.amount, matchedFridgeItem.unit, 'گرم', conversions, dbIng?.defaultUnit || 'گرم');
  const recipeAmountInGrams = convertUnitValue(recipeIngAmount, recipeIngUnit, 'گرم', conversions, dbIng?.defaultUnit || 'گرم');

  const isSufficient = fridgeAmountInGrams >= recipeAmountInGrams;

  return {
    isInFridge: true,
    isSufficient,
    statusText: isSufficient ? 'موجود و کافی' : `موجود است (${matchedFridgeItem.amount} ${matchedFridgeItem.unit}) - کمتر از نیاز`
  };
}

export function parseQuantityNumber(amountStr: string | number): { num: number; unit?: string } {
  if (typeof amountStr === 'number') return { num: amountStr };
  if (!amountStr) return { num: 1 };

  const s = amountStr.toString().trim();
  const numMatch = s.match(/^([\d۰-۹]+(?:\.\d+)?|\d+\/\d+)/);
  if (numMatch) {
    let raw = numMatch[1];
    if (raw.includes('/')) {
      const parts = raw.split('/');
      const n = parseFloat(parts[0]);
      const d = parseFloat(parts[1]);
      if (!isNaN(n) && !isNaN(d) && d !== 0) {
        return { num: n / d };
      }
    }
    const parsed = parseFloat(raw.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()));
    if (!isNaN(parsed)) {
      return { num: parsed };
    }
  }

  const persianNumbers: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '½': '0.5', '¼': '0.25', '¾': '0.75', '⅓': '0.33', '⅔': '0.66'
  };

  let converted = s;
  for (const [k, v] of Object.entries(persianNumbers)) {
    converted = converted.replace(new RegExp(k, 'g'), v);
  }

  const match = converted.match(/([0-9.]+)/);
  if (match) {
    const num = parseFloat(match[1]);
    return { num: isNaN(num) ? 1 : num };
  }

  return { num: 1 };
}

export function getValidUnitsForIngredient(ingredientName: string, allIngredients: Ingredient[] = []): string[] {
  const name = normalizePersianText(ingredientName);
  const list = allIngredients && allIngredients.length > 0 ? allIngredients : INITIAL_INGREDIENTS;
  const dbIng = list.find(i => normalizePersianText(i.name) === name || normalizePersianText(i.name).includes(name) || name.includes(normalizePersianText(i.name)));
  
  const unitsSet = new Set<string>();

  if (dbIng) {
    if (dbIng.defaultUnit) unitsSet.add(dbIng.defaultUnit.trim());
    
    if (Array.isArray(dbIng.allowedUnits) && dbIng.allowedUnits.length > 0) {
      dbIng.allowedUnits.forEach(u => {
        if (u && u.trim()) unitsSet.add(u.trim());
      });
    } else if (typeof dbIng.allowedUnits === 'string' && (dbIng.allowedUnits as string).trim().length > 0) {
      (dbIng.allowedUnits as string).split(/،|,/).forEach(u => {
        const t = u.trim();
        if (t) unitsSet.add(t);
      });
    }

    if (dbIng.conversions && Array.isArray(dbIng.conversions)) {
      dbIng.conversions.forEach(c => {
        if (c.unit && c.unit.trim()) unitsSet.add(c.unit.trim());
        if (c.fromUnit && c.fromUnit.trim()) unitsSet.add(c.fromUnit.trim());
        if (c.toUnit && c.toUnit.trim()) unitsSet.add(c.toUnit.trim());
      });
    }
  }

  if (unitsSet.size === 0) {
    unitsSet.add('گرم');
  }

  return Array.from(unitsSet);
}
