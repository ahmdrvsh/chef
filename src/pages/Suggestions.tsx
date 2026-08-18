import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ShoppingBag,
  Plus,
  X,
  Search,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  Clock,
  Coffee,
  Sun,
  Moon,
  Apple,
  Filter,
  Eye,
  Info,
  ChefHat,
  RotateCcw,
  Users,
  AlertTriangle,
  Flame,
  Salad,
  Gauge
} from 'lucide-react';
import { MealPlanDay, Recipe, FridgeItem, ShoppingItem, DIET_TYPES, CATEGORIES, isCategoryMatch } from '../data/initialData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { fetchMealPlan, saveMealPlan, fetchRecipes, fetchFridge, saveShoppingList, logMealHistory, fetchUserMealHistory } from '../db';
import { matchIngredientInFridge } from '../utils/unitConverter';
import { getFamilyMembersCount } from '../utils/userSettings';
import {
  AutoFillSettingsModal,
  AutoPlanSettings,
  loadAutoPlanSettings,
  saveAutoPlanSettings
} from '../components/AutoFillSettingsModal';
import { SlidersHorizontal } from 'lucide-react';

export type MealTypeKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const SuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0); // 0 = شنبه
  const [isCalculating, setIsCalculating] = useState(false);
  const [familyCount, setFamilyCount] = useState<number>(4);

  // Auto Fill Settings Modal State
  const [isAutoSettingsOpen, setIsAutoSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clear Confirmation Modal State
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Selection Modal State
  const [selectingMeal, setSelectingMeal] = useState<{
    dayIndex: number;
    mealType: MealTypeKey;
  } | null>(null);
  const [tempSelectedRecipeIds, setTempSelectedRecipeIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('مرتبط');
  const [prepTimeFilter, setPrepTimeFilter] = useState<string>('همه');
  const [cookTimeFilter, setCookTimeFilter] = useState<string>('همه');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('همه');
  const [dietFilter, setDietFilter] = useState<string>('همه');
  const [isModalFilterOpen, setIsModalFilterOpen] = useState<boolean>(false);

  // Quick Recipe Preview Modal
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
    setFamilyCount(getFamilyMembersCount());
  }, []);

  const loadData = async () => {
    const plan = await fetchMealPlan();
    const recs = await fetchRecipes();
    const frg = await fetchFridge();
    
    // Ensure all 7 days exist
    const daysOrder: MealPlanDay['day'][] = [
      'شنبه',
      'یکشنبه',
      'دوشنبه',
      'سه‌شنبه',
      'چهارشنبه',
      'پنج‌شنبه',
      'جمعه'
    ];

    const fullPlan = daysOrder.map(dayName => {
      const found = plan.find(p => p.day === dayName);
      if (found) return found;
      return { day: dayName, breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [], servingsMap: {} };
    });

    setMealPlan(fullPlan);
    setRecipes(recs);
    setFridge(frg);
  };

  // Helper to extract recipe IDs for a meal
  const getMealRecipeIds = (planDay: MealPlanDay | undefined, mealKey: MealTypeKey): string[] => {
    if (!planDay) return [];
    const idsKey = `${mealKey}Ids` as keyof MealPlanDay;
    if (Array.isArray(planDay[idsKey]) && (planDay[idsKey] as string[]).length > 0) {
      return planDay[idsKey] as string[];
    }
    const legacyVal = planDay[mealKey as keyof MealPlanDay] as string | undefined;
    if (legacyVal && typeof legacyVal === 'string' && legacyVal.trim() !== '') {
      return [legacyVal.trim()];
    }
    return [];
  };

  // Helper to resolve Recipe objects
  const getRecipesForMeal = (planDay: MealPlanDay | undefined, mealKey: MealTypeKey): Recipe[] => {
    const ids = getMealRecipeIds(planDay, mealKey);
    return ids
      .map(id => recipes.find(r => r.id === id || r.title === id))
      .filter((r): r is Recipe => r !== undefined);
  };

  // Get servings for a specific recipe on a plan day (defaulting to familyMembersCount)
  const getRecipeServings = (planDay: MealPlanDay | undefined, recipeId: string): number => {
    if (planDay?.servingsMap && planDay.servingsMap[recipeId] !== undefined) {
      return planDay.servingsMap[recipeId];
    }
    return familyCount; // Default based on family members count
  };

  // Update servings for a recipe on a plan day
  const handleUpdateRecipeServings = (
    dayIndex: number,
    recipeId: string,
    newServings: number
  ) => {
    if (newServings < 1) return;
    const updated = [...mealPlan];
    const dayObj = { ...updated[dayIndex] };
    const currentMap = { ...(dayObj.servingsMap || {}) };
    currentMap[recipeId] = newServings;
    dayObj.servingsMap = currentMap;
    updated[dayIndex] = dayObj;
    setMealPlan(updated);
    saveMealPlan(updated);
  };

  // Open the selection modal
  const handleOpenSelectModal = (mealType: MealTypeKey) => {
    const currentDayPlan = mealPlan[activeDayIndex];
    const currentIds = getMealRecipeIds(currentDayPlan, mealType);
    setSelectingMeal({ dayIndex: activeDayIndex, mealType });
    setTempSelectedRecipeIds([...currentIds]);
    handleResetModalFilters();
  };

  const handleResetModalFilters = () => {
    setSearchQuery('');
    setCategoryFilter('مرتبط');
    setPrepTimeFilter('همه');
    setCookTimeFilter('همه');
    setDifficultyFilter('همه');
    setDietFilter('همه');
  };

  // Toggle selection inside modal
  const handleToggleRecipeInModal = (recipeId: string) => {
    setTempSelectedRecipeIds(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  // Save selection from modal
  const handleSaveModalSelections = () => {
    if (!selectingMeal) return;
    const { dayIndex, mealType } = selectingMeal;
    const updated = [...mealPlan];
    const idsKey = `${mealType}Ids` as keyof MealPlanDay;

    // Ensure default servings are initialized for newly selected recipe IDs
    const dayObj = { ...updated[dayIndex] };
    const servingsMap = { ...(dayObj.servingsMap || {}) };
    tempSelectedRecipeIds.forEach(id => {
      if (servingsMap[id] === undefined) {
        servingsMap[id] = familyCount;
      }

      // Log meal choice to server history
      const rObj = recipes.find(r => r.id === id);
      logMealHistory({
        dayName: dayObj.day,
        mealType: mealType === 'breakfast' ? 'صبحانه' : mealType === 'lunch' ? 'ناهار' : mealType === 'dinner' ? 'شام' : 'میان‌وعده',
        recipeId: id,
        recipeTitle: rObj?.title || 'دستور پخت',
        category: rObj?.category || '',
        action: 'selected'
      });
    });

    updated[dayIndex] = {
      ...dayObj,
      [idsKey]: tempSelectedRecipeIds,
      [mealType]: tempSelectedRecipeIds[0] || '', // legacy fallback
      servingsMap
    };

    setMealPlan(updated);
    saveMealPlan(updated);
    setSelectingMeal(null);
  };

  // Remove single recipe from meal directly
  const handleRemoveRecipeFromMeal = (
    dayIndex: number,
    mealKey: MealTypeKey,
    recipeId: string
  ) => {
    const updated = [...mealPlan];
    const currentIds = getMealRecipeIds(updated[dayIndex], mealKey);
    const newIds = currentIds.filter(id => id !== recipeId);
    const idsKey = `${mealKey}Ids` as keyof MealPlanDay;

    const removedRecipe = recipes.find(r => r.id === recipeId);
    logMealHistory({
      dayName: updated[dayIndex].day,
      mealType: mealKey === 'breakfast' ? 'صبحانه' : mealKey === 'lunch' ? 'ناهار' : mealKey === 'dinner' ? 'شام' : 'میان‌وعده',
      recipeId,
      recipeTitle: removedRecipe?.title || 'دستور پخت',
      action: 'removed'
    });

    updated[dayIndex] = {
      ...updated[dayIndex],
      [idsKey]: newIds,
      [mealKey]: newIds[0] || ''
    };

    setMealPlan(updated);
    saveMealPlan(updated);
  };

  // Auto-fill plan based on criteria and household family diet profiles
  const handleAutoFillWeeklyPlan = async (providedSettings?: AutoPlanSettings) => {
    const settings = providedSettings || loadAutoPlanSettings(familyCount);

    // Get favorites
    const favIds: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');

    // Get user past meal choices
    let pastMealIds: string[] = [];
    try {
      const historyLogs = await fetchUserMealHistory();
      pastMealIds = historyLogs.map(l => l.recipeId).filter(Boolean);
    } catch (e) {
      console.error('Error fetching meal history for auto plan:', e);
    }

    const mealKeys: { key: MealTypeKey; typeName: string }[] = [
      { key: 'breakfast', typeName: 'صبحانه' },
      { key: 'lunch', typeName: 'ناهار' },
      { key: 'dinner', typeName: 'شام' },
      { key: 'snack', typeName: 'میان‌وعده / عصرانه' }
    ];

    const usedRecipeIdsInWeek = new Set<string>();

    const updated = mealPlan.map(day => {
      const newDay = { ...day };
      const servingsMap = { ...(newDay.servingsMap || {}) };

      mealKeys.forEach(({ key, typeName }) => {
        // If user disabled auto-fill for this specific meal type (e.g. breakfast), skip modifying this meal slot
        if (settings.includedMeals && settings.includedMeals[key] === false) {
          return;
        }

        // Target diet profiles for household
        const targetProfiles = (settings.enableMultiDietFamily && settings.familyDietProfiles.length > 0)
          ? settings.familyDietProfiles
          : [{ id: 'default', name: 'عمومی', memberCount: familyCount, dietType: settings.dietType || 'همه' }];

        const selectedIdsForMeal: string[] = [];

        targetProfiles.forEach(prof => {
          // A: Initial meal type pool
          let pool = recipes.filter(
            r => r.mealType === typeName || (r.mealTypes && r.mealTypes.includes(typeName))
          );
          if (pool.length === 0) pool = recipes;

          // B: Category Filter
          if (settings.category && settings.category !== 'همه') {
            const catMatches = pool.filter(
              r => r.category === settings.category || r.categories?.includes(settings.category)
            );
            if (catMatches.length > 0) pool = catMatches;
          }

          // C: Difficulty Filter
          if (settings.difficulty && settings.difficulty !== 'همه') {
            const diffMatches = pool.filter(r => r.difficulty === settings.difficulty);
            if (diffMatches.length > 0) pool = diffMatches;
          }

          // D: Cooking Time Filter
          if (settings.maxCookTime && settings.maxCookTime !== 'همه') {
            const cookTimeMatches = pool.filter(r => {
              const cook = Number(r.cookTime) || 0;
              if (settings.maxCookTime === 'زیر ۱۵ دقیقه') return cook <= 15;
              if (settings.maxCookTime === 'زیر ۳۰ دقیقه') return cook <= 30;
              if (settings.maxCookTime === 'زیر ۱ ساعت') return cook <= 60;
              if (settings.maxCookTime === 'بالای ۱ ساعت') return cook > 60;
              return true;
            });
            if (cookTimeMatches.length > 0) pool = cookTimeMatches;
          }

          // E: Diet Type Filter
          if (prof.dietType && prof.dietType !== 'همه') {
            const dietMatches = pool.filter(
              r => r.diet === prof.dietType || r.diets?.includes(prof.dietType)
            );
            if (dietMatches.length > 0) {
              pool = dietMatches;
            } else {
              // Fallback: search global recipe list for this diet
              const globalDietMatches = recipes.filter(
                r => r.diet === prof.dietType || r.diets?.includes(prof.dietType)
              );
              if (globalDietMatches.length > 0) pool = globalDietMatches;
            }
          }

          // F: Score & rank candidates
          const scoredPool = pool.map(r => {
            let score = 10;
            if (settings.useFavorites && favIds.includes(r.id)) {
              score += 35;
            }
            if (settings.usePastChoices && pastMealIds.includes(r.id)) {
              score += 25;
            }
            if (settings.useRandom) {
              score += Math.random() * 20;
            }
            if (usedRecipeIdsInWeek.has(r.id)) {
              score -= 15;
            }
            return { recipe: r, score };
          });

          scoredPool.sort((a, b) => b.score - a.score);

          let pickedRecipe = pool[0];
          if (scoredPool.length > 0) {
            if (settings.useRandom && scoredPool.length > 1) {
              const topCandidates = scoredPool.slice(0, Math.min(3, scoredPool.length));
              pickedRecipe = topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe;
            } else {
              pickedRecipe = scoredPool[0].recipe;
            }
          }

          if (pickedRecipe) {
            if (!selectedIdsForMeal.includes(pickedRecipe.id)) {
              selectedIdsForMeal.push(pickedRecipe.id);
            }
            usedRecipeIdsInWeek.add(pickedRecipe.id);
            servingsMap[pickedRecipe.id] = prof.memberCount || familyCount;
          }
        });

        (newDay as any)[`${key}Ids`] = selectedIdsForMeal;
        (newDay as any)[key] = selectedIdsForMeal[0] || '';
      });

      newDay.servingsMap = servingsMap;
      return newDay;
    });

    setMealPlan(updated);
    await saveMealPlan(updated);

    let toastText = 'برنامه هفتگی بر اساس تنظیمات شما چیده شد.';
    if (settings.enableMultiDietFamily) {
      toastText = 'برنامه هفتگی بر اساس رژیم متناسب اعضای خانواده چیده شد.';
    }
    setToastMessage(toastText);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset weekly plan confirm handler (No window.confirm!)
  const handleConfirmClearWeeklyPlan = () => {
    const updated = mealPlan.map(day => ({
      day: day.day,
      breakfastIds: [],
      lunchIds: [],
      dinnerIds: [],
      snackIds: [],
      breakfast: '',
      lunch: '',
      dinner: '',
      snack: '',
      servingsMap: {}
    }));
    setMealPlan(updated);
    saveMealPlan(updated);
    setShowClearConfirmModal(false);
  };

  // Calculate Shopping List (taking target servings into account!)
  const handleCalculateShoppingList = async () => {
    setIsCalculating(true);

    const neededIngredientsMap: {
      [name: string]: { amount: number; unit: string; category: string };
    } = {};

    const mealKeys: MealTypeKey[] = ['breakfast', 'lunch', 'dinner', 'snack'];

    mealPlan.forEach(day => {
      mealKeys.forEach(mealKey => {
        const ids = getMealRecipeIds(day, mealKey);
        ids.forEach(recipeId => {
          const recipe = recipes.find(r => r.id === recipeId || r.title === recipeId);
          if (recipe) {
            // Target servings chosen by user (or default family count)
            const targetServings = getRecipeServings(day, recipe.id);
            const baseServings = recipe.servings || 4;
            const ratioMultiplier = targetServings / baseServings;

            recipe.ingredients.forEach(ing => {
              const name = ing.name.trim();
              const numAmount =
                typeof ing.amount === 'number'
                  ? ing.amount
                  : parseFloat(ing.amount as string) || 1;
              
              const scaledAmount = numAmount * ratioMultiplier;

              if (neededIngredientsMap[name]) {
                neededIngredientsMap[name].amount += scaledAmount;
              } else {
                neededIngredientsMap[name] = {
                  amount: scaledAmount,
                  unit: ing.unit,
                  category: 'مواد برنامه هفتگی'
                };
              }
            });
          }
        });
      });
    });

    const computedItems: ShoppingItem[] = [];

    Object.entries(neededIngredientsMap).forEach(([name, data]) => {
      const roundedAmount = Math.round(data.amount * 10) / 10;
      const fridgeMatch = matchIngredientInFridge(name, roundedAmount, data.unit, fridge);

      if (fridgeMatch.isSufficient) {
        computedItems.push({
          id: 'shop_' + Date.now() + Math.random().toString(36).substring(2, 6),
          name,
          quantity: `${roundedAmount} ${data.unit}`,
          unit: data.unit,
          category: data.category,
          isBought: true,
          isFromFridge: true,
          fridgeQuantity: fridgeMatch.fridgeQuantity,
          statusText: 'در یخچال موجود است'
        });
      } else if (fridgeMatch.isInFridge) {
        const deficit = fridgeMatch.deficitQuantity !== undefined
          ? Math.round(fridgeMatch.deficitQuantity * 10) / 10
          : roundedAmount;
        computedItems.push({
          id: 'shop_' + Date.now() + Math.random().toString(36).substring(2, 6),
          name,
          quantity: `${deficit} ${data.unit}`,
          unit: data.unit,
          category: data.category,
          isBought: false,
          isFromFridge: true,
          fridgeQuantity: fridgeMatch.fridgeQuantity,
          statusText: `بخشی در یخچال موجود است (موجود: ${fridgeMatch.fridgeQuantity} | نیاز: ${roundedAmount})`
        });
      } else {
        computedItems.push({
          id: 'shop_' + Date.now() + Math.random().toString(36).substring(2, 6),
          name,
          quantity: `${roundedAmount} ${data.unit}`,
          unit: data.unit,
          category: data.category,
          isBought: false,
          isFromFridge: false,
          statusText: 'موجود نیست - نیاز به خرید'
        });
      }
    });

    await saveShoppingList(computedItems);
    setIsCalculating(false);
    navigate('/shopping-list');
  };

  const activeDayPlan = mealPlan[activeDayIndex];

  // Meal configurations
  const MEAL_SECTIONS: {
    key: MealTypeKey;
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
    typeName: string;
    border: string;
    bg: string;
    iconBg: string;
    text: string;
  }[] = [
    {
      key: 'breakfast',
      title: 'صبحانه',
      subtitle: 'انرژی‌بخش صبحگاهی',
      icon: Coffee,
      typeName: 'صبحانه',
      border: 'border-amber-200/80',
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-amber-900'
    },
    {
      key: 'lunch',
      title: 'ناهار',
      subtitle: 'وعده اصلی میان‌روز',
      icon: Sun,
      typeName: 'ناهار',
      border: 'border-orange-200/80',
      bg: 'bg-orange-50/50',
      iconBg: 'bg-orange-500 text-white',
      text: 'text-orange-950'
    },
    {
      key: 'dinner',
      title: 'شام',
      subtitle: 'وعده سبک یا لذیذ شبانه',
      icon: Moon,
      typeName: 'شام',
      border: 'border-stone-200',
      bg: 'bg-stone-50/70',
      iconBg: 'bg-stone-800 text-white',
      text: 'text-stone-900'
    },
    {
      key: 'snack',
      title: 'میان وعده',
      subtitle: 'عصرانه، دسر و تنقلات',
      icon: Apple,
      typeName: 'میان‌وعده / عصرانه',
      border: 'border-emerald-200/80',
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-600 text-white',
      text: 'text-emerald-950'
    }
  ];

  // Total items scheduled for a day
  const getDayTotalRecipesCount = (planDay: MealPlanDay | undefined): number => {
    if (!planDay) return 0;
    return (
      getMealRecipeIds(planDay, 'breakfast').length +
      getMealRecipeIds(planDay, 'lunch').length +
      getMealRecipeIds(planDay, 'dinner').length +
      getMealRecipeIds(planDay, 'snack').length
    );
  };

  // Filter recipes for modal
  const getFilteredModalRecipes = (): Recipe[] => {
    if (!selectingMeal) return [];

    return recipes.filter(r => {
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesIng = r.ingredients.some(i => i.name.toLowerCase().includes(query));
        const matchesCategory = r.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesIng && !matchesCategory) return false;
      }

      // Category filter
      if (categoryFilter === 'مرتبط') {
        let isRelated = false;
        if (selectingMeal.mealType === 'breakfast') {
          isRelated = (
            r.mealType === 'صبحانه' ||
            (r.mealTypes && r.mealTypes.includes('صبحانه')) ||
            r.category === 'پیش‌غذا و سالاد' ||
            r.title.includes('املت') ||
            r.title.includes('تخم مرغ') ||
            r.title.includes('حلیم') ||
            r.title.includes('عدسی')
          );
        } else if (selectingMeal.mealType === 'lunch') {
          isRelated = (
            r.mealType === 'ناهار' ||
            (r.mealTypes && r.mealTypes.includes('ناهار')) ||
            ['غذای ایرانی', 'غذاهای محلی و سنتی', 'فست‌فود'].includes(r.category)
          );
        } else if (selectingMeal.mealType === 'dinner') {
          isRelated = (
            r.mealType === 'شام' ||
            (r.mealTypes && r.mealTypes.includes('شام')) ||
            ['غذای ایرانی', 'سوپ، آش و خوراک', 'فست‌فود', 'پیش‌غذا و سالاد'].includes(r.category)
          );
        } else if (selectingMeal.mealType === 'snack') {
          isRelated = (
            r.mealType === 'میان‌وعده / عصرانه' ||
            (r.mealTypes && r.mealTypes.includes('میان‌وعده / عصرانه')) ||
            ['دسر و شیرینی', 'پیش‌غذا و سالاد', 'نوشیدنی'].includes(r.category)
          );
        } else {
          isRelated = true;
        }
        if (!isRelated) return false;
      } else if (categoryFilter !== 'همه') {
        if (!isCategoryMatch(r, categoryFilter)) return false;
      }

      // Prep Time Filter (زمان آماده‌سازی)
      if (prepTimeFilter !== 'همه') {
        const prep = Number(r.prepTime) || 0;
        if (prepTimeFilter === 'کمتر از ۱۵ دقیقه' && prep > 15) return false;
        if (prepTimeFilter === 'کمتر از ۳۰ دقیقه' && prep > 30) return false;
        if (prepTimeFilter === 'کمتر از ۶۰ دقیقه' && prep > 60) return false;
      }

      // Cook Time Filter (زمان پخت)
      if (cookTimeFilter !== 'همه') {
        const cook = Number(r.cookTime) || 0;
        if (cookTimeFilter === 'کمتر از ۱۵ دقیقه' && cook > 15) return false;
        if (cookTimeFilter === 'کمتر از ۳۰ دقیقه' && cook > 30) return false;
        if (cookTimeFilter === 'کمتر از ۶۰ دقیقه' && cook > 60) return false;
        if (cookTimeFilter === 'بیش از ۶۰ دقیقه' && cook <= 60) return false;
      }

      // Difficulty Filter (درجه سختی)
      if (difficultyFilter !== 'همه') {
        if (r.difficulty !== difficultyFilter) return false;
      }

      // Diet Filter (رژیم غذایی)
      if (dietFilter !== 'همه') {
        const matchesSingle = r.diet === dietFilter;
        const matchesMulti = r.diets && r.diets.includes(dietFilter);
        if (!matchesSingle && !matchesMulti) return false;
      }

      return true;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-8 space-y-2.5 sm:space-y-6 pb-24 sm:pb-20 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-500 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. BANNER ================= */}
      {/* Mobile Ultra-Compact Action Bar */}
      <div className="md:hidden bg-emerald-50/80 p-2 rounded-2xl border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
        <button
          onClick={() => handleAutoFillWeeklyPlan()}
          className="flex-1 py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>پیشنهاد خودکار</span>
        </button>

        <button
          onClick={() => setIsAutoSettingsOpen(true)}
          className="p-2 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
          title="تنظیمات پیشنهاد"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
        </button>

        <button
          onClick={() => setShowClearConfirmModal(true)}
          className="p-2 bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 font-bold text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
          title="پاک‌سازی همه روزها"
        >
          <RotateCcw className="w-4 h-4 text-stone-400 hover:text-rose-600" />
        </button>

        <button
          onClick={handleCalculateShoppingList}
          disabled={isCalculating}
          className="flex-1 py-2 px-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          {isCalculating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5" />
          )}
          <span>لیست خرید</span>
        </button>
      </div>

      {/* Desktop Full Banner */}
      <div className="hidden md:flex bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-8 text-white shadow-xl items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>برنامه‌ریزی هوشمند برنامه غذایی</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            برنامه هفتگی غذای خانواده
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            غذاهای هر روز هفته و تعداد نفرات را مشخص کنید تا سفره با کسر موادی که در یخچال خانه دارید، دقیق‌ترین لیست خرید را محاسبه کند.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => handleAutoFillWeeklyPlan()}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            title="تکمیل خودکار با دستورات پیشنهادی"
          >
            <Sparkles className="w-4 h-4" />
            <span>پیشنهاد خودکار</span>
          </button>

          <button
            onClick={() => setIsAutoSettingsOpen(true)}
            className="px-3.5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl border border-white/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            title="تنظیمات پیشرفته معیارها و رژیم‌های خانوادگی"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>تنظیمات پیشنهاد</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="px-3.5 py-3 bg-white/15 hover:bg-rose-500/40 text-white font-bold text-xs rounded-2xl border border-white/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            title="پاک‌سازی همه روزها"
          >
            <RotateCcw className="w-4 h-4" />
            <span>پاک‌سازی</span>
          </button>

          <button
            onClick={handleCalculateShoppingList}
            disabled={isCalculating}
            className="px-5 py-3.5 bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center gap-2.5 cursor-pointer"
          >
            {isCalculating ? (
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
            ) : (
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
            )}
            <span>محاسبه لیست خرید</span>
          </button>
        </div>
      </div>

      {/* ================= 2. DAYS OF WEEK TABS (پایین بنر روز های هفته) ================= */}
      <div className="space-y-2">
        <div className="hidden sm:flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-stone-800">انتخاب روز هفته</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200/80 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              تعداد نفرات پیش‌فرض: {familyCount} نفر
            </span>
            <span className="font-semibold">
              مجموع {getDayTotalRecipesCount(activeDayPlan)} دستور برای {activeDayPlan?.day}
            </span>
          </div>
        </div>

        {/* Days Tab Bar */}
        <div className="bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 shadow-inner flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {mealPlan.map((plan, idx) => {
            const isActive = idx === activeDayIndex;
            const count = getDayTotalRecipesCount(plan);

            return (
              <button
                key={plan.day}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200/60 border border-stone-200/50'
                }`}
              >
                <span>{plan.day}</span>
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. MEALS IN THE CENTER OF THE PAGE (میانه صفحه) ================= */}
      <div className="space-y-4 sm:space-y-6">
        <div className="hidden sm:flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-black text-stone-900">
              وعده‌های غذایی {activeDayPlan?.day}
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            می‌توانید چند دستور انتخاب کنید و تعداد نفرات هر دستور را جداگانه تعیین نمایید.
          </p>
        </div>

        {/* 4 Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MEAL_SECTIONS.map(meal => {
            const Icon = meal.icon;
            const selectedRecipes = getRecipesForMeal(activeDayPlan, meal.key);

            return (
              <div
                key={meal.key}
                className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border ${meal.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3`}
              >
                {/* Meal Header with Title & Plus (+) Button */}
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${meal.iconBg} flex items-center justify-center shadow-xs shrink-0`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-black ${meal.text}`}>
                        {meal.title}
                      </h4>
                      {meal.subtitle && (
                        <p className="hidden sm:block text-[11px] text-stone-400 font-medium">
                          {meal.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PLUS (+) BUTTON NEXT TO MEAL HEADING */}
                  <button
                    onClick={() => handleOpenSelectModal(meal.key)}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title={`افزودن دستور جدید به ${meal.title}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="hidden sm:inline">افزودن دستور</span>
                  </button>
                </div>

                {/* Selected Recipes List for this Meal */}
                {selectedRecipes.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedRecipes.map(recipe => {
                        const servingsCount = getRecipeServings(activeDayPlan, recipe.id);

                        return (
                          <div
                            key={recipe.id}
                            className="p-2.5 sm:p-3 bg-stone-50 hover:bg-amber-50/40 rounded-2xl border border-stone-200/80 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              {/* Recipe Thumbnail & Title & Inline Servings Counter */}
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <ImageWithFallback
                                  src={recipe.image}
                                  alt={recipe.title}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 cursor-pointer"
                                  onClick={() => setPreviewRecipe(recipe)}
                                />
                                <div className="min-w-0 flex-1">
                                  <h5
                                    onClick={() => setPreviewRecipe(recipe)}
                                    className="font-black text-xs sm:text-sm text-stone-900 truncate hover:text-amber-900 cursor-pointer"
                                  >
                                    {recipe.title}
                                  </h5>

                                  {/* Servings Counter Selector (Replaces category/diet tags) */}
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[11px] font-bold text-stone-600">
                                      تعداد نفرات:
                                    </span>
                                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-amber-300/80 shadow-2xs">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateRecipeServings(
                                            activeDayIndex,
                                            recipe.id,
                                            servingsCount - 1
                                          );
                                        }}
                                        disabled={servingsCount <= 1}
                                        className="w-5 h-5 rounded bg-stone-100 hover:bg-amber-100 disabled:opacity-30 text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                                        title="کاهش تعداد نفرات"
                                      >
                                        -
                                      </button>
                                      <span className="font-black text-xs text-amber-900 min-w-[18px] text-center">
                                        {servingsCount}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateRecipeServings(
                                            activeDayIndex,
                                            recipe.id,
                                            servingsCount + 1
                                          );
                                        }}
                                        className="w-5 h-5 rounded bg-stone-100 hover:bg-amber-100 text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                                        title="افزایش تعداد نفرات"
                                      >
                                        +
                                      </button>
                                      <span className="text-[10px] font-bold text-amber-800 mr-0.5">
                                        نفر
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons (Preview & Delete) */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewRecipe(recipe)}
                                  className="p-1.5 hover:bg-stone-200 text-stone-500 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                                  title="مشاهده دستور"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveRecipeFromMeal(
                                      activeDayIndex,
                                      meal.key,
                                      recipe.id
                                    )
                                  }
                                  className="p-1.5 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                  title="حذف از این وعده"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom summary count (Hidden on mobile for minimalism) */}
                <div className="hidden sm:flex pt-2 border-t border-stone-100 items-center justify-between text-[11px] text-stone-400 font-medium">
                  <span>تعداد دستورات این وعده:</span>
                  <span className="font-bold text-stone-700">
                    {selectedRecipes.length} مورد
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 4. CLEAR CONFIRMATION MODAL ================= */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 pb-24 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  پاک‌سازی کامل برنامه هفتگی
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  آیا مطمئن هستید؟ همه دستورات برنامه‌ریزی‌شده حذف خواهند شد.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl text-xs text-stone-600 leading-relaxed border border-stone-200/70">
              با این کار تمامی غذاهای انتخاب‌شده برای تمام روزهای هفته پاک خواهند شد و می‌توانید برنامه هفتگی را مجدداً از ابتدا تنظیم کنید.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmClearWeeklyPlan}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأیید و پاک‌سازی کامل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. RECIPE SELECTION MODAL (چند گزینه‌ای) ================= */}
      {selectingMeal && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 pb-24 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200 relative">
            
            {/* Minimal Modal Header (Orange banner hidden on mobile, close button top-left) */}
            <div className="p-3 sm:p-5 bg-stone-100 sm:bg-gradient-to-r sm:from-amber-500 sm:to-orange-500 text-stone-800 sm:text-white flex items-center justify-between border-b sm:border-0 border-stone-200">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 sm:text-white" />
                <h3 className="text-xs sm:text-lg font-black truncate max-w-[220px] sm:max-w-none">
                  دستور برای{' '}
                  {MEAL_SECTIONS.find(m => m.key === selectingMeal.mealType)?.title}{' '}
                  ({mealPlan[selectingMeal.dayIndex]?.day})
                </h3>
              </div>

              <button
                onClick={() => setSelectingMeal(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white sm:bg-white/20 hover:bg-stone-200 sm:hover:bg-white/30 text-stone-700 sm:text-white flex items-center justify-center transition-all cursor-pointer border sm:border-0 border-stone-200 shadow-2xs"
                title="بستن"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-2.5">
              {/* Search input + Filter button + Reset */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    placeholder="جستجوی غذا یا مواد اولیه..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pr-9 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setIsModalFilterOpen(!isModalFilterOpen)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isModalFilterOpen ||
                    categoryFilter !== 'مرتبط' ||
                    prepTimeFilter !== 'همه' ||
                    cookTimeFilter !== 'همه' ||
                    difficultyFilter !== 'همه' ||
                    dietFilter !== 'همه'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                  title="فیلترهای پیشرفته"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>فیلترها</span>
                </button>

                {(searchQuery.trim() !== '' ||
                  categoryFilter !== 'مرتبط' ||
                  prepTimeFilter !== 'همه' ||
                  cookTimeFilter !== 'همه' ||
                  difficultyFilter !== 'همه' ||
                  dietFilter !== 'همه') && (
                  <button
                    onClick={handleResetModalFilters}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center shrink-0"
                    title="حذف فیلترها"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Collapsible Filter Panel */}
              {isModalFilterOpen && (
                <div className="space-y-2.5 pt-2 border-t border-stone-200/80 animate-in fade-in duration-150">
                  {/* 4 Filter Dropdowns Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* 1. زمان آماده‌سازی */}
                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>آماده‌سازی</span>
                      </label>
                      <select
                        value={prepTimeFilter}
                        onChange={e => setPrepTimeFilter(e.target.value)}
                        className="w-full p-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                      >
                        <option value="همه">همه زمان‌ها</option>
                        <option value="کمتر از ۱۵ دقیقه">زیر ۱۵ دقیقه</option>
                        <option value="کمتر از ۳۰ دقیقه">زیر ۳۰ دقیقه</option>
                        <option value="کمتر از ۶۰ دقیقه">زیر ۶۰ دقیقه</option>
                      </select>
                    </div>

                    {/* 2. زمان پخت */}
                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-600" />
                        <span>زمان پخت</span>
                      </label>
                      <select
                        value={cookTimeFilter}
                        onChange={e => setCookTimeFilter(e.target.value)}
                        className="w-full p-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                      >
                        <option value="همه">همه زمان‌ها</option>
                        <option value="کمتر از ۱۵ دقیقه">زیر ۱۵ دقیقه</option>
                        <option value="کمتر از ۳۰ دقیقه">زیر ۳۰ دقیقه</option>
                        <option value="کمتر از ۶۰ دقیقه">زیر ۶۰ دقیقه</option>
                        <option value="بیش از ۶۰ دقیقه">بیش از ۶۰ دقیقه</option>
                      </select>
                    </div>

                    {/* 3. درجه سختی */}
                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-emerald-600" />
                        <span>سختی</span>
                      </label>
                      <select
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                        className="w-full p-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                      >
                        <option value="همه">همه سختی‌ها</option>
                        <option value="آسان">آسان</option>
                        <option value="متوسط">متوسط</option>
                        <option value="سخت">سخت</option>
                      </select>
                    </div>

                    {/* 4. رژیم غذایی */}
                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-700 flex items-center gap-1">
                        <Salad className="w-3 h-3 text-green-600" />
                        <span>رژیم غذایی</span>
                      </label>
                      <select
                        value={dietFilter}
                        onChange={e => setDietFilter(e.target.value)}
                        className="w-full p-1.5 bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                      >
                        {DIET_TYPES.map(d => (
                          <option key={d} value={d}>
                            {d === 'همه' ? 'همه رژیم‌ها' : d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs pt-1">
                    <button
                      onClick={() => setCategoryFilter('مرتبط')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 text-[11px] transition-colors ${
                        categoryFilter === 'مرتبط'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      مرتبط با این وعده
                    </button>
                    <button
                      onClick={() => setCategoryFilter('همه')}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 text-[11px] transition-colors ${
                        categoryFilter === 'همه'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      همه غذاها
                    </button>
                    {CATEGORIES.filter(c => c !== 'همه').map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 text-[11px] transition-colors ${
                          categoryFilter === cat
                            ? 'bg-amber-500 text-white'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recipes Grid (2 Columns on Mobile!) */}
            <div className="p-2.5 sm:p-4 overflow-y-auto flex-1 max-h-[55vh]">
              {getFilteredModalRecipes().length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                  {getFilteredModalRecipes().map(recipe => {
                    const isSelected = tempSelectedRecipeIds.includes(recipe.id);

                    return (
                      <div
                        key={recipe.id}
                        onClick={() => handleToggleRecipeInModal(recipe.id)}
                        className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative ${
                          isSelected
                            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all z-10 ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                              : 'border-stone-300 bg-white/90 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        <div className="flex items-start gap-2 min-w-0">
                          <ImageWithFallback
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0 flex-1 pl-5 sm:pl-0">
                            <h4 className="font-bold text-[11px] sm:text-xs text-stone-900 line-clamp-2 leading-tight">
                              {recipe.title}
                            </h4>
                            <p className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5 truncate">
                              {recipe.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                          <span className="inline-flex items-center gap-0.5 text-amber-800 font-semibold bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            {(recipe.prepTime || 15) + (recipe.cookTime || 30)}د
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold px-1 py-0.5 rounded ${
                              recipe.difficulty === 'آسان'
                                ? 'bg-emerald-50 text-emerald-800'
                                : recipe.difficulty === 'سخت'
                                ? 'bg-rose-50 text-rose-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {recipe.difficulty || 'متوسط'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <Search className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs font-bold">دستوری با این مشخصات یافت نشد.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                تعداد انتخاب‌شده: {tempSelectedRecipeIds.length} مورد
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectingMeal(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveModalSelections}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت و اضافه به برنامه</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. QUICK RECIPE PREVIEW MODAL ================= */}
      {previewRecipe && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 pb-24 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-48 sm:h-56">
              <ImageWithFallback
                src={previewRecipe.image}
                alt={previewRecipe.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewRecipe(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-stone-900/60 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-900">
                {previewRecipe.category}
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {previewRecipe.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {previewRecipe.description}
                </p>
              </div>

              {/* Ingredients preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 border-b border-stone-100 pb-1">
                  مواد لازم:
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {previewRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-50 p-2 rounded-xl flex items-center justify-between text-stone-700 font-medium"
                    >
                      <span>{ing.name}</span>
                      <span className="font-bold text-amber-800">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setPreviewRecipe(null);
                  navigate(`/recipes/${previewRecipe.id}`);
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all text-center"
              >
                مشاهده صفحه کامل دستور پخت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Fill Settings & Multi-Diet Household Modal */}
      <AutoFillSettingsModal
        isOpen={isAutoSettingsOpen}
        onClose={() => setIsAutoSettingsOpen(false)}
        onGenerate={handleAutoFillWeeklyPlan}
        defaultFamilyCount={familyCount}
      />
    </div>
  );
};
