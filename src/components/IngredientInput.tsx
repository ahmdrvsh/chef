import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Tag } from 'lucide-react';
import { Ingredient, INGREDIENT_CATEGORIES, COMMON_UNITS, INITIAL_INGREDIENTS } from '../data/initialData';
import { fetchIngredients, addIngredient } from '../db';

interface IngredientInputProps {
  onSelect: (ingredient: { name: string; category: string; defaultUnit: string }) => void;
  selectedName?: string;
  placeholder?: string;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  onSelect,
  selectedName = '',
  placeholder = 'جستجو یا تایپ نام ماده اولیه...'
}) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [searchTerm, setSearchTerm] = useState(selectedName);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [isOpen, setIsOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState<string>(INGREDIENT_CATEGORIES[0]);
  const [customUnit, setCustomUnit] = useState<string>(COMMON_UNITS[0]);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await fetchIngredients();
      if (data && data.length > 0) {
        setIngredients(data);
      } else {
        setIngredients(INITIAL_INGREDIENTS);
      }
    } catch {
      setIngredients(INITIAL_INGREDIENTS);
    }
  };

  const list = Array.isArray(ingredients) ? ingredients : [];
  const filteredIngredients = list.filter(ing => {
    if (!ing || !ing.name) return false;
    const matchesSearch = ing.name.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesCategory = selectedCategory === 'همه' || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (ing: Ingredient) => {
    setSearchTerm(ing.name);
    onSelect({
      name: ing.name,
      category: ing.category,
      defaultUnit: ing.defaultUnit
    });
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!searchTerm.trim()) return;
    const name = searchTerm.trim();
    const created = await addIngredient(name, customCategory, customUnit);
    setIngredients(prev => [...prev, created]);
    onSelect({
      name: created.name,
      category: created.category,
      defaultUnit: created.defaultUnit
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-10 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
        />
        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-xl border border-stone-100 max-h-80 overflow-y-auto p-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 border-b border-stone-100 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('همه')}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'همه'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              همه ({ingredients.length})
            </button>
            {INGREDIENT_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ingredient List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
            {filteredIngredients.map(ing => (
              <button
                key={ing.id}
                type="button"
                onClick={() => handleSelect(ing)}
                className="flex items-center justify-between p-2 rounded-xl text-right hover:bg-amber-50 text-stone-700 hover:text-amber-900 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500" />
                  <span>{ing.name}</span>
                </div>
                <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md group-hover:bg-amber-100 group-hover:text-amber-700">
                  {ing.defaultUnit}
                </span>
              </button>
            ))}
          </div>

          {/* Add custom item section */}
          {searchTerm.trim() && !ingredients.some(i => i.name.trim() === searchTerm.trim()) && (
            <div className="mt-2 pt-2 border-t border-stone-100 bg-amber-50/50 p-3 rounded-xl">
              <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
                <Plus className="w-4 h-4 text-amber-600" />
                افزودن «{searchTerm}» به لیست مواد اولیه
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-stone-500 mb-1 block">دسته‌بندی</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                  >
                    {INGREDIENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 mb-1 block">واحد پیش‌فرض</label>
                  <select
                    value={customUnit}
                    onChange={e => setCustomUnit(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none"
                  >
                    {COMMON_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                ثبت و انتخاب این ماده
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
