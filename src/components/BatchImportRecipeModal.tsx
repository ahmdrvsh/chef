import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Download,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ChefHat,
  PlusCircle,
  HelpCircle,
  FileCode,
  Layers
} from 'lucide-react';
import { Recipe, Ingredient } from '../data/initialData';
import { parseRecipesFromText, SAMPLE_RECIPE_TXT } from '../utils/recipeTextParser';
import { fetchIngredients, addIngredient } from '../db';

interface BatchImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRecipes: Omit<Recipe, 'id'>[]) => Promise<void>;
}

interface MissingIngredientItem {
  name: string;
  recipeTitle: string;
  unit: string;
}

export const BatchImportRecipeModal: React.FC<BatchImportRecipeModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [rawText, setRawText] = useState<string>('');
  const [parsedRecipes, setParsedRecipes] = useState<Omit<Recipe, 'id'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showSampleHelp, setShowSampleHelp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasParsed, setHasParsed] = useState<boolean>(false);

  // System ingredients checking
  const [dbIngredients, setDbIngredients] = useState<Ingredient[]>([]);
  const [missingIngredients, setMissingIngredients] = useState<MissingIngredientItem[]>([]);
  const [isAddingMissing, setIsAddingMissing] = useState<boolean>(false);
  const [autoAddSuccess, setAutoAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSystemIngredients();
    }
  }, [isOpen]);

  const loadSystemIngredients = async () => {
    try {
      const ings = await fetchIngredients();
      setDbIngredients(ings);
      return ings;
    } catch {
      return [];
    }
  };

  const normalizeStr = (s: string) => {
    if (!s) return '';
    return s
      .trim()
      .toLowerCase()
      .replace(/[يی]/g, 'ی')
      .replace(/[كک]/g, 'ک')
      .replace(/\s+/g, ' ');
  };

  const checkMissingIngredientsAgainstDb = (
    recipes: Omit<Recipe, 'id'>[],
    currentIngredientsList: Ingredient[]
  ) => {
    const dbNameSet = new Set(
      currentIngredientsList.map(i => normalizeStr(i.name))
    );

    const missingMap = new Map<string, MissingIngredientItem>();

    recipes.forEach(r => {
      r.ingredients.forEach(ing => {
        const rawName = ing.name.trim();
        const normName = normalizeStr(rawName);

        if (normName && !dbNameSet.has(normName)) {
          if (!missingMap.has(normName)) {
            missingMap.set(normName, {
              name: rawName,
              recipeTitle: r.title,
              unit: ing.unit || 'عدد'
            });
          }
        }
      });
    });

    const missingList = Array.from(missingMap.values());
    setMissingIngredients(missingList);
  };

  if (!isOpen) return null;

  const handleParse = async (textToParse?: string) => {
    const text = textToParse !== undefined ? textToParse : rawText;
    const result = parseRecipesFromText(text);
    setParsedRecipes(result.recipes);
    setParseErrors(result.errors);
    setHasParsed(true);
    setAutoAddSuccess(null);

    const currentIngs = dbIngredients.length > 0 ? dbIngredients : await loadSystemIngredients();
    checkMissingIngredientsAgainstDb(result.recipes, currentIngs);
  };

  const handleAutoAddMissingIngredients = async () => {
    if (missingIngredients.length === 0) return;
    setIsAddingMissing(true);
    try {
      let addedCount = 0;
      for (const item of missingIngredients) {
        await addIngredient(item.name, 'سایـر', item.unit || 'عدد');
        addedCount++;
      }
      const updatedIngs = await loadSystemIngredients();
      checkMissingIngredientsAgainstDb(parsedRecipes, updatedIngs);
      setAutoAddSuccess(`تعداد ${addedCount} ماده اولیه با موفقیت به بانک مواد اولیه سیستم اضافه شد.`);
    } catch (err) {
      alert('خطا در اضافه کردن مواد اولیه به سیستم.');
    } finally {
      setIsAddingMissing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        handleParse(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_RECIPE_TXT);
    handleParse(SAMPLE_RECIPE_TXT);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_RECIPE_TXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSampleFile = () => {
    const blob = new Blob([SAMPLE_RECIPE_TXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_recipes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (parsedRecipes.length === 0) return;
    setIsSubmitting(true);
    try {
      await onImport(parsedRecipes);
      setRawText('');
      setParsedRecipes([]);
      setHasParsed(false);
      onClose();
    } catch (err) {
      alert('خطا در ثبت دستورهای پخت. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">افزودن دسته‌جمعی دستور پخت‌ها</h2>
              <p className="text-xs text-stone-400 mt-0.5">وارد کردن ده‌ها رسپی به صورت یکجا با فایل تکست یا JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Action Header & Sample Download bar */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-medium">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>می‌توانید فایل با فرمت متنی سفره یا JSON وارد کنید یا نمونه را تست کنید.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleLoadSample}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-2xs"
              >
                تست با متن نمونه
              </button>
              <button
                type="button"
                onClick={handleDownloadSampleFile}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-xl font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                دانلود نمونه txt
              </button>
              <button
                type="button"
                onClick={() => setShowSampleHelp(!showSampleHelp)}
                className="p-1.5 text-amber-700 hover:bg-amber-200/50 rounded-xl transition-colors"
                title="راهنمای فرمت متنی"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Sample Help Box */}
          {showSampleHelp && (
            <div className="bg-stone-900 text-stone-200 rounded-2xl p-4 text-xs font-mono relative border border-stone-700 shadow-inner">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800 font-sans">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  فرمت فایل متنی نمونه (txt.):
                </span>
                <button
                  onClick={handleCopySample}
                  className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-sans transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'کپی شد' : 'کپی نمونه'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed text-stone-300 dir-rtl font-mono">
                {SAMPLE_RECIPE_TXT}
              </pre>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'paste'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              پیست کردن متن دستورها
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              بارگذاری فایل (txt / json)
            </button>
          </div>

          {/* Input Area */}
          {activeTab === 'paste' ? (
            <div className="space-y-3">
              <textarea
                value={rawText}
                onChange={e => {
                  setRawText(e.target.value);
                  setHasParsed(false);
                }}
                placeholder="متن دستورهای پخت خود را با فرمت نمونه در اینجا پیست کنید یا کدهای JSON را وارد نمایید..."
                className="w-full h-48 p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all dir-rtl leading-relaxed resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleParse()}
                  disabled={!rawText.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  پردازش و شناسایی دستورها
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center hover:border-amber-500 transition-colors bg-stone-50/50">
              <input
                type="file"
                accept=".txt,.json,.text"
                onChange={handleFileUpload}
                className="hidden"
                id="recipe-file-upload"
              />
              <label htmlFor="recipe-file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="p-4 bg-white border border-stone-200 rounded-2xl text-amber-600 shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-800 block">برای بارگذاری فایل اینجا کلیک کنید</span>
                  <span className="text-[11px] text-stone-500 mt-1 block">پشتیبانی از فایل‌های txt. و json.</span>
                </div>
              </label>
            </div>
          )}

          {/* Parsing Results & Validation */}
          {hasParsed && (
            <div className="space-y-4 border-t border-stone-200 pt-5">
              {parseErrors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    هشدارها و خطاهای پردازش:
                  </div>
                  <ul className="list-disc list-inside space-y-1 pr-2">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Ingredients Warning Banner */}
              {missingIngredients.length > 0 && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>مواد اولیه تعریف‌نشده در سیستم ({missingIngredients.length} مورد)</span>
                    </div>
                  </div>
                  <p className="leading-relaxed text-amber-800">
                    ماده اولیه موجود در این دستورها در لیست مواد اولیه تعریف نشده است. لطفاً پس از تعریف آن مجدداً اقدام کنید یا از دکمه زیر برای افزودن خودکار استفاده نمایید:
                  </p>
                  <div className="bg-white/80 rounded-xl p-3 border border-amber-200 max-h-36 overflow-y-auto space-y-1.5">
                    {missingIngredients.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-stone-700">
                        <span className="font-bold text-amber-900">• {item.name}</span>
                        <span className="text-stone-500">(در دستور: {item.recipeTitle})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-amber-800">
                      ثبت دستورپخت منوط به تعریف مواد اولیه فوق است.
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoAddMissingIngredients}
                      disabled={isAddingMissing}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isAddingMissing ? 'در حال افزودن...' : 'افزودن خودکار به لیست مواد اولیه'}</span>
                    </button>
                  </div>
                </div>
              )}

              {autoAddSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{autoAddSuccess}</span>
                </div>
              )}

              {parsedRecipes.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      تعداد {parsedRecipes.length} دستور پخت آماده افزودن:
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-2xl divide-y divide-stone-100 bg-white">
                    {parsedRecipes.map((r, i) => (
                      <div key={i} className="p-3.5 flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-900">{i + 1}. {r.title}</span>
                            {(r.categories || [r.category]).map((c, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-md font-bold">
                                {c}
                              </span>
                            ))}
                            {(r.diets || [r.diet]).map((d, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-md font-bold">
                                {d}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded-md font-bold">
                              {r.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{r.description}</p>
                          <div className="flex items-center gap-4 text-[10px] text-stone-400 pt-1">
                            <span>مواد اولیه: {r.ingredients.length} مورد</span>
                            <span>مراحل پخت: {r.instructions.length} گام</span>
                            <span>آماده‌سازی: {r.prepTime}د | پخت: {r.cookTime}د</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !parseErrors.length && (
                  <p className="text-center text-xs text-stone-500 py-4">دستور پختی برای نمایش پیدا نشد.</p>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl transition-all"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={parsedRecipes.length === 0 || missingIngredients.length > 0 || isSubmitting}
            title={missingIngredients.length > 0 ? 'ابتدا مواد اولیه غایب را تعریف کنید' : ''}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>در حال افزودن...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>تایید و افزودن {parsedRecipes.length > 0 ? `(${parsedRecipes.length} دستور پخت)` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
