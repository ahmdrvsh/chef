export interface IngredientConversion {
  unit: string;  // Target unit e.g. "گرم", "میلی‌لیتر", "قاشق غذاخوری", "عدد بزرگ", "عدد کوچک"
  ratio: number; // How many of target unit equals 1 of defaultUnit (e.g. 1 پیمانه = 240 گرم -> ratio = 240)
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  allowedUnits?: string[];
  conversions?: IngredientConversion[];
  conversionText?: string;
  caloriesPer100g?: number;
  carbsPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  glycemicIndex?: string;
  fridgeLifeDays?: number;
  freezerLifeDays?: string | number;
  pantryLifeDays?: string | number;
  source?: string;
  isFreezable?: boolean;
  diets?: string[];
  season?: string;
  substitutes?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number | string;
  unit: string;
  type?: 'اصلی' | 'افزودنی' | 'اختیاری';
}

export interface RecipeComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface RecipeRating {
  userId: string;
  userName?: string;
  score: number; // 1 to 5
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string; // نوع غذا (سوپ، آش و خوراک، غذاهای محلی، فست‌فود،...)
  categories?: string[]; // لیست تمام دسته‌بندی‌های انتخاب شده
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'آسان' | 'متوسط' | 'سخت';
  mealType?: string; // e.g. 'ناهار'
  mealTypes?: string[]; // e.g. ['ناهار', 'شام']
  diet?: string; // e.g. 'گیاه‌خواری'
  diets?: string[]; // لیست تمام رژیم‌های غذایی انتخاب شده
  image: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips?: string; // نکات و فوت‌وفن‌های پخت
  rating?: number; // default base rating
  useAdminRating?: boolean; // toggle admin score override
  customAdminRating?: number; // score set manually by admin
  ratings?: RecipeRating[]; // list of ratings given by users
  comments?: RecipeComment[]; // list of comments posted by users
  likes?: number;
  status?: 'published' | 'pending' | 'rejected';
  submittedBy?: string;
  submittedAt?: string;
  videoUrl?: string;
}

export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string; // YYYY-MM-DD
  location?: string; // e.g. 'یخچال', 'فریزر', 'کابینت', 'انبار', 'سایر'
}

export const STORAGE_LOCATIONS = [
  'یخچال',
  'فریزر',
  'کابینت',
  'انبار',
  'سایر'
];

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  category: string;
  isBought: boolean;
  isFromFridge?: boolean; // Is it available in fridge
  fridgeQuantity?: number; // How much is in fridge
  statusText?: string; // e.g. "در یخچال موجود است"
}

export interface MealPlanDay {
  day: 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنج‌شنبه' | 'جمعه';
  breakfast?: string; // Recipe ID or text
  lunch?: string;     // Recipe ID or text
  dinner?: string;    // Recipe ID or text
  snack?: string;     // Recipe ID or text
  breakfastIds?: string[];
  lunchIds?: string[];
  dinnerIds?: string[];
  snackIds?: string[];
  servingsMap?: Record<string, number>; // Recipe ID or title -> number of servings
}

