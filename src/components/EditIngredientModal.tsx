import React, { useState, useEffect } from 'react';
import { X, Check, Database, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { Ingredient, IngredientConversion, INGREDIENT_CATEGORIES, COMMON_UNITS } from '../data/initialData';
import { updateIngredient } from '../db';

interface EditIngredientModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedIngredients: Ingredient[]) => void;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(INGREDIENT_CATEGORIES[0]);
  const [defaultUnit, setDefaultUnit] = useState(COMMON_UNITS[0]);
  const [caloriesPer100g, setCaloriesPer100g] = useState('150');
  const [conversions, setConversions] = useState<IngredientConversion[]>([]);
  const [allowedUnitsStr, setAllowedUnitsStr] = useState('');

  // New conversion form state
  const [targetUnit, setTargetUnit] = useState('گرم');
  const [targetRatio, setTargetRatio] = useState('1');

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name || '');
      setCategory(ingredient.category || INGREDIENT_CATEGORIES[0]);
      setDefaultUnit(ingredient.defaultUnit || COMMON_UNITS[0]);
      setCaloriesPer100g(String(ingredient.caloriesPer100g ?? 150));
      setConversions(ingredient.conversions ? [...ingredient.conversions] : []);
      if (Array.isArray(ingredient.allowedUnits)) {
        setAllowedUnitsStr(ingredient.allowedUnits.join('، '));
      } else if (typeof ingredient.allowedUnits === 'string') {
        setAllowedUnitsStr(ingredient.allowedUnits);
      } else {
        setAllowedUnitsStr('');
      }
    }
  }, [ingredient]);

  if (!isOpen || !ingredient) return null;

  const handleAddConversion = () => {
    const ratioNum = parseFloat(targetRatio);
    if (isNaN(ratioNum) || ratioNum <= 0) {
      alert('لطفاً نسبت معتبر بزرگتر از صفر وارد کنید.');
      return;
    }
    if (targetUnit === defaultUnit) {
      alert('واحد مقصد نمی‌تواند همان واحد پیش‌فرض باشد.');
      return;
    }
    if (conversions.some(c => c.unit === targetUnit)) {
      alert('این واحد قبلاً اضافه شده است.');
      return;
    }

    setConversions(prev => [...prev, { unit: targetUnit, ratio: ratioNum }]);
    setTargetRatio('1');
  };

  const handleRemoveConversion = (unitToRemove: string) => {
    setConversions(prev => prev.filter(c => c.unit !== unitToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const calNum = parseFloat(caloriesPer100g) || 150;
    const allowedUnits = allowedUnitsStr
      ? allowedUnitsStr.split(/،|,/).map(u => u.trim()).filter(Boolean)
      : undefined;

    const updated = await updateIngredient(ingredient.id, {
      name: name.trim(),
      category,
      defaultUnit,
      caloriesPer100g: calNum,
      conversions,
      allowedUnits
    });

    onSuccess(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto">
      <div className="bg-white rounded-t-[32px] rounded-b-none sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-800">ویرایش ماده اولیه</h2>
              <p className="text-xs text-stone-500">تغییر اطلاعات، واحد اصلی و جدول نسبت‌های تبدیل واحد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs font-medium">
            <div>
              <label className="block text-stone-700 font-bold mb-1">نام ماده اولیه *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">کالری در هر ۱۰۰ گرم (Kcal)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={caloriesPer100g}
                onChange={e => setCaloriesPer100g(e.target.value)}
                placeholder="مثال: ۱۵۰"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-bold text-stone-800"
              />
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">دسته‌بندی اصلی</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              >
                {INGREDIENT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">واحد اندازه‌گیری پیش‌فرض (پایه)</label>
              <select
                value={defaultUnit}
                onChange={e => setDefaultUnit(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              >
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">واحدهای مجاز (با کاما جدا کنید)</label>
            <input
              type="text"
              value={allowedUnitsStr}
              onChange={e => setAllowedUnitsStr(e.target.value)}
              placeholder="مثال: گرم، کیلوگرم، پیمانه (خرد شده)، قاشق غذاخوری"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-medium text-stone-800 text-xs"
            />
            <p className="text-[10px] text-stone-400 mt-1">واحدهایی که کاربر در دستور پخت مجاز به انتخاب آن‌ها برای این ماده است.</p>
          </div>

          {/* UNIT CONVERSIONS SECTION */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                تعیین وزن هر واحد (چند گرم؟)
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                واحد مرجع: گرم
              </span>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              مشخص کنید هر ۱ واحد (مانند ۱ عدد، ۱ پیمانه، ۱ قاشق و...) از این ماده معادل چند گرم است تا تبدیل واحدها در سبد خرید و دستور پخت دقیق کار کند.
            </p>

            {/* List of active conversions */}
            {conversions.length === 0 ? (
              <div className="text-[11px] text-stone-400 bg-white p-3 rounded-xl border border-amber-100 text-center">
                هنوز هیچ وزن اختصاصی ثبت نشده است (از وزن‌های استاندارد پیش‌فرض استفاده خواهد شد).
              </div>
            ) : (
              <div className="space-y-2">
                {conversions.map(c => (
                  <div key={c.unit} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-stone-800">
                      هر ۱ <span className="text-amber-800">{c.unit}</span> = <span className="text-amber-700 font-black">{c.ratio}</span> گرم
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveConversion(c.unit)}
                      className="text-stone-400 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add conversion control */}
            <div className="pt-2 border-t border-amber-200/60 flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <div className="w-full sm:w-1/2">
                <select
                  value={targetUnit}
                  onChange={e => setTargetUnit(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold"
                >
                  {COMMON_UNITS.filter(u => u !== 'گرم' && u !== 'کیلوگرم').map(u => (
                    <option key={u} value={u}>هر ۱ {u}</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-1/3 flex items-center gap-1">
                <input
                  type="number"
                  step="any"
                  value={targetRatio}
                  onChange={e => setTargetRatio(e.target.value)}
                  placeholder="وزن به گرم"
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-center"
                />
                <span className="text-stone-500 text-[11px] font-bold shrink-0">گرم</span>
              </div>

              <button
                type="button"
                onClick={handleAddConversion}
                className="w-full sm:w-auto px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Fixed Bottom Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>ثبت تغییرات ماده اولیه</span>
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
