import { Recipe, Ingredient, INITIAL_INGREDIENTS } from '../data/initialData';
import { convertUnitValue, getIngredientConversions, parseQuantityNumber } from './unitConverter';

export interface NutritionResult {
  totalCalories: number;
  caloriesPer100g: number;
  totalWeightGrams: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  isDiabeticFriendly: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
}

export function getIngredientCaloriesPer100g(ingredientName: string, ingredientCategory?: string, dbIngredient?: Ingredient): number {
  if (dbIngredient && typeof dbIngredient.caloriesPer100g === 'number' && dbIngredient.caloriesPer100g > 0 && dbIngredient.caloriesPer100g !== 150) {
    return dbIngredient.caloriesPer100g;
  }
  const nutrition = getIngredientNutritionPer100g(ingredientName, ingredientCategory, dbIngredient);
  return nutrition.calories;
}

export function getIngredientNutritionPer100g(ingredientName: string, ingredientCategory?: string, dbIngredient?: Ingredient) {
  const name = (ingredientName || '').trim().toLowerCase();
  
  const c = dbIngredient?.caloriesPer100g ?? 0;
  const cb = dbIngredient?.carbsPer100g ?? 0;
  const p = dbIngredient?.proteinPer100g ?? 0;
  const f = dbIngredient?.fatPer100g ?? 0;
  let gi = dbIngredient?.glycemicIndex ?? 'low';
  const source = dbIngredient?.source ?? 'plant';

  if (c > 0 && c !== 150) {
    return { calories: c, carbs: cb, protein: p, fat: f, glycemicIndex: gi, source };
  }

  // Fallback defaults if not in db
  let cal = 60, carbs = 10, protein = 3, fat = 2;
  let src = 'plant';

  if (name.includes('روغن') || name.includes('کره')) {
    cal = 880; fat = 100; src = 'animal';
  } else if (name.includes('گوشت') || name.includes('مرغ') || name.includes('ماهی')) {
    cal = 200; protein = 24; fat = 10; src = 'animal'; gi = 'low';
  } else if (name.includes('برنج') || name.includes('نان') || name.includes('آرد')) {
    cal = 350; carbs = 75; protein = 8; fat = 1; gi = 'high';
  } else if (name.includes('سبزی') || name.includes('گوجه') || name.includes('پیاز')) {
    cal = 30; carbs = 6; protein = 1.5; fat = 0.2; gi = 'low';
  }

  return {
    calories: c > 0 ? c : cal,
    carbs: cb > 0 ? cb : carbs,
    protein: p > 0 ? p : protein,
    fat: f > 0 ? f : fat,
    glycemicIndex: gi || 'low',
    source: source || src
  };
}

function getUnitWeightInGrams(unit: string): number {
  const u = (unit || '').trim().toLowerCase();
  if (u.includes('گرم') || u === 'gr' || u === 'g') return 1;
  if (u.includes('کیلو') || u === 'kg') return 1000;
  if (u.includes('قاشق غذاخوری') || u.includes('ق.غ')) return 15;
  if (u.includes('قاشق چای‌خوری') || u.includes('ق.چ')) return 5;
  if (u.includes('پیمانه') || u.includes('لیوان')) return 240;
  if (u.includes('عدد') || u.includes('حبه') || u.includes('دسته') || u.includes('بسته')) return 100;
  return 100;
}

export function calculateRecipeNutrition(recipe: Recipe, allIngredients: Ingredient[] = INITIAL_INGREDIENTS): NutritionResult {
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    return {
      totalCalories: 0,
      caloriesPer100g: 180,
      totalWeightGrams: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      isDiabeticFriendly: true,
      isVegetarian: true,
      isVegan: false
    };
  }

  const ingList = allIngredients && allIngredients.length > 0 ? allIngredients : INITIAL_INGREDIENTS;
  let totalCalories = 0;
  let totalWeightGrams = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  let highGiCount = 0;
  let animalProductCount = 0;
  let meatCount = 0;

  for (const ing of recipe.ingredients) {
    const parsed = parseQuantityNumber(ing.amount);
    const amount = parsed.num || 1;
    const unit = ing.unit || 'گرم';

    const dbIng = ingList.find(i => i.name.trim().toLowerCase() === ing.name.trim().toLowerCase());
    const nutrition = getIngredientNutritionPer100g(ing.name, dbIng?.category, dbIng);

    let grams = 0;
    try {
      const conversions = getIngredientConversions(ing.name, unit, ingList);
      const inGrams = convertUnitValue(amount, unit, 'گرم', conversions, dbIng?.defaultUnit || 'گرم');
      if (!isNaN(inGrams) && inGrams > 0) {
        grams = inGrams;
      } else {
        grams = amount * getUnitWeightInGrams(unit);
      }
    } catch {
      grams = amount * getUnitWeightInGrams(unit);
    }

    totalWeightGrams += grams;
    totalCalories += (grams / 100) * nutrition.calories;
    totalProtein += (grams / 100) * nutrition.protein;
    totalCarbs += (grams / 100) * nutrition.carbs;
    totalFat += (grams / 100) * nutrition.fat;

    if (nutrition.glycemicIndex === 'high') {
      highGiCount++;
    }
    if (nutrition.source === 'animal') {
      animalProductCount++;
      meatCount++;
    }
  }

  const caloriesPer100g = totalWeightGrams > 0 ? Math.round((totalCalories / totalWeightGrams) * 100) : 180;
  const isDiabeticFriendly = highGiCount <= 1;
  const isVegetarian = meatCount === 0;
  const isVegan = animalProductCount === 0;

  return {
    totalCalories: Math.round(totalCalories),
    caloriesPer100g: Math.max(30, Math.min(800, Math.round(caloriesPer100g))),
    totalWeightGrams: Math.round(totalWeightGrams),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat),
    isDiabeticFriendly,
    isVegetarian,
    isVegan
  };
}