// Unified Category List and Groups for all pages
export interface SubCategoryItem {
  id: string;
  title: string;
  image: string;
  matchKeyword: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  iconName: string;
  items: SubCategoryItem[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'main-dishes',
    title: 'غذاهای اصلی (Main Dishes)',
    iconName: 'utensils',
    items: [
      {
        id: 'iranian',
        title: 'غذای ایرانی',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
        matchKeyword: 'غذای ایرانی'
      },
      {
        id: 'local',
        title: 'غذاهای محلی',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'غذاهای محلی'
      },
      {
        id: 'soup',
        title: 'سوپ',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'سوپ'
      },
      {
        id: 'ash',
        title: 'آش',
        image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'آش'
      },
      {
        id: 'khorak',
        title: 'خوراک',
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'خوراک'
      },
      {
        id: 'fastfood',
        title: 'فست‌فود',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'فست‌فود'
      },
      {
        id: 'baby-food',
        title: 'غذای کودک',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'غذای کودک'
      }
    ]
  },
  {
    id: 'appetizers-salads',
    title: 'پیش‌غذا و سالاد (Appetizers & Salads)',
    iconName: 'salad',
    items: [
      {
        id: 'salads',
        title: 'سالادها',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'سالاد'
      },
      {
        id: 'appetizers',
        title: 'پیش‌غذاها',
        image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'پیش‌غذا'
      },
      {
        id: 'quick-meals',
        title: 'حاضری‌ها',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'حاضری'
      }
    ]
  },
  {
    id: 'international',
    title: 'غذای ملل (International)',
    iconName: 'globe',
    items: [
      {
        id: 'italian',
        title: 'ایتالیایی',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'ایتالیایی'
      },
      {
        id: 'korean',
        title: 'کره‌ای',
        image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'کره‌ای'
      },
      {
        id: 'greek',
        title: 'یونانی',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'یونانی'
      },
      {
        id: 'turkish',
        title: 'ترکیه‌ای',
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'ترکیه‌ای'
      }
    ]
  },
  {
    id: 'desserts',
    title: 'دسر و شیرینی (Desserts)',
    iconName: 'cake',
    items: [
      {
        id: 'pastries',
        title: 'شیرینی‌ها',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'شیرینی'
      },
      {
        id: 'desserts-sub',
        title: 'دسرها',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'دسر'
      },
      {
        id: 'jam-sharbat',
        title: 'مربا و شربت‌ها',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'مربا و شربت'
      }
    ]
  },
  {
    id: 'drinks',
    title: 'نوشیدنی (Drinks)',
    iconName: 'coffee',
    items: [
      {
        id: 'hot-drinks',
        title: 'نوشیدنی‌های گرم',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'نوشیدنی گرم'
      },
      {
        id: 'cold-drinks',
        title: 'نوشیدنی‌های سرد',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'نوشیدنی سرد'
      }
    ]
  },
  {
    id: 'pickles-preserves',
    title: 'ترشی و مربا (Pickles & Preserves)',
    iconName: 'layers',
    items: [
      {
        id: 'pickles',
        title: 'ترشی‌ها',
        image: 'https://images.unsplash.com/photo-1589135233689-d56d7870940a?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'ترشی'
      },
      {
        id: 'jams',
        title: 'مرباها',
        image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&auto=format&fit=crop&q=80',
        matchKeyword: 'مربا'
      }
    ]
  }
];

export const CATEGORIES = [
  'همه',
  ...CATEGORY_GROUPS.flatMap(g => g.items.map(i => i.title))
];

export const MEAL_TYPES = [
  'همه',
  'صبحانه',
  'ناهار',
  'شام',
  'میان‌وعده / عصرانه',
  'افطار و سحری'
];

export const DIET_TYPES = [
  'همه',
  'معمولی',
  'گیاه‌خواری',
  'وگن (کاملاً گیاهی)',
  'کم‌کالری / رژیمی',
  'پرپروتئین',
  'بدون گلوتن',
  'کتوژنیک',
  'مناسب دیابت'
];

export const TIME_FILTERS = [
  'همه',
  'زیر ۱۵ دقیقه',
  'زیر ۳۰ دقیقه',
  'زیر ۱ ساعت',
  'بالای ۱ ساعت'
];

export const DIFFICULTIES = [
  'همه',
  'آسان',
  'متوسط',
  'سخت'
];

/**
 * Flexible & robust matching helpers to guarantee consistent filtering across all pages
 */
function normalizePersianText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[\u200c\u200d\u200e\u200f]/g, '') // Remove zero-width non-joiners/joiners
    .replace(/[\s\-_]+/g, '') // Remove all whitespace and dashes
    .replace(/[يئي]/g, 'ی') // Unify Persian Yeh
    .replace(/[ك]/g, 'ک') // Unify Persian Kaf
    .replace(/[ة]/g, 'ه')
    .replace(/[آأإ]/g, 'ا')
    .toLowerCase();
}

