import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Refrigerator,
  XCircle,
  Clock,
  Search,
  RotateCcw,
  CheckCircle2,
  Salad,
  Flame,
  Gauge,
  Utensils,
  Filter,
  Check,
  ChevronDown,
  X,
  ChefHat,
  ArrowLeft
} from 'lucide-react';
import { Recipe, FridgeItem, CATEGORIES, MEAL_TYPES, DIET_TYPES, DIFFICULTIES, TIME_FILTERS, isCategoryMatch, isMealTypeMatch, isDietMatch } from '../data/initialData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { fetchRecipes, fetchFridge } from '../db';
import { matchIngredientInFridge } from '../utils/unitConverter';

export const WhatToCookPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [shortageFilter, setShortageFilter] = useState('همه');
  const [mealTypeFilter, setMealTypeFilter] = useState('همه');
  const [dietFilter, setDietFilter] = useState('همه');
  const [difficultyFilter, setDifficultyFilter] = useState('همه');
  const [cookTimeFilter, setCookTimeFilter] = useState('همه');
  const [categoryFilter, setCategoryFilter] = useState('همه');

  // Toggle filter drawer/modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const recs = await fetchRecipes();
    const frg = await fetchFridge();
    setRecipes(recs);
    setFridge(frg);
    setLoading(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setShortageFilter('همه');
    setMealTypeFilter('همه');
    setDietFilter('همه');
    setDifficultyFilter('همه');
    setCookTimeFilter('همه');
    setCategoryFilter('همه');
  };

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    shortageFilter !== 'همه' ||
    mealTypeFilter !== 'همه' ||
    dietFilter !== 'همه' ||
    difficultyFilter !== 'همه' ||
    cookTimeFilter !== 'همه' ||
    categoryFilter !== 'همه';

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    shortageFilter !== 'همه',
    mealTypeFilter !== 'همه',
    dietFilter !== 'همه',
    difficultyFilter !== 'همه',
    cookTimeFilter !== 'همه',
    categoryFilter !== 'همه'
  ].filter(Boolean).length;

  // Calculate matching stats for each recipe
  const scoredRecipes = recipes
    .map(recipe => {
      let availableCount = 0;
      const totalCount = recipe.ingredients.length;

      const ingredientAnalysis = recipe.ingredients.map(ing => {
        const match = matchIngredientInFridge(ing.name, ing.amount, ing.unit, fridge);
        if (match.isInFridge) availableCount++;
        return {
          ...ing,
          match
        };
      });

      const missingIngredients = ingredientAnalysis.filter(item => !item.match.isInFridge);
      const matchPercentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

      return {
        recipe,
        availableCount,
        totalCount,
        matchPercentage,
        missingIngredients
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Filter scored recipes based on top filters
  const filteredRecipes = scoredRecipes.filter(({ recipe, missingIngredients }) => {
    // 0. Shortage / Fridge Inventory Filter
    if (shortageFilter === '۱۰۰٪ موجود در یخچال' && missingIngredients.length > 0) return false;
    if (shortageFilter === 'حداکثر ۱ قلم کسری' && missingIngredients.length > 1) return false;
    if (shortageFilter === 'حداکثر ۲ قلم کسری' && missingIngredients.length > 2) return false;
    if (shortageFilter === 'حداکثر ۳ قلم کسری' && missingIngredients.length > 3) return false;

    // 1. Text Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch = recipe.title.toLowerCase().includes(q);
      const descMatch = recipe.description?.toLowerCase().includes(q);
      const ingMatch = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !ingMatch) return false;
    }

    // 2. Meal Type Filter
    if (!isMealTypeMatch(recipe, mealTypeFilter)) return false;

    // 3. Diet Filter
    if (!isDietMatch(recipe, dietFilter)) return false;

    // 4. Difficulty Filter
    if (difficultyFilter !== 'همه' && recipe.difficulty !== difficultyFilter) return false;

    // 5. Cook/Prep Time Filter
    if (cookTimeFilter !== 'همه') {
      const totalMinutes = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      if ((cookTimeFilter === 'زیر ۱۵ دقیقه' || cookTimeFilter === 'تا ۱۵ دقیقه') && totalMinutes > 15) return false;
      if ((cookTimeFilter === 'زیر ۳۰ دقیقه' || cookTimeFilter === 'تا ۳۰ دقیقه') && totalMinutes > 30) return false;
      if ((cookTimeFilter === 'زیر ۱ ساعت' || cookTimeFilter === 'تا ۶۰ دقیقه') && totalMinutes > 60) return false;
      if ((cookTimeFilter === 'بالای ۱ ساعت' || cookTimeFilter === 'بیش از ۶۰ دقیقه') && totalMinutes <= 60) return false;
    }

    // 6. Category Filter
    if (!isCategoryMatch(recipe, categoryFilter)) return false;

    return true;
  });

  // Top 3 Hero recommendations and the remaining recipes
  const top3Recipes = filteredRecipes.slice(0, 3);
  const remainingRecipes = filteredRecipes.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* ================= COMPACT HEADER WITH SEARCH/FILTER TRIGGER ================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs p-3.5 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-stone-900 truncate">
              چی بپزم؟
            </h1>
            <p className="text-xs text-stone-500 font-medium truncate">
              پیشنهاد هوشمند بر اساس <span className="font-extrabold text-emerald-800">{fridge.length} قلم</span> موجود در یخچال
            </p>
          </div>
        </div>

        {/* Action icons & Filter trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/fridge"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200/70 text-stone-700 rounded-xl text-xs font-bold transition-all min-h-[44px]"
            title="مدیریت یخچال"
          >
            <Refrigerator className="w-4 h-4 text-emerald-700" />
            <span>یخچال ({fridge.length})</span>
          </Link>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all min-h-[44px] min-w-[44px] cursor-pointer shadow-xs active:scale-95 ${
              isFilterOpen || isAnyFilterActive
                ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
            title="جستجو و فیلترها"
            aria-label="جستجو و فیلترها"
          >
            <Search className="w-4 h-4" />
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">فیلتر و جستجو</span>
            {activeFiltersCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {isAnyFilterActive && (
            <button
              onClick={handleResetFilters}
              title="پاک‌سازی فیلترها"
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Empty Fridge Alert if no ingredients */}
      {fridge.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-center text-amber-900 space-y-2">
          <p className="font-bold text-xs sm:text-sm">یخچال شما هنوز خالی است!</p>
          <p className="text-[11px] text-amber-700">برای پیشنهاد دقیق‌تر، ابتدا مواد موجود در یخچال را ثبت کنید.</p>
          <Link to="/fridge" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs min-h-[44px]">
            <Refrigerator className="w-4 h-4" />
            <span>ورود به موجودی یخچال</span>
          </Link>
        </div>
      )}

      {/* ================= EXPANDABLE FILTER & SEARCH DRAWER ================= */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-lg p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-stone-800">جستجو و فیلترهای هوشمند غذا</h3>
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar inside drawer */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی نام غذا یا ماده اولیه..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Detailed Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 0. میزان موجودی مواد اولیه */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>موجودی یخچال</span>
              </label>
              <select
                value={shortageFilter}
                onChange={e => setShortageFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                <option value="همه">همه پیشنهادات</option>
                <option value="۱۰۰٪ موجود در یخچال">۱۰۰٪ موجود در یخچال</option>
                <option value="حداکثر ۱ قلم کسری">یک قلم کسری</option>
                <option value="حداکثر ۲ قلم کسری">دو قلم کسری</option>
                <option value="حداکثر ۳ قلم کسری">سه قلم کسری</option>
              </select>
            </div>

            {/* 1. وعده غذایی */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-emerald-700" />
                <span>وعده غذایی</span>
              </label>
              <select
                value={mealTypeFilter}
                onChange={e => setMealTypeFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                {MEAL_TYPES.map(m => (
                  <option key={m} value={m}>
                    {m === 'همه' ? 'همه وعده‌ها' : m}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. رژیم غذایی */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Salad className="w-3 h-3 text-emerald-700" />
                <span>رژیم غذایی</span>
              </label>
              <select
                value={dietFilter}
                onChange={e => setDietFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                {DIET_TYPES.map(d => (
                  <option key={d} value={d}>
                    {d === 'همه' ? 'همه رژیم‌ها' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. درجه سختی */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-indigo-600" />
                <span>درجه سختی</span>
              </label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>
                    {diff === 'همه' ? 'همه سختی‌ها' : diff}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. زمان پخت */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>زمان پخت</span>
              </label>
              <select
                value={cookTimeFilter}
                onChange={e => setCookTimeFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                {TIME_FILTERS.map(tf => (
                  <option key={tf} value={tf}>
                    {tf === 'همه' ? 'همه زمان‌ها' : tf}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. دسته‌بندی غذا */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-extrabold text-stone-500 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-600" />
                <span>دسته‌بندی غذا</span>
              </label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600 cursor-pointer min-h-[44px]"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c === 'همه' ? 'همه دسته‌ها' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs text-stone-500 font-bold">
              {filteredRecipes.length} دستور پخت منطبق
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-stone-500 hover:text-stone-800 text-xs font-bold cursor-pointer"
              >
                پاک‌کردن
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer min-h-[40px]"
              >
                مشاهده نتایج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 1: TOP 3 HERO RECOMMENDATIONS ================= */}
      {top3Recipes.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <h2 className="text-base sm:text-xl font-black text-stone-900">
                ۳ پیشنهاد برتر و شگفت‌انگیز برای شما
              </h2>
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/70">
              بیشترین تطابق با موجودی
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
            {top3Recipes.map(({ recipe, matchPercentage, missingIngredients }, idx) => {
              const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
              const isFullMatch = matchPercentage === 100;

              return (
                <Link
                  key={`hero_${recipe.id}`}
                  to={`/recipes/${recipe.id}`}
                  className="bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl relative cursor-pointer active:scale-[0.99] border-stone-200/90 hover:border-emerald-500"
                >
                  <div>
                    {/* Hero Large Appetite-Inducing Image */}
                    <div className="relative h-48 sm:h-56 md:h-52 lg:h-60 w-full bg-stone-100 overflow-hidden">
                      <ImageWithFallback loading="lazy" decoding="async" fetchpriority="low"
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Rank ribbon */}
                      <div className="absolute bottom-2.5 right-2.5 bg-stone-950/80 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>پیشنهاد #{idx + 1}</span>
                      </div>

                      {/* LARGE VIBRANT MATCH PERCENTAGE BADGE IN CORNER */}
                      <div className="absolute top-3 right-3 z-10">
                        <div
                          className={`px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xl border-2 backdrop-blur-md transition-transform group-hover:scale-105 ${
                            isFullMatch
                              ? 'bg-emerald-600 text-white border-emerald-300/80 shadow-emerald-700/30 animate-pulse'
                              : matchPercentage >= 50
                              ? 'bg-amber-500 text-white border-amber-300/80 shadow-amber-600/30'
                              : 'bg-stone-900/90 text-white border-stone-600/80'
                          }`}
                        >
                          {isFullMatch ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-100 stroke-[2.5]" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-amber-200" />
                          )}
                          <span>تطابق {matchPercentage}٪</span>
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-stone-800 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md">
                        {recipe.category || 'دستور اصلی'}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                        {recipe.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                            {recipe.description}
                          </p>
                        )}
                      </div>

                      {/* Meta Info Badges */}
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-600 flex-wrap">
                        <span className="bg-stone-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          {totalTime} دقیقه
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs ${
                            recipe.difficulty === 'آسان'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : recipe.difficulty === 'سخت'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          }`}
                        >
                          سختی: {recipe.difficulty || 'متوسط'}
                        </span>
                      </div>

                      {/* Ingredients State */}
                      <div className="pt-2 border-t border-stone-100">
                        {missingIngredients.length === 0 ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>تمام مواد در یخچال موجود است! پخت را شروع کنید.</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-stone-500 block">
                              کسری مواد اولیه ({missingIngredients.length} مورد):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {missingIngredients.slice(0, 4).map((item, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold bg-rose-50 border border-rose-200/80 text-rose-700 px-2 py-0.5 rounded-lg flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span>{item.name}</span>
                                </span>
                              ))}
                              {missingIngredients.length > 4 && (
                                <span className="text-[10px] font-bold text-stone-400 self-center">
                                  + {missingIngredients.length - 4} مورد دیگر
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="p-4 pt-0">
                    <div className="w-full py-2.5 bg-stone-900 group-hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]">
                      <ChefHat className="w-4 h-4 text-amber-300" />
                      <span>مشاهده دستور پخت و جزئیات</span>
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: REMAINING SUGGESTIONS (2-COLUMN GRID) ================= */}
      {remainingRecipes.length > 0 && (
        <div className="space-y-3 sm:space-y-4 pt-4 border-t border-stone-200/80">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-700" />
              <span>سایر پیشنهادات متناسب با یخچال شما</span>
              <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                {remainingRecipes.length} غذا
              </span>
            </h2>
          </div>

          {/* STRICT 2-COLUMN GRID AS REQUESTED */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {remainingRecipes.map(({ recipe, matchPercentage, missingIngredients }) => {
              const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
              const isFullMatch = matchPercentage === 100;

              return (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer active:scale-98"
                >
                  <div>
                    {/* Image & Match Badge */}
                    <div className="relative h-32 sm:h-44 w-full bg-stone-100 overflow-hidden">
                      <ImageWithFallback loading="lazy" decoding="async" fetchpriority="low"
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* MATCH BADGE (EMERALD FOR 100%, AMBER FOR LESS) */}
                      <div
                        className={`absolute top-2 right-2 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-black flex items-center gap-1 shadow-md border ${
                          isFullMatch
                            ? 'bg-emerald-700 text-white border-emerald-400'
                            : matchPercentage >= 50
                            ? 'bg-amber-500 text-white border-amber-300'
                            : 'bg-stone-900/80 text-white border-stone-600'
                        }`}
                      >
                        {isFullMatch ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-200" />
                        )}
                        <span>{matchPercentage}٪</span>
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-stone-800 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold shadow-2xs">
                        {recipe.category || 'دستور پخت'}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-2.5 sm:p-3.5 space-y-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-600 font-bold">
                        <span className="bg-stone-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-700" />
                          {totalTime} د
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] ${
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

                      {/* Missing Ingredients Status */}
                      <div className="pt-1.5 border-t border-stone-100">
                        {missingIngredients.length === 0 ? (
                          <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>کامل در یخچال 🎉</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {missingIngredients.slice(0, 2).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                              >
                                <XCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                <span className="truncate max-w-[70px]">{item.name}</span>
                              </span>
                            ))}
                            {missingIngredients.length > 2 && (
                              <span className="text-[9px] font-bold text-stone-400">
                                + {missingIngredients.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* No results fallback */}
      {filteredRecipes.length === 0 && (
        <div className="py-12 text-center bg-white rounded-3xl border border-stone-200/90 p-6 space-y-3">
          <Search className="w-10 h-10 text-stone-300 mx-auto stroke-1" />
          <p className="text-sm font-bold text-stone-700">هیچ دستوری با این مشخصات یافت نشد.</p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer min-h-[44px] shadow-sm transition-all"
          >
            پاک‌سازی تمام فیلترها
          </button>
        </div>
      )}
    </div>
  );
};

