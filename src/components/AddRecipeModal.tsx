import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, ChefHat, Info, Utensils, Clock, Salad, Image as ImageIcon, Video, Upload, Link as LinkIcon } from 'lucide-react';
import { Recipe, RecipeIngredient, CATEGORIES, MEAL_TYPES, DIET_TYPES, COMMON_UNITS, Ingredient } from '../data/initialData';
import { IngredientInput } from './IngredientInput';
import { addRecipe, fetchIngredients } from '../db';
import { getValidUnitsForIngredient } from '../utils/unitConverter';
import { useAuth } from '../context/AuthContext';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecipe: Recipe) => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([CATEGORIES[1] || 'سوپ، آش و خوراک']);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(['ناهار', 'شام']);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['معمولی']);
  const [prepTime, setPrepTime] = useState(20);
  const [cookTime, setCookTime] = useState(45);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<'آسان' | 'متوسط' | 'سخت'>('متوسط');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop');
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('url');
  const [videoUrl, setVideoUrl] = useState('');

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: 'پیاز', amount: 1, unit: 'عدد', type: 'اصلی' },
    { name: 'روغن مایع', amount: 2, unit: 'قاشق غذاخوری', type: 'افزودنی' }
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    'پیازها را نگینی خرد کرده و در روغن سرخ کنید.',
    'مواد اولیه را اضافه کرده و بپزید.'
  ]);

  const [tips, setTips] = useState('');
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    fetchIngredients().then(setAllIngredients);
  }, []);

  if (!isOpen) return null;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم فایل تصویر بالاست؛ لطفاً عکس کم‌حجم‌تری انتخاب کنید.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'عدد', type: 'اصلی' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validIngredients = ingredients.filter(i => i.name.trim().length > 0);
    const validInstructions = instructions.filter(inst => inst.trim().length > 0);

    const isUserAdmin = currentUser?.isAdmin || false;

    const primaryCategory = selectedCategories.length > 0 ? selectedCategories[0] : (CATEGORIES[1] || 'سوپ، آش و خوراک');
    const primaryMealType = selectedMealTypes.length > 0 ? selectedMealTypes[0] : 'ناهار';
    const primaryDiet = selectedDiets.length > 0 ? selectedDiets[0] : 'معمولی';

    const created = await addRecipe({
      title: title.trim(),
      description: description.trim() || 'دستور پخت لذیذ ایرانی',
      category: primaryCategory,
      categories: selectedCategories,
      mealType: primaryMealType,
      mealTypes: selectedMealTypes,
      diet: primaryDiet,
      diets: selectedDiets,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      image: image.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
      videoUrl: videoUrl.trim(),
      ingredients: validIngredients.map(i => ({
        ...i,
        amount: typeof i.amount === 'number' ? i.amount : (parseFloat(String(i.amount)) || 1)
      })),
      instructions: validInstructions,
      tips: tips.trim(),
      status: 'published',
      submittedBy: currentUser?.name || 'کاربر عمومی',
      submittedAt: new Date().toISOString().split('T')[0]
    });

    onSuccess(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto">
      <div className="bg-white rounded-t-[32px] rounded-b-none sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-700/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">افزودن دستور پخت جدید</h2>
              <p className="text-xs text-stone-500">دستور پخت اختصاصی خود را ثبت و به سفره اضافه کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {!currentUser?.isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-2 text-xs font-medium">
                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                <span>دستور پخت‌های ثبت‌شده توسط کاربران پس از بررسی و تایید مدیر منتشر می‌شوند.</span>
              </div>
            )}

            <div>
              <label className="block text-stone-700 font-bold mb-1">نام غذا *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثلاً: آلبالو پلو با مرغ"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">توضیحات کوتاه</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="توضیح مختصری درباره این غذا..."
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Category, Diet, and Meals Section */}
          <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-700" />
                <span>نوع غذا (دسته‌بندی‌ها) * (امکان انتخاب چند مورد)</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CATEGORIES.filter(c => c !== 'همه').map(c => {
                  const isSelected = selectedCategories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedCategories.length > 1) {
                            setSelectedCategories(selectedCategories.filter(x => x !== c));
                          }
                        } else {
                          setSelectedCategories([...selectedCategories, c]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1.5">
                <Salad className="w-4 h-4 text-emerald-700" />
                <span>نوع رژیم غذایی * (امکان انتخاب چند مورد)</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {DIET_TYPES.filter(d => d !== 'همه').map(d => {
                  const isSelected = selectedDiets.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedDiets.length > 1) {
                            setSelectedDiets(selectedDiets.filter(x => x !== d));
                          }
                        } else {
                          setSelectedDiets([...selectedDiets, d]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>وعده‌های غذایی مناسب * (امکان انتخاب چند مورد)</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {MEAL_TYPES.filter(m => m !== 'همه').map(m => {
                  const isSelected = selectedMealTypes.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedMealTypes.length > 1) {
                            setSelectedMealTypes(selectedMealTypes.filter(x => x !== m));
                          }
                        } else {
                          setSelectedMealTypes([...selectedMealTypes, m]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">سختی</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="آسان">آسان</option>
                <option value="متوسط">متوسط</option>
                <option value="سخت">سخت</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">زمان آماده‌سازی (دقیقه)</label>
              <input
                type="number"
                value={prepTime}
                onChange={e => setPrepTime(Number(e.target.value))}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">زمان پخت (دقیقه)</label>
              <input
                type="number"
                value={cookTime}
                onChange={e => setCookTime(Number(e.target.value))}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Media Section: Image Upload/Link & Video Link */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
            {/* Image Input */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-stone-800 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>عکس دستور پخت *</span>
                </label>
                <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('file')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      imageInputMode === 'file' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Upload className="w-3 h-3 inline ml-1" />
                    بارگذاری فایل عکس
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      imageInputMode === 'url' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3 inline ml-1" />
                    لینک عکس
                  </button>
                </div>
              </div>

              {imageInputMode === 'file' ? (
                <div className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-4 bg-white text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <span className="block text-xs font-bold text-stone-700">کلیک یا انتخاب عکس از دستگاه (موبایل یا کامپیوتر)</span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">فرمت‌های تصویری JPG, PNG, WEBP</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://example.com/food.jpg"
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs dir-ltr"
                />
              )}

              {/* Live Image Preview */}
              {image && (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 mt-2">
                  <img loading="lazy" decoding="async" fetchpriority="low" src={image} alt="پیش‌نمایش عکس" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-xl shadow-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>حذف عکس</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Input */}
            <div className="space-y-1.5 pt-3 border-t border-stone-200">
              <label className="block text-stone-800 font-bold flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-600" />
                <span>لینک ویدیو آموزشی پخت (اختیاری)</span>
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="مثلاً: لینک ویدیو آپارات، یوتیوب، اینستاگرام یا لینک مستقیم MP4..."
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs dir-ltr"
              />
              <p className="text-[10px] text-stone-500">
                با قرار دادن لینک ویدیو (آپارات، یوتیوب، اینستاگرام یا MP4)، ویدیوپلیر اختصاصی در صفحه دستور پخت فعال خواهد شد.
              </p>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/80">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-stone-800">مواد اولیه</span>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن ماده اولیه
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                  <div className="w-full sm:flex-1">
                    <IngredientInput
                      selectedName={ing.name}
                      onSelect={selected => {
                        const updated = [...ingredients];
                        updated[idx].name = selected.name;
                        updated[idx].unit = selected.defaultUnit;
                        setIngredients(updated);
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="مقدار"
                    value={ing.amount}
                    onChange={e => {
                      const updated = [...ingredients];
                      updated[idx].amount = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-20 p-2 bg-stone-50 border border-stone-200 rounded-lg text-center font-bold"
                  />
                  <select
                    value={ing.unit}
                    onChange={e => {
                      const updated = [...ingredients];
                      updated[idx].unit = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-28 p-2 bg-stone-50 border border-stone-200 rounded-lg font-medium text-xs"
                  >
                    {getValidUnitsForIngredient(ing.name, allIngredients).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <select
                    value={ing.type || 'اصلی'}
                    onChange={e => {
                      const updated = [...ingredients];
                      updated[idx].type = e.target.value as 'اصلی' | 'افزودنی' | 'اختیاری';
                      setIngredients(updated);
                    }}
                    className={`w-28 p-2 border rounded-lg font-bold text-xs ${
                      (ing.type || 'اصلی') === 'اصلی'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : (ing.type || 'اصلی') === 'افزودنی'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <option value="اصلی">اصلی</option>
                    <option value="افزودنی">افزودنی</option>
                    <option value="اختیاری">اختیاری</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-stone-800">مراحل تهیه</span>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="flex items-center gap-1 text-stone-700 hover:text-stone-900 bg-stone-200 hover:bg-stone-300 px-2.5 py-1 rounded-lg transition-colors font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن مرحله
              </button>
            </div>

            <div className="space-y-2">
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={inst}
                    onChange={e => {
                      const updated = [...instructions];
                      updated[idx] = e.target.value;
                      setInstructions(updated);
                    }}
                    placeholder={`مرحله ${idx + 1}...`}
                    className="flex-1 p-2 bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

            {/* Tips / Notes Section */}
            <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/60 space-y-2">
              <label className="block text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>نکات و فوت‌وفن‌های پخت (اختیاری)</span>
              </label>
              <textarea
                rows={3}
                value={tips}
                onChange={e => setTips(e.target.value)}
                placeholder="نکاتی مثل نحوه سرخ کردن، زمان اضافه کردن چاشنی‌ها یا ترفندهای جا افتادن غذا..."
                className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Sticky Fixed Bottom Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره دستور پخت</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