export function isCategoryMatch(recipe: Recipe, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'همه') return true;
  const normTarget = normalizePersianText(targetCategory);

  const allCats: string[] = [];
  if (recipe.category) allCats.push(recipe.category);
  if (Array.isArray(recipe.categories)) allCats.push(...recipe.categories);

  // 1. Direct exact or substring normalized match in categories
  const directMatch = allCats.some(c => {
    const normC = normalizePersianText(c);
    if (!normC) return false;
    return normC === normTarget || normC.includes(normTarget) || normTarget.includes(normC);
  });
  if (directMatch) return true;

  const normTitle = normalizePersianText(recipe.title || '');
  const normDesc = normalizePersianText(recipe.description || '');

  // 2. Specific category synonyms & domain groupings
  if (normTarget.includes('محلی') || normTarget.includes('سنتی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('محلی') || nc.includes('سنتی');
    }) || normTitle.includes('محلی') || normTitle.includes('سنتی') || normTitle.includes('میرزاقاسمی') || normTitle.includes('کشک') || normTitle.includes('باقلا') || normTitle.includes('دیزی') || normTitle.includes('فسنجان');
  }

  if (normTarget.includes('ایرانی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('ایرانی') || nc.includes('خورشت') || nc.includes('پلو') || nc.includes('چلو') || nc.includes('آش') || nc.includes('محلی') || nc.includes('سنتی');
    }) || normTitle.includes('خورشت') || normTitle.includes('پلو') || normTitle.includes('چلو') || normTitle.includes('قورمه') || normTitle.includes('قیمه');
  }

  if (normTarget.includes('پیشغذا') || normTarget.includes('سالاد')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('پیشغذا') || nc.includes('سالاد') || nc.includes('سوپ') || nc.includes('بورانی');
    }) || normTitle.includes('سالاد') || normTitle.includes('بورانی') || normTitle.includes('ماست') || normTitle.includes('حمص');
  }

  if (normTarget.includes('دسر') || normTarget.includes('شیرینی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('دسر') || nc.includes('شیرینی') || nc.includes('کیک') || nc.includes('حلوا') || nc.includes('شلهزرد') || nc.includes('فرنی') || nc.includes('باقلوا');
    }) || normTitle.includes('دسر') || normTitle.includes('کیک') || normTitle.includes('شیرینی') || normTitle.includes('حلوا') || normTitle.includes('شلهزرد') || normTitle.includes('فرنی');
  }

  if (normTarget.includes('نوشیدنی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('نوشیدنی') || nc.includes('شربت') || nc.includes('چای') || nc.includes('قهوه') || nc.includes('دمنوش') || nc.includes('اسموتی') || nc.includes('آبمیوه');
    }) || normTitle.includes('شربت') || normTitle.includes('چای') || normTitle.includes('قهوه') || normTitle.includes('دمنوش') || normTitle.includes('اسموتی');
  }

  if (normTarget.includes('پلو') || normTarget.includes('چلو')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('پلو') || nc.includes('چلو');
    }) || normTitle.includes('پلو') || normTitle.includes('چلو') || normTitle.includes('برنج') || normTitle.includes('تهچین');
  }

  if (normTarget.includes('خورشت') || normTarget.includes('خروش')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('خورشت') || nc.includes('خروش');
    }) || normTitle.includes('خورشت') || normTitle.includes('قورمه') || normTitle.includes('قیمه') || normTitle.includes('فسنجان') || normTitle.includes('کرفس');
  }

  if (normTarget.includes('سوپ') || normTarget.includes('اش') || normTarget.includes('خوراک')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('سوپ') || nc.includes('اش') || nc.includes('خوراک');
    }) || normTitle.includes('سوپ') || normTitle.includes('آش') || normTitle.includes('خوراک');
  }

  if (normTarget.includes('کوکو') || normTarget.includes('کتلت') || normTarget.includes('شامی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('کوکو') || nc.includes('کتلت') || nc.includes('شامی');
    }) || normTitle.includes('کوکو') || normTitle.includes('کتلت') || normTitle.includes('شامی');
  }

  if (normTarget.includes('فست') || normTarget.includes('ساندویچ') || normTarget.includes('پیتزا') || normTarget.includes('برگر')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('فست') || nc.includes('ساندویچ') || nc.includes('پیتزا') || nc.includes('برگر');
    }) || normTitle.includes('پیتزا') || normTitle.includes('برگر') || normTitle.includes('ساندویچ') || normTitle.includes('لازانیا');
  }

  if (normTarget.includes('ترشی') || normTarget.includes('مربا')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('ترشی') || nc.includes('مربا') || nc.includes('مارمالاد') || nc.includes('شور');
    }) || normTitle.includes('ترشی') || normTitle.includes('مربا') || normTitle.includes('شور');
  }

  if (normTarget.includes('ملل') || normTarget.includes('ایتالیایی') || normTarget.includes('ترکی') || normTarget.includes('کره') || normTarget.includes('یونانی')) {
    return allCats.some(c => {
      const nc = normalizePersianText(c);
      return nc.includes('ملل') || nc.includes('ایتالیایی') || nc.includes('ترکی') || nc.includes('کره') || nc.includes('یونانی');
    }) || normTitle.includes('پاستا') || normTitle.includes('پیتزا') || normTitle.includes('لازانیا') || normDesc.includes('ایتالیایی') || normDesc.includes('ملل');
  }

  return false;
}

