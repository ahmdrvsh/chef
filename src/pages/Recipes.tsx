import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Clock,
  Star,
  ChefHat,
  Filter,
  RefreshCw,
  Sparkles,
  Utensils,
  Info,
  Instagram,
  ExternalLink,
  ArrowUpDown,
  Check,
  ChevronDown,
  X,
  Layers,
  Flame,
  Globe,
  Coffee,
  CupSoda,
  Cake,
  Salad
} from 'lucide-react';
import {
  Recipe,
  CATEGORIES,
  CATEGORY_GROUPS,
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
import { VirtuosoGrid } from 'react-virtuoso';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { CategoryCarouselRow } from '../components/CategoryCarouselRow';
import { useAuth } from '../context/AuthContext';
import { calculateRecipeNutrition } from '../utils/calorieCalculator';

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

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [selectedTime, setSelectedTime] = useState('همه');
  const [selectedDifficulty, setSelectedDifficulty] = useState('همه');
  const [selectedMealType, setSelectedMealType] = useState('همه');
  const [selectedDiet, setSelectedDiet] = useState('همه');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination (20 rows in a 2-column grid = 40 recipes per page)
  const RECIPES_PER_BATCH = 40;
  const [visibleCount, setVisibleCount] = useState(RECIPES_PER_BATCH);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRecipes();
    const handleUpdate = () => loadRecipes();
    window.addEventListener('sofreh_recipes_updated', handleUpdate);
    return () => window.removeEventListener('sofreh_recipes_updated', handleUpdate);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecipes = async () => {
    const data = await fetchRecipes();
    setRecipes(data);
  };

  const handleSubCategoryClick = (item: SubCategoryItem) => {
    navigate(`/recipes/category?sub=${encodeURIComponent(item.matchKeyword)}&title=${encodeURIComponent(item.title)}`);
  };

  const handleResetFilters = () => {
    setSelectedSubCategory(null);
    setSelectedCategory('همه');
    setSelectedTime('همه');
    setSelectedDifficulty('همه');
    setSelectedMealType('همه');
    setSelectedDiet('همه');
    setSearchQuery('');
    setSortBy('newest');
    setVisibleCount(RECIPES_PER_BATCH);
  };

  const isFilterActive =
    selectedSubCategory !== null ||
    selectedCategory !== 'همه' ||
    selectedTime !== 'همه' ||
    selectedDifficulty !== 'همه' ||
    selectedMealType !== 'همه' ||
    selectedDiet !== 'همه' ||
    searchQuery.trim() !== '';

  const userPendingCount = recipes.filter(
    r => r.status === 'pending' && currentUser && r.submittedBy === currentUser.name
  ).length;

  const userRejectedCount = recipes.filter(
    r => r.status === 'rejected' && currentUser && r.submittedBy === currentUser.name
  ).length;

  // Filter & match recipes
  const filteredAndSortedRecipes = useMemo(() => {
    const filtered = recipes.filter(r => {
      const status = r.status || 'published';
      if (status !== 'published') {
        return false;
      }

      // 1. Subcategory card matching
      if (selectedSubCategory) {
        const kw = selectedSubCategory.toLowerCase();
        const matchesDirectCat = isCategoryMatch(r, selectedSubCategory);
        const cat = (r.category || '').toLowerCase();
        const cats = (r.categories || []).map(c => c.toLowerCase());
        const title = (r.title || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();

        let matchesSub = matchesDirectCat;

        if (!matchesSub) {
          if (kw === 'غذای ایرانی') {
            matchesSub = isCategoryMatch(r, 'غذای ایرانی') || cat.includes('خورشت') || cat.includes('پلو') || title.includes('خورشت') || title.includes('پلو') || cats.includes('غذای ایرانی');
          } else if (kw === 'غذاهای محلی') {
            matchesSub = isCategoryMatch(r, 'غذاهای محلی و سنتی') || cat.includes('محلی') || cat.includes('سنتی') || title.includes('میرزا') || title.includes('کشک') || title.includes('باقلا') || cats.some(c => c.includes('محلی') || c.includes('سنتی'));
          } else if (kw === 'سوپ') {
            matchesSub = cat.includes('سوپ') || title.includes('سوپ') || cats.some(c => c.includes('سوپ'));
          } else if (kw === 'آش') {
            matchesSub = cat.includes('آش') || title.includes('آش') || cats.some(c => c.includes('آش'));
          } else if (kw === 'خوراک') {
            matchesSub = cat.includes('خوراک') || title.includes('خوراک') || cats.some(c => c.includes('خوراک'));
          } else if (kw === 'فست‌فود') {
            matchesSub = cat.includes('فست') || cat.includes('ساندویچ') || title.includes('پیتزا') || title.includes('برگر') || title.includes('ساندویچ') || cats.some(c => c.includes('فست'));
          } else if (kw === 'سالاد') {
            matchesSub = cat.includes('سالاد') || title.includes('سالاد') || cats.some(c => c.includes('سالاد'));
          } else if (kw === 'پیش‌غذا') {
            matchesSub = cat.includes('پیش‌غذا') || title.includes('پیش‌غذا') || title.includes('سوپ') || title.includes('کشک') || cats.some(c => c.includes('پیش‌غذا'));
          } else if (kw === 'حاضری') {
            matchesSub = cat.includes('کوکو') || cat.includes('کتلت') || title.includes('املت') || title.includes('کوکو') || title.includes('کتلت') || title.includes('نیمرو') || (r.prepTime || 0) + (r.cookTime || 0) <= 20;
          } else if (kw === 'شیرینی') {
            matchesSub = cat.includes('شیرینی') || cat.includes('کیک') || title.includes('شیرینی') || title.includes('کیک') || title.includes('باقلوا') || cats.some(c => c.includes('شیرینی'));
          } else if (kw === 'دسر') {
            matchesSub = cat.includes('دسر') || title.includes('دسر') || title.includes('شله زرد') || title.includes('حلوا') || title.includes('فرنی') || cats.some(c => c.includes('دسر'));
          } else if (kw === 'مربا و شربت') {
            matchesSub = cat.includes('مربا') || cat.includes('شربت') || title.includes('مربا') || title.includes('شربت');
          } else if (kw === 'نوشیدنی گرم') {
            matchesSub = cat.includes('نوشیدنی گرم') || title.includes('چای') || title.includes('قهوه') || title.includes('دمنوش') || title.includes('شیر گرم');
          } else if (kw === 'نوشیدنی سرد') {
            matchesSub = cat.includes('نوشیدنی سرد') || title.includes('شربت') || title.includes('آبمیوه') || title.includes('اسموتی') || title.includes('خاکشیر') || title.includes('سکنجبین') || cat.includes('نوشیدنی');
          } else if (kw === 'ترشی') {
            matchesSub = cat.includes('ترشی') || title.includes('ترشی') || title.includes('شور');
          } else if (kw === 'مربا') {
            matchesSub = cat.includes('مربا') || title.includes('مربا') || title.includes('مارمالاد');
          } else if (kw === 'ایتالیایی') {
            matchesSub = cat.includes('ایتالیایی') || title.includes('پاستا') || title.includes('پیتزا') || title.includes('لازانیا') || desc.includes('ایتالیایی');
          } else if (kw === 'کره‌ای') {
            matchesSub = cat.includes('کره‌ای') || cat.includes('کره ای') || title.includes('نودل') || title.includes('کره‌ای') || desc.includes('کره‌ای');
          } else if (kw === 'یونانی') {
            matchesSub = cat.includes('یونانی') || title.includes('یونانی') || desc.includes('یونانی');
          } else if (kw === 'ترکیه‌ای') {
            matchesSub = cat.includes('ترکی') || title.includes('ترکی') || title.includes('دونر') || title.includes('کباب ترکی') || desc.includes('ترکی');
          } else {
            matchesSub = cat.includes(kw) || title.includes(kw) || desc.includes(kw) || cats.some(c => c.includes(kw));
          }
        }

        if (!matchesSub) return false;
      }

      // 2. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // 3. Dropdown Category Match
      if (!isCategoryMatch(r, selectedCategory)) return false;

      // 4. Difficulty Match
      if (selectedDifficulty !== 'همه' && r.difficulty !== selectedDifficulty) return false;

      // 5. Meal Type Match
      if (!isMealTypeMatch(r, selectedMealType)) return false;

      // 6. Diet Match
      if (!isDietMatch(r, selectedDiet)) return false;

      // 7. Time Filter Match
      const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
      if (selectedTime === 'زیر ۱۵ دقیقه' && totalTime > 15) return false;
      if (selectedTime === 'زیر ۳۰ دقیقه' && totalTime > 30) return false;
      if (selectedTime === 'زیر ۱ ساعت' && totalTime > 60) return false;
      if (selectedTime === 'بالای ۱ ساعت' && totalTime <= 60) return false;

      return true;
    });

    // Apply Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 4.5) - (a.rating || 4.5);
      }
      if (sortBy === 'quickest') {
        const timeA = (a.prepTime || 0) + (a.cookTime || 0);
        const timeB = (b.prepTime || 0) + (b.cookTime || 0);
        return timeA - timeB;
      }
      if (sortBy === 'slowest') {
        const timeA = (a.prepTime || 0) + (a.cookTime || 0);
        const timeB = (b.prepTime || 0) + (b.cookTime || 0);
        return timeB - timeA;
      }
      if (sortBy === 'easy') {
        const diffScore = { آسان: 1, متوسط: 2, سخت: 3 };
        return (diffScore[a.difficulty] || 2) - (diffScore[b.difficulty] || 2);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title, 'fa');
      }
      if (sortBy === 'fewest-ingredients') {
        return a.ingredients.length - b.ingredients.length;
      }
      // default: newest / preserve order
      return 0;
    });
  }, [
    recipes,
    selectedSubCategory,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedMealType,
    selectedDiet,
    selectedTime,
    sortBy
  ]);

  const visibleRecipes = filteredAndSortedRecipes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedRecipes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + RECIPES_PER_BATCH);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-6 sm:space-y-8">
      
      {/* Admin/User Notifications */}
      {userPendingCount > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl text-amber-900 text-xs font-bold flex items-center gap-2.5">
          <Info className="w-4.5 h-4.5 text-amber-600 shrink-0" />
          <span>
            شما {userPendingCount} دستور پخت ارسال کرده‌اید که در انتظار بررسی و تایید توسط مدیر قرار دارد.
          </span>
        </div>
      )}

      {userRejectedCount > 0 && (
        <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2.5">
          <Info className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>
            تعداد {userRejectedCount} دستور پخت ارسالی شما رد شد و در لیست عمومی منتشر نگردید.
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6 HORIZONTAL CATEGORY ROWS (CAROUSELS OF HIGH-QUALITY IMAGE CARDS)        */}
      {/* ========================================================================= */}
      <div className="space-y-5 sm:space-y-6">
        <div className="space-y-4 sm:space-y-5">
          {CATEGORY_GROUPS.map(group => (
            <CategoryCarouselRow
              key={group.id}
              group={group}
              onItemClick={handleSubCategoryClick}
            />
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH BAR, FILTER ICON & SORT DROPDOWN                                   */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xs border border-stone-200/80 space-y-3 sm:space-y-4">
        
        {/* Top Controls: Search + Sort Icon + Filter Icon + Add Recipe */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              placeholder="جستجوی نام غذا یا ماده اولیه..."
              className="w-full px-3.5 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm font-medium transition-all min-h-[44px]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown Trigger */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`px-3 py-2.5 rounded-xl sm:rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] cursor-pointer shrink-0 shadow-2xs active:scale-95 ${
                sortBy !== 'newest'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="مرتب‌سازی دستورات"
              aria-label="مرتب‌سازی دستورات"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">سورت</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Sort Dropdown Menu */}
            {isSortDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 animate-in fade-in slide-in-from-top-1">
                <div className="text-[10px] font-black text-stone-400 px-3 py-1.5 border-b border-stone-100">
                  مرتب‌سازی بر اساس:
                </div>
                {SORT_LABELS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortDropdownOpen(false);
                      setVisibleCount(RECIPES_PER_BATCH);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[38px] cursor-pointer ${
                      sortBy === opt.value
                        ? 'bg-emerald-700 text-white font-black'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] cursor-pointer shrink-0 shadow-2xs active:scale-95 ${
              isMobileFiltersOpen || isFilterActive
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            title="فیلترهای پیشرفته"
            aria-label="فیلترهای پیشرفته"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">فیلترها</span>
            {isFilterActive && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            )}
          </button>

          {/* Add Recipe Modal Trigger */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl sm:rounded-2xl shadow-xs transition-transform active:scale-95 min-h-[44px] cursor-pointer shrink-0"
            title="افزودن دستور پخت"
          >
            <Plus className="w-4 h-4" />
            <span>دستور جدید</span>
          </button>
        </div>

        {/* Dropdown Filters Grid: Category, Time, Difficulty, Meal Type, Diet */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-bold pt-2 border-t border-stone-100 ${isMobileFiltersOpen ? 'block' : 'hidden md:grid'}`}>
          
          {/* Category Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] text-stone-500 font-extrabold">دسته‌بندی غذا</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'همه' ? 'دسته: همه' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] text-stone-500 font-extrabold">زمان آماده‌سازی</label>
            <select
              value={selectedTime}
              onChange={e => {
                setSelectedTime(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            >
              {TIME_FILTERS.map(t => (
                <option key={t} value={t}>
                  {t === 'همه' ? 'زمان پخت: همه' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] text-stone-500 font-extrabold">درجه سختی</label>
            <select
              value={selectedDifficulty}
              onChange={e => {
                setSelectedDifficulty(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>
                  {d === 'همه' ? 'سختی: همه' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type Filter */}
          <div className="space-y-1">
            <label className="block text-[11px] text-stone-500 font-extrabold">وعده غذایی</label>
            <select
              value={selectedMealType}
              onChange={e => {
                setSelectedMealType(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            >
              {MEAL_TYPES.map(m => (
                <option key={m} value={m}>
                  {m === 'همه' ? 'وعده: همه' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Diet Filter */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="block text-[11px] text-stone-500 font-extrabold">رژیم غذایی</label>
            <select
              value={selectedDiet}
              onChange={e => {
                setSelectedDiet(e.target.value);
                setVisibleCount(RECIPES_PER_BATCH);
              }}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            >
              {DIET_TYPES.map(dt => (
                <option key={dt} value={dt}>
                  {dt === 'همه' ? 'رژیم: همه' : dt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Reset bar if active */}
        {isFilterActive && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-500 font-medium">
              {selectedSubCategory && <span>دسته: <b>{selectedSubCategory}</b> | </span>}
              فیلترهای فعال در حال اعمال هستند ({filteredAndSortedRecipes.length} دستور).
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg min-h-[32px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              پاک کردن همه فیلترها
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN RECIPES GRID (20 ROWS = 40 ITEMS PER BATCH)                     */}
      {/* ========================================================================= */}
      {filteredAndSortedRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-700">هیچ غذایی با فیلترهای انتخابی یافت نشد</h3>
          <p className="text-xs text-stone-500">فیلترهای انتخابی را پاک کرده یا عبارت دیگری را جستجو نمایید.</p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 cursor-pointer min-h-[44px]"
          >
            مشاهده همه دستورات پخت
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Strictly 2-column grid as requested */}
          <VirtuosoGrid
            useWindowScroll
            data={filteredAndSortedRecipes}
            listClassName="grid grid-cols-2 gap-3 sm:gap-5"
            itemContent={(index, recipe) => {
              const totalCookTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
              const nutrition = calculateRecipeNutrition(recipe);

              return (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/85 hover:border-emerald-500 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between active:scale-[0.99] cursor-pointer"
                >
                  <div>
                    {/* Food Image */}
                    <div className="relative h-32 sm:h-52 overflow-hidden bg-stone-100">
                      <ImageWithFallback loading="lazy" decoding="async" fetchpriority="low"
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Calories Badge on Top Right of Image */}
                      <div className="absolute top-2 right-2 bg-stone-950/80 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-xs border border-white/10">
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>{nutrition.caloriesPer100g} کالری/100گ</span>
                      </div>

                      {/* Rating Badge on Top Left of Image */}
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
            }}
          />
        </div>
      )}

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={newR => {
          setRecipes([newR, ...recipes]);
        }}
      />
    </div>
  );
};

