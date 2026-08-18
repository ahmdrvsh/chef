import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Clock,
  Star,
  ChefHat,
  Filter,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  X
} from 'lucide-react';
import {
  Recipe,
  CATEGORIES,
  MEAL_TYPES,
  DIET_TYPES,
  TIME_FILTERS,
  DIFFICULTIES,
  isCategoryMatch,
  isMealTypeMatch,
  isDietMatch
} from '../data/initialData';
import { fetchRecipes } from '../db';
import { ImageWithFallback } from '../components/ImageWithFallback';

type SortOption = 'newest' | 'rating' | 'quickest' | 'slowest' | 'easy' | 'alphabetical' | 'fewest-ingredients';

const SORT_LABELS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'جدیدترین (پیش‌فرض)' },
  { value: 'rating', label: 'بیشترین امتیاز (محبوب‌ترین)' },
  { value: 'quickest', label: 'سریع‌ترین (کمترین زمان)' },
  { value: 'slowest', label: 'بیشترین زمان پخت' },
  { value: 'easy', label: 'آسان‌ترین درجه سختی' },
  { value: 'alphabetical', label: 'حروف الفبا (الف تا ی)' },
  { value: 'fewest-ingredients', label: 'کمترین تعداد مواد اولیه' }
];

export const CategoryFilteredRecipesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subCategoryParam = searchParams.get('sub') || '';
  const categoryTitle = searchParams.get('title') || subCategoryParam || 'دسته‌بندی';

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters within this category view
  const [selectedTime, setSelectedTime] = useState('همه');
  const [selectedDifficulty, setSelectedDifficulty] = useState('همه');
  const [selectedMealType, setSelectedMealType] = useState('همه');
  const [selectedDiet, setSelectedDiet] = useState('همه');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination (20 rows in a 2-column grid = 40 items)
  const RECIPES_PER_BATCH = 40;
  const [visibleCount, setVisibleCount] = useState(RECIPES_PER_BATCH);

  useEffect(() => {
    fetchRecipes().then(setRecipes);
    const handleUpdate = () => fetchRecipes().then(setRecipes);
    window.addEventListener('sofreh_recipes_updated', handleUpdate);
    return () => window.removeEventListener('sofreh_recipes_updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedRecipes = useMemo(() => {
    const result = recipes.filter(recipe => {
      // Must match published status
      if (recipe.status === 'pending' || recipe.status === 'rejected') {
        return false;
      }

      // Must match Sub-Category
      if (subCategoryParam) {
        const sub = subCategoryParam.trim().toLowerCase();
        const matchesCatHelper = isCategoryMatch(recipe, subCategoryParam);
        const inCat = (recipe.category || '').toLowerCase().includes(sub);
        const inCategories = (recipe.categories || []).some(c => c.toLowerCase().includes(sub) || isCategoryMatch(recipe, c));
        const inTitle = (recipe.title || '').toLowerCase().includes(sub);
        const inDesc = (recipe.description || '').toLowerCase().includes(sub);

        if (!matchesCatHelper && !inCat && !inCategories && !inTitle && !inDesc) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = recipe.title.toLowerCase().includes(q);
        const matchDesc = recipe.description?.toLowerCase().includes(q);
        const matchIng = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchIng) return false;
      }

      // Time Filter
      if (selectedTime !== 'همه') {
        const total = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        if (selectedTime === 'under_30' && total > 30) return false;
        if (selectedTime === '30_60' && (total <= 30 || total > 60)) return false;
        if (selectedTime === 'over_60' && total <= 60) return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'همه' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      // Meal Type
      if (selectedMealType !== 'همه') {
        if (!isMealTypeMatch(recipe, selectedMealType)) return false;
      }

      // Diet Type
      if (selectedDiet !== 'همه') {
        if (!isDietMatch(recipe, selectedDiet)) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        case 'rating': {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        }
        case 'quickest': {
          const timeA = (a.prepTime || 0) + (a.cookTime || 0);
          const timeB = (b.prepTime || 0) + (b.cookTime || 0);
          return timeA - timeB;
        }
        case 'slowest': {
          const timeA = (a.prepTime || 0) + (a.cookTime || 0);
          const timeB = (b.prepTime || 0) + (b.cookTime || 0);
          return timeB - timeA;
        }
        case 'easy': {
          const order: Record<string, number> = { آسان: 1, متوسط: 2, سخت: 3 };
          return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
        }
        case 'alphabetical': {
          return (a.title || '').localeCompare(b.title || '', 'fa');
        }
        case 'fewest-ingredients': {
          return (a.ingredients?.length || 0) - (b.ingredients?.length || 0);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [recipes, subCategoryParam, searchQuery, selectedTime, selectedDifficulty, selectedMealType, selectedDiet, sortBy]);

  const visibleRecipes = useMemo(() => {
    return filteredAndSortedRecipes.slice(0, visibleCount);
  }, [filteredAndSortedRecipes, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedRecipes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + RECIPES_PER_BATCH);
  };

  const handleResetFilters = () => {
    setSelectedTime('همه');
    setSelectedDifficulty('همه');
    setSelectedMealType('همه');
    setSelectedDiet('همه');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedTime !== 'همه' ||
    selectedDifficulty !== 'همه' ||
    selectedMealType !== 'همه' ||
    selectedDiet !== 'همه' ||
    Boolean(searchQuery.trim());

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Top Header: Simple Backward Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/recipes')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/80 text-stone-800 font-black text-xs sm:text-sm shadow-2xs transition-all cursor-pointer min-h-[42px] active:scale-98"
        >
          <ArrowRight className="w-4 h-4 text-emerald-700" />
          <span>بازگشت به همه دستورات</span>
        </button>
      </div>

      {/* Search & Sorting & Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`جستجو در دستورات ${categoryTitle}...`}
              className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200/90 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2.5 bg-stone-50 border border-stone-200/90 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer min-h-[42px]"
              >
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[160px]">
                    {SORT_LABELS.find(s => s.value === sortBy)?.label}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-black text-stone-400 border-b border-stone-100">
                    مرتب‌سازی بر اساس:
                  </div>
                  {SORT_LABELS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        sortBy === opt.value
                          ? 'bg-emerald-50 text-emerald-800 font-black'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer min-h-[42px] ${
                hasActiveFilters
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}
            >
              <Filter className="w-4 h-4 text-emerald-700" />
              <span>فیلترها</span>
            </button>
          </div>
        </div>

        {/* Desktop / Expanded Filter Pills */}
        <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block pt-3 border-t border-stone-100 space-y-2.5`}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/80">
              <span className="text-[11px] font-bold text-stone-500 px-2">زمان:</span>
              {TIME_FILTERS.map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTime(tf.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedTime === tf.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {tf.name}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/80">
              <span className="text-[11px] font-bold text-stone-500 px-2">سختی:</span>
              {['همه', ...DIFFICULTIES].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer mr-auto"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recipes 2-Column Grid */}
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-700">هیچ غذایی با این فیلترها یافت نشد</h3>
          <p className="text-xs text-stone-500">فیلترهای انتخابی را پاک کرده یا نام دیگری را جستجو کنید.</p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer min-h-[44px]"
          >
            حذف فیلترها
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {visibleRecipes.map(recipe => {
              const totalCookTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

              return (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/85 hover:border-emerald-500 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between active:scale-[0.99] cursor-pointer"
                >
                  <div>
                    {/* Food Image */}
                    <div className="relative h-32 sm:h-52 overflow-hidden bg-stone-100">
                      <ImageWithFallback
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Rating Badge on Top Left */}
                      <div className="absolute top-2 left-2 bg-stone-950/80 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-xs border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{recipe.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 className="text-xs sm:text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                        {/* Category and Diets below title */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] sm:text-xs text-stone-500 font-bold block line-clamp-1">
                            {(recipe.categories && recipe.categories.length > 0) ? recipe.categories.join(' • ') : recipe.category}
                          </span>
                          {((recipe.diets && recipe.diets.length > 0) ? recipe.diets : (recipe.diet ? [recipe.diet] : [])).map(d => (
                            <span key={d} className="text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-100">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info Footer */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-xs font-bold text-stone-600">
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{totalCookTime} دقیقه</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold ${
                            recipe.difficulty === 'آسان'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : recipe.difficulty === 'سخت'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          }`}
                        >
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore ? (
            <div className="pt-4 pb-2 text-center space-y-2">
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer min-h-[48px] inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
                <span>نمایش بیشتر دستورات غذایی (۲۰ ردیف دیگر)</span>
              </button>
              <p className="text-[11px] text-stone-400 font-bold">
                در حال نمایش {visibleRecipes.length} از {filteredAndSortedRecipes.length} دستور پخت
              </p>
            </div>
          ) : (
            filteredAndSortedRecipes.length > RECIPES_PER_BATCH && (
              <div className="pt-4 text-center text-xs font-bold text-stone-400">
                ✓ تمام {filteredAndSortedRecipes.length} دستور پخت بارگذاری شدند.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