export function isMealTypeMatch(recipe: Recipe, targetMeal: string): boolean {
  if (!targetMeal || targetMeal === 'همه') return true;
  const normTarget = normalizePersianText(targetMeal);

  const allMeals: string[] = [];
  if (recipe.mealType) allMeals.push(recipe.mealType);
  if (Array.isArray(recipe.mealTypes)) allMeals.push(...recipe.mealTypes);

  const directMatch = allMeals.some(m => {
    const normM = normalizePersianText(m);
    if (!normM) return false;
    return normM === normTarget || normM.includes(normTarget) || normTarget.includes(normM);
  });
  if (directMatch) return true;

  if (normTarget.includes('میان') || normTarget.includes('عصرانه')) {
    return allMeals.some(m => {
      const nm = normalizePersianText(m);
      return nm.includes('میان') || nm.includes('عصرانه');
    });
  }

  if (normTarget.includes('افطار') || normTarget.includes('سحر')) {
    return allMeals.some(m => {
      const nm = normalizePersianText(m);
      return nm.includes('افطار') || nm.includes('سحر');
    });
  }

  return false;
}

export function isDietMatch(recipe: Recipe, targetDiet: string): boolean {
  if (!targetDiet || targetDiet === 'همه') return true;
  const normTarget = normalizePersianText(targetDiet);

  const allDiets: string[] = [];
  if (recipe.diet) allDiets.push(recipe.diet);
  if (Array.isArray(recipe.diets)) allDiets.push(...recipe.diets);

  // 1. Direct exact or substring normalized match
  const directMatch = allDiets.some(d => {
    const normD = normalizePersianText(d);
    if (!normD) return false;
    return normD === normTarget || normD.includes(normTarget) || normTarget.includes(normD);
  });
  if (directMatch) return true;

  // 2. High-protein synonyms: پرپروتئین / پرپروتیین / پر پروتئین / پر پروتیین
  if (normTarget.includes('پروت') || normTarget.includes('پروتی') || normTarget.includes('protein')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('پروت') || nd.includes('پروتی') || nd.includes('protein');
    });
  }

  // 3. Normal / Regular diet: معمولی / عادی / استاندارد
  if (normTarget.includes('معمول') || normTarget.includes('عادی') || normTarget.includes('استاندارد') || normTarget.includes('regular')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('معمول') || nd.includes('عادی') || nd.includes('استاندارد') || nd.includes('regular');
    }) || allDiets.length === 0; // default is regular if unassigned
  }

  // 4. Vegetarian: گیاه‌خواری / گیاهخواری
  if (normTarget.includes('گیاهخوار') || normTarget.includes('vegetarian')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('گیاهخوار') || nd.includes('وگن') || nd.includes('vegetarian');
    });
  }

  // 5. Vegan: وگن / وگان / کاملا گیاهی
  if (normTarget.includes('وگن') || normTarget.includes('وگان') || normTarget.includes('کاملاگیاهی') || normTarget.includes('vegan')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('وگن') || nd.includes('وگان') || nd.includes('کاملاگیاهی') || nd.includes('vegan');
    });
  }

  // 6. Low calorie / Diet: کم‌کالری / کم کالری / رژیمی
  if (normTarget.includes('کالری') || normTarget.includes('رژیم') || normTarget.includes('lowcalorie') || normTarget.includes('diet')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('کالری') || nd.includes('رژیم') || nd.includes('lowcal');
    });
  }

  // 7. Gluten-free: بدون گلوتن / بدون‌گلوتن
  if (normTarget.includes('گلوتن') || normTarget.includes('gluten')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('گلوتن') || nd.includes('gluten');
    });
  }

  // 8. Ketogenic: کتوژنیک / کتو
  if (normTarget.includes('کتو') || normTarget.includes('keto')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('کتو') || nd.includes('keto');
    });
  }

  // 9. Diabetic: دیابت / دیابتی
  if (normTarget.includes('دیابت') || normTarget.includes('diabet')) {
    return allDiets.some(d => {
      const nd = normalizePersianText(d);
      return nd.includes('دیابت') || nd.includes('diabet');
    });
  }

  return false;
}

