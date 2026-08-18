import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Shuffle,
  History,
  Heart,
  SlidersHorizontal,
  Users,
  Plus,
  Trash2,
  Check,
  ChefHat,
  Filter,
  Clock,
  Gauge,
  Salad,
  Info,
  Calendar,
  Coffee,
  UtensilsCrossed,
  Moon,
  Apple
} from 'lucide-react';
import { CATEGORIES, DIET_TYPES, DIFFICULTIES, TIME_FILTERS } from '../data/initialData';

export interface FamilyDietProfile {
  id: string;
  name: string;        // e.g. "اعضای معمولی", "کتوژنیک پدر", "دیابت مادربزرگ"
  memberCount: number; // e.g. 2, 1, 1
  dietType: string;    // e.g. "معمولی", "کتوژنیک", "مناسب دیابت"
}

export interface IncludedMealsSettings {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  snack: boolean;
}

export interface AutoPlanSettings {
  useRandom: boolean;           // ۱- به صورت تصادفی
  usePastChoices: boolean;      // ۲- بر اساس انتخاب‌های گذشته کاربر
  useFavorites: boolean;        // ۳- بر اساس لیست علاقه‌مندی‌ها
  dietType: string;             // ۴- بر اساس نوع رژیم
  difficulty: string;           // ۵- بر اساس درجه سختی
  maxCookTime: string;          // ۶- بر اساس زمان پخت
  category: string;             // ۷- بر اساس نوع دسته‌بندی غذا
  includedMeals: IncludedMealsSettings; // انتخاب وعده‌های هدف (صبحانه، ناهار، شام، میان‌وعده)
  
  // تنظیمات تفکیک رژیم اعضای خانواده (Multi-Diet Household)
  enableMultiDietFamily: boolean;
  familyDietProfiles: FamilyDietProfile[];
}

export const getDefaultAutoPlanSettings = (defaultFamilyCount: number = 4): AutoPlanSettings => ({
  useRandom: true,
  usePastChoices: true,
  useFavorites: true,
  dietType: 'همه',
  difficulty: 'همه',
  maxCookTime: 'همه',
  category: 'همه',
  includedMeals: {
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  },
  enableMultiDietFamily: false,
  familyDietProfiles: [
    { id: 'dp_1', name: 'عادی / عمومی', memberCount: defaultFamilyCount || 4, dietType: 'معمولی' }
  ]
});

export const loadAutoPlanSettings = (defaultFamilyCount: number = 4): AutoPlanSettings => {
  const defaults = getDefaultAutoPlanSettings(defaultFamilyCount);
  try {
    const saved = localStorage.getItem('sofreh_auto_plan_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaults,
        ...parsed,
        includedMeals: {
          ...defaults.includedMeals,
          ...(parsed.includedMeals || {})
        }
      };
    }
  } catch (e) {
    console.error('Error loading auto plan settings', e);
  }
  return defaults;
};