import { INGREDIENT_CATEGORIES, INITIAL_INGREDIENTS } from './ingredientsData';
import { ADDITIONAL_RECIPES } from './moreRecipes';
export { INGREDIENT_CATEGORIES, INITIAL_INGREDIENTS };

export const COMMON_UNITS = [
  'گرم',
  'کیلوگرم',
  'میلی‌لیتر',
  'عدد',
  'عدد بزرگ',
  'عدد کوچک',
  'پیمانه',
  'لیوان',
  'قاشق غذاخوری',
  'قاشق چای‌خوری',
  'حبه',
  'دسته',
  'بسته',
  'قوطی',
  'به مقدار لازم'
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'قورمه سبزی سنتی',
    description: 'خورشت قورمه سبزی جاافتاده با گوشت گوسفندی، لیمو عمانی و سبزی معطر ایرانی',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 124,
    ingredients: [
      { name: 'سبزی قورمه', amount: 500, unit: 'گرم', type: 'اصلی' },
      { name: 'گوشت گوسفندی', amount: 400, unit: 'گرم', type: 'اصلی' },
      { name: 'لوبیا قرمز', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'لیمو عمانی', amount: 4, unit: 'عدد', type: 'افزودنی' },
      { name: 'زردچوبه', amount: 1, unit: 'قاشق چای‌خوری', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 2, unit: 'قاشق غذاخوری', type: 'اختیاری' }
    ],
    tips: '۱. سبزی قورمه را حتماً با حرارت ملایم و روغن کافی سرخ کنید تا تیره‌رنگ شود بدون اینکه بسوزد.\n۲. لیمو عمانی‌ها را ۱ ساعت قبل سوراخ کرده و در آب گرم خیس کنید تا تلخی آن‌ها گرفته شود.\n۳. اضافه کردن یک تکه عصاره قلم یا چند قالب یخ در انتهای پخت باعث رو آمدن روغن خورشت می‌شود.',
    instructions: [
      'لوبیا قرمز را خیس کنید و جداگانه بپزید.',
      'پیازها را نگینی خرد کرده و در روغن تفت دهید تا طلایی شوند.',
      'گوشت‌های خرد شده را اضافه کرده و خوب سرخ کنید.',
      'سبزی قورمه سرخ‌شده را اضافه کرده و با ۵ لیوان آب بپزید تا خوب جا بیفتد.'
    ]
  },
  {
    id: 'r2',
    title: 'قیمه بادمجان مجلسی',
    description: 'خورشت قیمه با لپه، گوشت تکه‌ای، بادمجان‌های سرخ‌شده و زعفران فراوان',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'معمولی',
    prepTime: 25,
    cookTime: 120,
    servings: 4,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 98,
    ingredients: [
      { name: 'گوشت گوسفندی', amount: 350, unit: 'گرم', type: 'اصلی' },
      { name: 'لپه', amount: 1, unit: 'پیمانه', type: 'اصلی' },
      { name: 'پیاز', amount: 2, unit: 'عدد', type: 'اصلی' },
      { name: 'بادمجان', amount: 4, unit: 'عدد', type: 'اصلی' },
      { name: 'رب گوجه فرنگی', amount: 3, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 2, unit: 'قاشق غذاخوری', type: 'اختیاری' }
    ],
    tips: 'بادمجان‌ها را بعد از پوست کندن ۲۰ دقیقه در آب‌نمک غلیظ بگذارید تا تلخی‌شان گرفته شده و هنگام سرخ شدن روغن کمتری جذب کنند.',
    instructions: [
      'لپه را خیس کرده و نیم‌پز کنید.',
      'پیاز و گوشت را سرخ کرده، رب و ادویه‌ها را اضافه کنید.',
      'آب جوش بیفزایید تا گوشت بپزد. بادمجان‌ها را سرخ کرده و در انتهای پخت اضافه کنید.'
    ]
  },
  {
    id: 'r3',
    title: 'زرشک پلو با مرغ زعفرانی',
    description: 'مرغ مجلسی برشته با زرشک خوش‌رنگ، خلال بادام و برنج ایرانی زعفرانی',
    category: 'غذای ایرانی',
    mealType: 'ناهار',
    diet: 'پرپروتئین',
    prepTime: 20,
    cookTime: 90,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 142,
    ingredients: [
      { name: 'مرغ (سینه یا ران)', amount: 4, unit: 'عدد', type: 'اصلی' },
      { name: 'برنج', amount: 4, unit: 'پیمانه', type: 'اصلی' },
      { name: 'زرشک', amount: 1, unit: 'پیمانه', type: 'افزودنی' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری', type: 'افزودنی' },
      { name: 'خلال بادام و پسته', amount: 50, unit: 'گرم', type: 'اختیاری' }
    ],
    tips: 'زرشک را با حرارت بسیار ملایم و کمی شکر و کره تفت دهید؛ داغ شدن زیاد باعث تیره‌شدن و تلخی زرشک می‌شود.',
    instructions: [
      'مرغ را تفت داده، با رب گوجه و زعفران بپزید.',
      'برنج را آبکش کنید. زرشک را با کره و کمی شکر تفت داده و برنج را تزئین کنید.'
    ]
  },
  {
    id: 'r4',
    title: 'میرزا قاسمی گیلانی',
    description: 'میرزا قاسمی خوش‌عطر با بادمجان کبابی، سیر فراوان، گوجه فرنگی و تخم‌مرغ',
    category: 'غذاهای محلی و سنتی',
    mealType: 'شام',
    diet: 'گیاه‌خواری',
    prepTime: 20,
    cookTime: 30,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 92,
    ingredients: [
      { name: 'بادمجان', amount: 5, unit: 'عدد' },
      { name: 'گوجه فرنگی', amount: 3, unit: 'عدد' },
      { name: 'سیر', amount: 6, unit: 'حبه' },
      { name: 'تخم مرغ', amount: 3, unit: 'عدد' }
    ],
    instructions: [
      'بادمجان‌ها را کباب و ساطوری کنید.',
      'سیر را تفت داده، گوجه رنده‌شده و بادمجان را اضافه کرده و بپزید.',
      'تخم‌مرغ‌ها را روی بادمجان بشکنید تا پخته شوند.'
    ]
  },
  {
    id: 'r5',
    title: 'آش رشته اصیل ایرانی',
    description: 'آش رشته سنتی با حبوبات کامل، کشک، پیاز داغ، سیر داغ و نعناع داغ',
    category: 'سوپ، آش و خوراک',
    mealType: 'شام',
    diet: 'گیاه‌خواری',
    prepTime: 30,
    cookTime: 120,
    servings: 6,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 135,
    ingredients: [
      { name: 'رشته آشی', amount: 250, unit: 'گرم' },
      { name: 'نخود', amount: 0.5, unit: 'پیمانه' },
      { name: 'عدس', amount: 1, unit: 'پیمانه' },
      { name: 'کشک', amount: 1, unit: 'پیمانه' }
    ],
    instructions: [
      'حبوبات را بپزید، سبزی و رشته را اضافه کرده و با پیازداغ و کشک تزئین کنید.'
    ]
  },
  {
    id: 'r6',
    title: 'پیتزا مخلوط خانگی',
    description: 'پیتزای لذیذ با پنیر فراوان، قارچ، فلفل دلمه‌ای و فیله مرغ برشته',
    category: 'فست‌فود',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 20,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 160,
    ingredients: [
      { name: 'فیله مرغ', amount: 200, unit: 'گرم' },
      { name: 'قارچ', amount: 150, unit: 'گرم' },
      { name: 'پنیر پیتزا', amount: 200, unit: 'گرم' },
      { name: 'فلفل دلمه‌ای', amount: 1, unit: 'عدد' }
    ],
    instructions: [
      'خمیر پیتزا را پهن کرده، سس گوجه بزنید، مواد خرد شده را چیده و پنیر بریزید و در فر ۲۰۰ درجه بپزید.'
    ]
  },
  {
    id: 'r7',
    title: 'سالاد سزار با مرغ گریل شده',
    description: 'سالاد سزار سالم و رژیمی با کاهو رسمی، فیله مرغ گریل، نان سیر و سس مخصوص',
    category: 'سالاد',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'کم‌کالری / رژیمی',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 110,
    ingredients: [
      { name: 'کاهو', amount: 1, unit: 'عدد' },
      { name: 'فیله مرغ', amount: 250, unit: 'گرم' },
      { name: 'سیر', amount: 2, unit: 'حبه' },
      { name: 'پنیر سفید', amount: 50, unit: 'گرم' }
    ],
    instructions: [
      'فیله‌های مرغ را گریل کنید، کاهو را خرد کرده و با نان تست برشته و سس سزار سرو کنید.'
    ]
  },
  {
    id: 'r8',
    title: 'پاستا آلفردو با مرغ و قارچ',
    description: 'پاستا پنه ایتالیایی با سس خامه و سیر، قارچ تفت‌داده و تکه‌های مرغ',
    category: 'غذای ملل',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 145,
    ingredients: [
      { name: 'پاستا / ماکارونی', amount: 1, unit: 'بسته' },
      { name: 'فیله مرغ', amount: 300, unit: 'گرم' },
      { name: 'قارچ', amount: 200, unit: 'گرم' },
      { name: 'خامه', amount: 1, unit: 'بسته' },
      { name: 'سیر', amount: 3, unit: 'حبه' }
    ],
    instructions: [
      'پاستا را بپزید. مرغ و قارچ را با سیر و کره تفت داده، خامه را بیفزایید و پاستا را با آن مخلوط کنید.'
    ]
  },
  {
    id: 'r9',
    title: 'شربت زعفران و خاکشیر',
    description: 'نوشیدنی خنک و گوارای سنتی ایرانی با گلاب، زعفران دم‌کرده و خاکشیر',
    category: 'نوشیدنی سرد',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'کم‌کالری / رژیمی',
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 85,
    ingredients: [
      { name: 'زعفران دم‌کرده', amount: 3, unit: 'قاشق غذاخوری' },
      { name: 'آبلیمو', amount: 2, unit: 'قاشق غذاخوری' }
    ],
    instructions: [
      'شهد زعفران و گلاب را با آب خنک و یخ مخلوط کنید و خاکشیر شسته شده را بیفزایید.'
    ]
  },
  {
    id: 'r10',
    title: 'دمنوش به و هل زعفرانی',
    description: 'دمنوش معطر و آرام‌بخش به خشک‌شده با هل سبز و زغفران',
    category: 'نوشیدنی گرم',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'گیاه‌خواری',
    prepTime: 5,
    cookTime: 15,
    servings: 2,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 70,
    ingredients: [
      { name: 'زعفران دم‌کرده', amount: 1, unit: 'قاشق غذاخوری' }
    ],
    instructions: [
      'به خشک بو داده را همراه هل و زعفران در قوری آب جوش دم کنید.'
    ]
  },
  {
    id: 'r11',
    title: 'شله زرد مجلسی',
    description: 'دسر سنتی ایرانی با برنج نیم‌دانه، زعفران فراوان، گلاب و تزئین دارچین و خلال بادام',
    category: 'دسر',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'گیاه‌خواری',
    prepTime: 15,
    cookTime: 60,
    servings: 6,
    difficulty: 'متوسط',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
    rating: 4.9,
    likes: 130,
    ingredients: [
      { name: 'برنج', amount: 1, unit: 'پیمانه' },
      { name: 'زعفران دم‌کرده', amount: 4, unit: 'قاشق غذاخوری' }
    ],
    instructions: [
      'برنج را کاملاً بپزید تا شکفته شود، شکر و زعفران و گلاب را بیفزایید تا جا بیفتد.'
    ]
  },
  {
    id: 'r12',
    title: 'کیک یزدی سنتی',
    description: 'کیک یزدی اصیل و پف‌دار با عطر هل و گلاب و کنجد',
    category: 'کیک و شیرینی',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'معمولی',
    prepTime: 20,
    cookTime: 25,
    servings: 6,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 95,
    ingredients: [
      { name: 'تخم مرغ', amount: 3, unit: 'عدد' },
      { name: 'ماست', amount: 1, unit: 'پیمانه' }
    ],
    instructions: [
      'تخم مرغ، شکر، روغن و ماست را هم بزنید، آرد و هل اضافه کنید و در قالب‌های کیک یزدی بپزید.'
    ]
  },
  {
    id: 'r13',
    title: 'ترشی مخلوط خانگی',
    description: 'ترشی مخلوط ترد و خوش‌طعم با گل‌کلم، هویج، خیار و سرکه انگور',
    category: 'ترشی و مربا',
    mealType: 'میان‌وعده / عصرانه',
    diet: 'گیاه‌خواری',
    prepTime: 30,
    cookTime: 0,
    servings: 10,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop',
    rating: 4.7,
    likes: 65,
    ingredients: [
      { name: 'هویج', amount: 3, unit: 'عدد' },
      { name: 'خیار', amount: 3, unit: 'عدد' },
      { name: 'سیر', amount: 5, unit: 'حبه' }
    ],
    instructions: [
      'سبزیجات خرد و خشک شده را با ادویه ترشی و سرکه در ظرف شیشه‌ای بریزید.'
    ]
  },
  {
    id: 'r14',
    title: 'سالاد الویه خانگی',
    description: 'پیش‌غذای مجلسی و پرطرفدار با مرغ، سیب‌زمینی پخته، تخم‌مرغ، خیارشور و نخودفرنگی',
    category: 'پیش‌غذا',
    mealType: 'شام',
    diet: 'معمولی',
    prepTime: 30,
    cookTime: 40,
    servings: 4,
    difficulty: 'آسان',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
    rating: 4.8,
    likes: 115,
    ingredients: [
      { name: 'سیب زمینی', amount: 4, unit: 'عدد' },
      { name: 'تخم مرغ', amount: 3, unit: 'عدد' },
      { name: 'مرغ (سینه یا ران)', amount: 250, unit: 'گرم' }
    ],
    instructions: [
      'سیب‌زمینی، تخم‌مرغ و مرغ را بپزید، رنده یا خرد کنید و با سس مایونز مخلوط نمایید.'
    ]
  },
  ...ADDITIONAL_RECIPES
];