export const saveAutoPlanSettings = (settings: AutoPlanSettings): void => {
  try {
    localStorage.setItem('sofreh_auto_plan_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving auto plan settings', e);
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (settings: AutoPlanSettings) => void;
  defaultFamilyCount: number;
}

export const AutoFillSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onGenerate,
  defaultFamilyCount
}) => {
  const [settings, setSettings] = useState<AutoPlanSettings>(() => loadAutoPlanSettings(defaultFamilyCount));
  const [activeTab, setActiveTab] = useState<'criteria' | 'family'>('criteria');

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAutoPlanSettings(defaultFamilyCount));
    }
  }, [isOpen, defaultFamilyCount]);

  if (!isOpen) return null;

  const handleToggleOption = (key: keyof AutoPlanSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleMeal = (mealKey: keyof IncludedMealsSettings) => {
    setSettings(prev => ({
      ...prev,
      includedMeals: {
        ...prev.includedMeals,
        [mealKey]: !prev.includedMeals[mealKey]
      }
    }));
  };

  const handleUpdateProfile = (id: string, field: keyof FamilyDietProfile, value: any) => {
    setSettings(prev => ({
      ...prev,
      familyDietProfiles: prev.familyDietProfiles.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleAddProfile = () => {
    const newId = 'dp_' + Date.now();
    setSettings(prev => ({
      ...prev,
      familyDietProfiles: [
        ...prev.familyDietProfiles,
        { id: newId, name: `رژیم ${prev.familyDietProfiles.length + 1}`, memberCount: 1, dietType: 'کتوژنیک' }
      ]
    }));
  };

  const handleRemoveProfile = (id: string) => {
    if (settings.familyDietProfiles.length <= 1) return;
    setSettings(prev => ({
      ...prev,
      familyDietProfiles: prev.familyDietProfiles.filter(p => p.id !== id)
    }));
  };

  const handleSaveAndGenerate = () => {
    saveAutoPlanSettings(settings);
    onGenerate(settings);
    onClose();
  };

  const totalFamilyMembers = settings.familyDietProfiles.reduce((acc, curr) => acc + (curr.memberCount || 1), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-fadeIn dir-rtl overflow-hidden sm:overflow-y-auto">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-t-[32px] rounded-b-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <SlidersHorizontal className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">تنظیمات موتور پیشنهاد خودکار برنامه هفتگی</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                شخصی‌سازی معیارها، زمان پخت، سختی و رژیم‌های تفکیک‌شده افراد خانواده
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('criteria')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'criteria'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>معیارها و فیلترهای هوشمند</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 relative ${
              activeTab === 'family'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>رژیم اعضای خانواده (چندغذا)</span>
            {settings.enableMultiDietFamily && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'criteria' ? (
            <div className="space-y-6">
              
              {/* Top 3 Toggle Cards: Random, Past Choices, Favorites */}
              <div>
                <h3 className="text-sm font-black text-stone-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  منبع و روش‌های پیشنهاد (انتخاب چندتایی):
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* 1. Random */}
                  <div
                    onClick={() => handleToggleOption('useRandom')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      settings.useRandom
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${settings.useRandom ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <Shuffle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800">تصادفی و متنوع</span>
                        <input
                          type="checkbox"
                          checked={settings.useRandom}
                          onChange={() => {}}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                        تنوع بالا در برنامه با انتخاب تصادفی از بین غذاهای واجد شرایط
                      </p>
                    </div>
                  </div>

                  {/* 2. Past Choices */}
                  <div
                    onClick={() => handleToggleOption('usePastChoices')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      settings.usePastChoices
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${settings.usePastChoices ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800">انتخاب‌های گذشته</span>
                        <input
                          type="checkbox"
                          checked={settings.usePastChoices}
                          onChange={() => {}}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                        اولویت به غذاهایی که قبلاً پخته‌اید یا در سابقه ثبت کرده‌اید
                      </p>
                    </div>
                  </div>

                  {/* 3. Favorites */}
                  <div
                    onClick={() => handleToggleOption('useFavorites')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      settings.useFavorites
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${settings.useFavorites ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800">علاقه‌مندی‌ها</span>
                        <input
                          type="checkbox"
                          checked={settings.useFavorites}
                          onChange={() => {}}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                        استفاده اولویت‌دار از غذاهای نشان‌شده در لیست محبوب‌ها
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Meal Selection Cards Section */}
              <div>
                <h3 className="text-sm font-black text-stone-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  وعده‌های غذایی مدنظر برای پیشنهاد خودکار:
                </h3>
                <p className="text-[11px] text-stone-500 mb-3">
                  وعده‌های انتخاب‌شده شامل پیشنهاد خودکار می‌شوند و وعده‌های غیرفعال (مثلاً صبحانه) دست‌نخورده باقی می‌مانند.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Breakfast */}
                  <div
                    onClick={() => handleToggleMeal('breakfast')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      settings.includedMeals?.breakfast
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-xs">☕ صبحانه</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.includedMeals?.breakfast ?? true}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                  </div>

                  {/* Lunch */}
                  <div
                    onClick={() => handleToggleMeal('lunch')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      settings.includedMeals?.lunch
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-xs">🍲 ناهار</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.includedMeals?.lunch ?? true}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                  </div>

                  {/* Dinner */}
                  <div
                    onClick={() => handleToggleMeal('dinner')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      settings.includedMeals?.dinner
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-xs">🌙 شام</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.includedMeals?.dinner ?? true}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                  </div>

                  {/* Snack */}
                  <div
                    onClick={() => handleToggleMeal('snack')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      settings.includedMeals?.snack
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-xs">🍎 میان‌وعده</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.includedMeals?.snack ?? true}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Categorical & Technical Filters */}
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 space-y-4">
                <h3 className="text-xs font-bold text-stone-700 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-600" />
                  فیلترهای اختصاصی نوع غذا، زمان و سختی:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      دسته‌بندی غذا:
                    </label>
                    <select
                      value={settings.category}
                      onChange={e => setSettings({ ...settings, category: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-amber-600" />
                      درجه سختی پخت:
                    </label>
                    <select
                      value={settings.difficulty}
                      onChange={e => setSettings({ ...settings, difficulty: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {DIFFICULTIES.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cooking Time Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      حداکثر زمان پخت:
                    </label>
                    <select
                      value={settings.maxCookTime}
                      onChange={e => setSettings({ ...settings, maxCookTime: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {TIME_FILTERS.map(tf => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </div>

                  {/* General Diet Type */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                      <Salad className="w-3.5 h-3.5 text-emerald-600" />
                      نوع رژیم غذایی عمومی:
                    </label>
                    <select
                      disabled={settings.enableMultiDietFamily}
                      value={settings.dietType}
                      onChange={e => setSettings({ ...settings, dietType: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                      {DIET_TYPES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {settings.enableMultiDietFamily && (
                      <p className="text-[10px] text-emerald-700 mt-1 font-semibold">
                        ✓ رژیم چندگانه اعضای خانواده در زبانه بعد فعال است.
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Family Multi-Diet Profiles Tab */
            <div className="space-y-6">
              
              {/* Toggle Multi-Diet Household */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-sm text-stone-900">
                      چند رژیم هم‌زمان در خانه (مثلاً کتوژنیک، دیابتی و معمولی)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    با فعال‌سازی این بخش، موتور هوشمند برای هر وعده چیدمان، چند دستور متناسب با رژیم‌های مختلف اعضای خانواده تعیین می‌کند و تعداد نفرات هر غذا را مجزا ثبت خواهد کرد.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableMultiDietFamily}
                    onChange={e => setSettings({ ...settings, enableMultiDietFamily: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {settings.enableMultiDietFamily ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                      تعریف رژیم‌ها و تعداد نفرات هر رژیم:
                    </h4>
                    <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-xl font-bold">
                      مجموع نفرات: {totalFamilyMembers} نفر
                    </span>
                  </div>

                  <div className="space-y-3">
                    {settings.familyDietProfiles.map((prof, index) => (
                      <div
                        key={prof.id}
                        className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={prof.name}
                            onChange={e => handleUpdateProfile(prof.id, 'name', e.target.value)}
                            placeholder="نام عنوان (مثلا: کتوژنیک پدر)"
                            className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-40"
                          />
                        </div>

                        {/* Diet Selection */}
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-[11px] font-bold text-stone-500 whitespace-nowrap">رژیم:</label>
                          <select
                            value={prof.dietType}
                            onChange={e => handleUpdateProfile(prof.id, 'dietType', e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                          >
                            {DIET_TYPES.filter(d => d !== 'همه').map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* Members Count controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateProfile(prof.id, 'memberCount', Math.max(1, prof.memberCount - 1))}
                              className="w-6 h-6 rounded-lg bg-white text-stone-800 font-bold flex items-center justify-center hover:bg-amber-100 text-xs shadow-2xs transition"
                            >
                              -
                            </button>
                            <span className="font-black text-xs px-2 text-stone-800 min-w-[20px] text-center">
                              {prof.memberCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateProfile(prof.id, 'memberCount', prof.memberCount + 1)}
                              className="w-6 h-6 rounded-lg bg-white text-stone-800 font-bold flex items-center justify-center hover:bg-amber-100 text-xs shadow-2xs transition"
                            >
                              +
                            </button>
                            <span className="text-[10px] font-bold text-stone-500 px-1">نفر</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProfile(prof.id)}
                            disabled={settings.familyDietProfiles.length <= 1}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 transition"
                            title="حذف این گروه رژیمی"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl border border-dashed border-stone-300 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>افزودن گروه رژیمی جدید برای اعضای خانواده</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <Info className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-700">رژیم تفکیک‌شده خانوادگی غیرفعال است</p>
                  <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                    در صورت فعال‌سازی کلید بالا، می‌توانید برای هر فرد از خانواده (مثلاً ۱ نفر کتوژنیک، ۱ نفر دیابتی و ۲ نفر معمولی) رژیم‌های متفاوتی تعریف کنید.
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>تنظیمات ذخیره شده و در پیشنهاد‌های بعدی نیز استفاده می‌شوند.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition"
            >
              انصراف
            </button>

            <button
              onClick={handleSaveAndGenerate}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ذخیره و ایجاد برنامه هفتگی</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