export const INITIAL_FRIDGE: FridgeItem[] = [
  { id: 'f1', name: 'برنج', quantity: 3, unit: 'پیمانه', category: 'حبوبات و غلات', location: 'کابینت' },
  { id: 'f2', name: 'پیاز', quantity: 5, unit: 'عدد', category: 'سبزیجات و صیفی‌جات', location: 'کابینت' },
  { id: 'f3', name: 'گوجه فرنگی', quantity: 4, unit: 'عدد', category: 'سبزیجات و صیفی‌جات', expiryDate: '2026-08-10', location: 'یخچال' },
  { id: 'f4', name: 'سیب زمینی', quantity: 3, unit: 'عدد', category: 'سبزیجات و صیفی‌جات', location: 'کابینت' },
  { id: 'f5', name: 'تخم مرغ', quantity: 6, unit: 'عدد', category: 'لبنیات', expiryDate: '2026-08-04', location: 'یخچال' },
  { id: 'f6', name: 'مرغ (سینه یا ران)', quantity: 500, unit: 'گرم', category: 'گوشت و مرغ و ماهی', expiryDate: '2026-08-06', location: 'یخچال' },
  { id: 'f9', name: 'گوشت گوسفندی', quantity: 400, unit: 'گرم', category: 'گوشت و مرغ و ماهی', location: 'یخچال' },
  { id: 'f10', name: 'روغن', quantity: 1, unit: 'پیمانه', category: 'روغن و چاشنی', location: 'کابینت' },
  { id: 'f7', name: 'بادمجان', quantity: 4, unit: 'عدد', category: 'سبزیجات و صیفی‌جات', location: 'یخچال' },
  { id: 'f8', name: 'قارچ', quantity: 200, unit: 'گرم', category: 'سبزیجات و صیفی‌جات', expiryDate: '2026-08-07', location: 'یخچال' }
];

export const INITIAL_MEAL_PLAN: MealPlanDay[] = [
  { day: 'شنبه', breakfastIds: [], lunchIds: ['r1'], dinnerIds: ['r4'], snackIds: [] },
  { day: 'یکشنبه', breakfastIds: [], lunchIds: ['r3'], dinnerIds: ['r6'], snackIds: [] },
  { day: 'دوشنبه', breakfastIds: [], lunchIds: ['r2'], dinnerIds: ['r8'], snackIds: [] },
  { day: 'سه‌شنبه', breakfastIds: [], lunchIds: ['r5'], dinnerIds: ['r11'], snackIds: [] },
  { day: 'چهارشنبه', breakfastIds: [], lunchIds: ['r1'], dinnerIds: ['r6'], snackIds: [] },
  { day: 'پنج‌شنبه', breakfastIds: [], lunchIds: ['r7'], dinnerIds: ['r4'], snackIds: [] },
  { day: 'جمعه', breakfastIds: [], lunchIds: ['r3'], dinnerIds: ['r10'], snackIds: [] }
];
