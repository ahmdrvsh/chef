import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Check,
  Plus,
  Trash2,
  Refrigerator,
  CheckCircle2,
  Share2,
  ArrowRightLeft,
  Copy,
  MessageSquare,
  Send,
  ExternalLink,
  X,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Store,
  Search
} from 'lucide-react';
import { ShoppingItem, Ingredient, FridgeItem, COMMON_UNITS } from '../data/initialData';
import { openExternalLink } from '../lib/capacitor';
import { fetchShoppingList, saveShoppingList, fetchIngredients, fetchFridge, syncPendingData, addToFridge, logShoppingHistory } from '../db';
import { IngredientInput } from '../components/IngredientInput';
import {
  getIngredientConversions,
  convertUnitValue,
  parseQuantityNumber
} from '../utils/unitConverter';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const ShoppingListPage: React.FC = () => {
  const { isOnline, justReconnected } = useOnlineStatus();
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('سایـر');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('عدد');

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [includeFridgeItemsInShare, setIncludeFridgeItemsInShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Snapp Market Modal state
  const [isSnappMarketModalOpen, setIsSnappMarketModalOpen] = useState(false);
  const [snappCopySuccess, setSnappCopySuccess] = useState(false);

  // Unit Conversion Popover state (itemId currently opening unit converter)
  const [activeConvertItemId, setActiveConvertItemId] = useState<string | null>(null);

  // Clear All Confirmation Modal State
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sList, ingList, fList] = await Promise.all([
      fetchShoppingList(),
      fetchIngredients(),
      fetchFridge()
    ]);
    setShoppingItems(sList);
    setIngredients(ingList);
    setFridgeItems(fList || []);
  };

  const handleToggleBought = async (id: string) => {
    const targetItem = shoppingItems.find(item => item.id === id);
    const willBeBought = targetItem ? !targetItem.isBought : false;

    const updated = shoppingItems.map(item =>
      item.id === id ? { ...item, isBought: willBeBought } : item
    );
    setShoppingItems(updated);
    await saveShoppingList(updated);

    // If item was toggled to bought (true), automatically add it to the fridge inventory without default expiry date!
    if (targetItem && willBeBought) {
      const { num: qtyNum } = parseQuantityNumber(targetItem.quantity);
      const parsedQty = qtyNum > 0 ? qtyNum : 1;

      await addToFridge({
        name: targetItem.name.trim(),
        quantity: parsedQty,
        unit: targetItem.unit || 'عدد',
        category: targetItem.category || 'سایـر',
        location: 'یخچال'
      });

      // Log purchasing action for analytics
      await logShoppingHistory({
        itemName: targetItem.name.trim(),
        category: targetItem.category || 'سایر',
        quantity: targetItem.quantity,
        unit: targetItem.unit || 'عدد',
        action: 'purchased'
      });

      setToastMessage(`«${targetItem.name}» خریداری شد و به موجودی یخچال اضافه گردید! ❄️`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = shoppingItems.filter(item => item.id !== id);
    setShoppingItems(updated);
    await saveShoppingList(updated);
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearList = async () => {
    setShoppingItems([]);
    await saveShoppingList([]);
    await logShoppingHistory({
      itemName: 'تمام لیست خرید',
      action: 'cleared'
    });
    setIsClearConfirmOpen(false);
    setToastMessage('لیست خرید با موفقیت پاک شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: 'shop_' + Date.now(),
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      unit: newItemUnit,
      category: newItemCategory,
      isBought: false,
      isFromFridge: false,
      statusText: 'افزوده دستی'
    };

    const updated = [...shoppingItems, newItem];
    setShoppingItems(updated);
    await saveShoppingList(updated);

    // Log item added for analytics
    await logShoppingHistory({
      itemName: newItem.name,
      category: newItem.category,
      quantity: `${newItemQuantity} ${newItemUnit}`,
      unit: newItemUnit,
      action: 'added'
    });

    setNewItemName('');
    setNewItemQuantity('1');
  };

  // Convert unit of a specific item
  const handleConvertUnit = async (item: ShoppingItem, targetUnit: string) => {
    if (item.unit === targetUnit) {
      setActiveConvertItemId(null);
      return;
    }

    const { num: currentNumeric } = parseQuantityNumber(item.quantity);
    const conversions = getIngredientConversions(item.name, item.unit, ingredients);
    
    // Find default base unit for this ingredient if available
    const matchedIng = ingredients.find(i => i.name.trim() === item.name.trim());
    const defaultUnit = matchedIng?.defaultUnit || item.unit;

    const convertedVal = convertUnitValue(currentNumeric, item.unit, targetUnit, conversions, defaultUnit, item.name);

    const updated = shoppingItems.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          unit: targetUnit,
          quantity: convertedVal
        };
      }
      return i;
    });

    setShoppingItems(updated);
    await saveShoppingList(updated);
    setActiveConvertItemId(null);
  };

  // Build text for sharing
  const itemsInFridge = shoppingItems.filter(i => i.isFromFridge && i.statusText?.includes('در یخچال موجود است'));
  const itemsToBuy = shoppingItems.filter(i => !(i.isFromFridge && i.statusText?.includes('در یخچال موجود است')));
  // Items that still need to be bought (excluding already bought / checked items)
  const unboughtItemsToBuy = itemsToBuy.filter(i => !i.isBought);

  const generateShareText = (): string => {
    const todayStr = new Date().toLocaleDateString('fa-IR');
    let text = `🛒 *لیست خرید خانه (سفره)*\n📅 تاریخ: ${todayStr}\n\n`;

    if (unboughtItemsToBuy.length > 0) {
      text += `📌 *اقلام مورد نیاز برای خرید (${unboughtItemsToBuy.length} کالا):*\n`;
      unboughtItemsToBuy.forEach((item, idx) => {
        text += `${idx + 1}. ▫️ ${item.name} (${item.quantity})\n`;
      });
    } else {
      text += `✅ هیچ قلم خریدی باقی نمانده است (تمام موارد خریداری شده یا در یخچال موجودند).\n`;
    }

    if (includeFridgeItemsInShare) {
      // Collect all fridge items from fridge inventory + shopping list in-fridge status
      const fridgeSet = new Map<string, string>();

      fridgeItems.forEach(fi => {
        if (fi && fi.name) {
          fridgeSet.set(fi.name.trim(), `${fi.quantity} ${fi.unit || ''}`.trim());
        }
      });

      itemsInFridge.forEach(si => {
        if (si && si.name && !fridgeSet.has(si.name.trim())) {
          fridgeSet.set(si.name.trim(), si.quantity);
        }
      });

      text += `\n❄️ *اقلام موجود در یخچال (بدون نیاز به خرید):*\n`;
      if (fridgeSet.size > 0) {
        let count = 1;
        fridgeSet.forEach((qty, name) => {
          text += `${count}. • ${name} (${qty})\n`;
          count++;
        });
      } else {
        text += `• (در حال حاضر آیتمی در یخچال ثبت نشده است)\n`;
      }
    }

    text += `\n✨ ارسال شده از وب‌اپلیکیشن سفره (مدیریت هوشمند آشپزخانه)`;
    return text;
  };

  const handleCopyText = async () => {
    const text = generateShareText();
    let copied = false;

    // 1. Try Clipboard API if secure
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (e) {
        console.warn('Clipboard API failed, using textarea fallback:', e);
      }
    }

    // 2. Mobile / HTTP fallback using textarea and execCommand
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-999999px';
        textArea.style.left = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 999999);

        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('execCommand copy error:', err);
      }
    }

    if (copied) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } else {
      setToastMessage('امکان کپی خودکار فراهم نشد. لطفاً متن را از کادر پیش‌نمایش به صورت دستی کپی کنید.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleWebShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'لیست خرید سفره',
          text: text
        });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
        console.warn('Web share failed, falling back to copy:', e);
      }
    }
    await handleCopyText();
  };

  const generateSnappMarketText = (): string => {
    let text = `🛒 *لیست سفارش از اسنپ مارکت (برنامه سفره)*\n\n`;
    if (unboughtItemsToBuy.length > 0) {
      unboughtItemsToBuy.forEach((item, idx) => {
        text += `${idx + 1}. ${item.name} ⬅️ مقدار: ${item.quantity}\n   لینک جستجو: https://snapp.market/shopping-list/general-search?query=${encodeURIComponent(item.name)}\n\n`;
      });
    } else {
      text += `هیچ اقلام خریدی در حال حاضر ثبت نشده است.\n`;
    }
    return text;
  };

  const handleCopySnappText = async () => {
    const text = generateSnappMarketText();
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (e) {
        console.warn('Clipboard API failed', e);
      }
    }
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-999999px';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (e) {
        console.error(e);
      }
    }
    if (copied) {
      setSnappCopySuccess(true);
      setTimeout(() => setSnappCopySuccess(false), 2500);
    }
  };

  const shareTextEncoded = encodeURIComponent(generateShareText());

  const totalToBuyCount = itemsToBuy.length;
  const boughtCount = itemsToBuy.filter(i => i.isBought).length;
  const boughtPercent = totalToBuyCount > 0 ? Math.round((boughtCount / totalToBuyCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-900/90 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500/30 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Status Notification Bar */}
      <div className="space-y-3">
        {!isOnline && (
          <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
                <WifiOff className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                  <span>حالت آفلاین لیست خرید فعال است</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold">ذخیره‌سازی محلی</span>
                </div>
                <p className="text-amber-100 text-[11px] sm:text-xs">
                  اتصال اینترنت شما قطع می‌باشد. تمام تغییرات، تیک‌زدن اقلام و خریدها به صورت کامل در حافظه دستگاه ذخیره شده و پس از اتصال به اینترنت همگام‌سازی می‌شود.
                </p>
              </div>
            </div>
            <button
              onClick={() => syncPendingData()}
              className="px-3.5 py-2 bg-white text-amber-900 font-bold text-xs rounded-xl shadow-xs hover:bg-amber-50 shrink-0 flex items-center gap-1.5 self-end sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>تلاش برای همگام‌سازی</span>
            </button>
          </div>
        )}

        {justReconnected && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md border border-emerald-500 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-xs font-bold">
              ارتباط اینترنت شما مجدداً برقرار شد. تمامی اقلام و تغییرات آفلاین با سرور همگام‌سازی گردید.
            </span>
          </div>
        )}
      </div>

      {/* Header Action Toolbar on Mobile / Full Banner on Desktop */}
      {/* Mobile Compact Single-Row Action Bar */}
      {shoppingItems.length > 0 && (
        <div className="md:hidden flex items-center gap-1.5 w-full bg-emerald-50/80 p-2 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <button
            onClick={() => setIsSnappMarketModalOpen(true)}
            className="flex-1 py-2 px-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
          >
            <Store className="w-3.5 h-3.5 text-purple-200" />
            <span>اسنپ‌مارکت</span>
          </button>

          <button
            onClick={async () => {
              const freshFridge = await fetchFridge();
              setFridgeItems(freshFridge || []);
              setIsShareModalOpen(true);
            }}
            className="flex-1 py-2 px-2 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>اشتراک‌گذاری</span>
          </button>

          <button
            onClick={handleClearAll}
            className="py-2 px-2.5 bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>پاک‌سازی</span>
          </button>
        </div>
      )}

      {/* Desktop Full Banner */}
      <div className="hidden md:flex bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-8 text-white shadow-xl items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            <span>مدیریت هوشمند خرید</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">لیست خرید هوشمند خانه</h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            اقلام موجود در یخچال به‌صورت خودکار تفکیک شده‌اند. می‌توانید واحد اقلام خرید را تغییر داده و لیست کامل را جهت خرید برای اعضای خانواده ارسال کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {shoppingItems.length > 0 && (
            <button
              onClick={() => setIsSnappMarketModalOpen(true)}
              className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-purple-500/50 cursor-pointer active:scale-95"
            >
              <Store className="w-4 h-4 text-purple-200" />
              <span>خرید آنلاین از اسنپ مارکت</span>
            </button>
          )}

          {shoppingItems.length > 0 && (
            <button
              onClick={async () => {
                const freshFridge = await fetchFridge();
                setFridgeItems(freshFridge || []);
                setIsShareModalOpen(true);
              }}
              className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>اشتراک‌گذاری لیست</span>
            </button>
          )}

          {shoppingItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl border border-white/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>پاک کردن</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Custom Shopping Item */}
      <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-xs space-y-2.5 sm:space-y-4">
        <h3 className="hidden sm:flex text-sm font-bold text-stone-800 items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-700" />
          افزودن مستقیم کالا به لیست خرید
        </h3>

        <form onSubmit={handleAddItem} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-3">
          <div className="sm:col-span-2">
            <IngredientInput
              onSelect={selected => {
                setNewItemName(selected.name);
                setNewItemCategory(selected.category);
                setNewItemUnit(selected.defaultUnit);
              }}
              placeholder="نام کالا یا ماده اولیه..."
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 sm:col-span-2">
            <input
              type="text"
              value={newItemQuantity}
              onChange={e => setNewItemQuantity(e.target.value)}
              placeholder="مقدار"
              className="w-1/3 sm:w-1/2 p-2 sm:p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-xs font-bold focus:outline-none focus:border-emerald-600"
            />
            <select
              value={newItemUnit}
              onChange={e => setNewItemUnit(e.target.value)}
              className="w-1/3 sm:w-1/2 p-2 sm:p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {COMMON_UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            <button
              type="submit"
              className="w-1/3 sm:w-full py-2 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              title="افزودن به لیست خرید"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">افزودن به لیست خرید</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 1: Items to Buy */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-stone-800 flex items-center gap-2">
            <ShoppingBag className="hidden sm:block w-5 h-5 text-emerald-700" />
            <span className="hidden sm:inline">لیست خرید (اقلام مورد نیاز)</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-black">
              {itemsToBuy.length} کالا
            </span>
          </h2>
        </div>

        {itemsToBuy.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 text-center text-stone-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-stone-700">هیچ کالایی نیازمند خرید نیست!</p>
            <p className="text-xs text-stone-400">تمام اقلام برنامه هفتگی یا در یخچال موجودند یا خریداری شده‌اند.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {itemsToBuy.map(item => {
              const conversions = getIngredientConversions(item.name, item.unit, ingredients);
              const isConverterOpen = activeConvertItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between relative gap-2 ${
                    item.isBought
                      ? 'bg-stone-50 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200/80 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Apple-standard 44px Touch Target Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleBought(item.id)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 border-2 border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50"
                        title={item.isBought ? 'علامت‌گذاری به عنوان نخریده' : 'خریداری شد'}
                        aria-label={item.isBought ? 'علامت‌گذاری به عنوان نخریده' : 'خریداری شد'}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            item.isBought
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border-2 border-stone-400 bg-white'
                          }`}
                        >
                          {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </button>

                      <div className="space-y-1 min-w-0 flex-1 pt-1">
                        <span className={`text-xs sm:text-sm font-bold block truncate ${item.isBought ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {item.name}
                        </span>

                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg inline-block">
                            {item.quantity} {item.unit}
                          </span>
                        </div>

                        {item.statusText && (
                          <span className="text-[10px] text-stone-500 block pt-0.5 truncate">
                            {item.statusText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right column action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* ONLINE SHOPPING BUTTON */}
                      {!item.isBought && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); openExternalLink(`https://snapp.market/shopping-list/general-search?query=${encodeURIComponent(item.name)}`); }}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                          title="خرید آنلاین"
                          aria-label="خرید آنلاین"
                        >
                          <Store className="w-4 h-4 text-purple-700" />
                        </button>
                      )}

                      {/* UNIT CONVERSION BUTTON (44px target) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveConvertItemId(isConverterOpen ? null : item.id)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-100 rounded-xl transition-colors flex items-center justify-center border border-stone-200 cursor-pointer active:scale-95"
                          title={`تغییر واحد (${item.unit})`}
                          aria-label={`تغییر واحد (${item.unit})`}
                        >
                          <ArrowRightLeft className="w-4 h-4 text-amber-700" />
                        </button>

                        {/* CONVERSION POPOVER DROPDOWN */}
                        {isConverterOpen && (
                          <div className="absolute left-0 sm:right-0 top-full mt-1.5 z-30 bg-white border border-stone-200 shadow-xl rounded-2xl p-2 w-44 text-xs font-medium space-y-1 animate-in fade-in slide-in-from-top-1">
                            <div className="text-[10px] font-black text-stone-400 px-2 py-1 border-b border-stone-100 flex items-center justify-between">
                              <span>تبدیل واحد {item.name}:</span>
                              <button onClick={() => setActiveConvertItemId(null)} className="p-1 text-stone-400 hover:text-stone-600 min-h-[30px] min-w-[30px] flex items-center justify-center">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-0.5 pt-1">
                              {conversions.map(c => (
                                <button
                                  key={c.unit}
                                  onClick={() => handleConvertUnit(item, c.unit)}
                                  className={`w-full text-right px-2.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[36px] cursor-pointer ${
                                    item.unit === c.unit
                                      ? 'bg-amber-500 text-white'
                                      : 'hover:bg-amber-50 text-stone-700'
                                  }`}
                                >
                                  <span>{c.unit}</span>
                                  {item.unit === c.unit && <Check className="w-3.5 h-3.5" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                        title="حذف"
                        aria-label="حذف کالا"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Available in Fridge */}
      <div className="space-y-4 pt-4 border-t border-stone-200/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Refrigerator className="w-5 h-5 text-emerald-600" />
            <span>موجود در یخچال</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-black">
              {itemsInFridge.length} کالا
            </span>
          </h2>
        </div>

        {itemsInFridge.length === 0 ? (
          <div className="bg-stone-50 p-6 rounded-2xl text-center text-xs text-stone-400">
            اقلام موجود در یخچال پس از محاسبه برنامه هفتگی در این بخش نمایش داده می‌شوند.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {itemsInFridge.map(item => {
              const conversions = getIngredientConversions(item.name, item.unit, ingredients);
              const isConverterOpen = activeConvertItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-emerald-50/50 border border-emerald-200/80 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-emerald-950 block">{item.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                          در یخچال موجود است
                        </span>
                        
                        {/* Unit converter for fridge items (44px touch target) */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setActiveConvertItemId(isConverterOpen ? null : item.id)}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                            title="تغییر واحد"
                            aria-label="تغییر واحد"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
                          </button>

                          {isConverterOpen && (
                            <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-stone-200 shadow-xl rounded-2xl p-2 w-48 text-xs font-medium space-y-1 animate-in fade-in">
                              <div className="text-[10px] font-black text-stone-400 px-2 py-1 border-b border-stone-100 flex items-center justify-between">
                                <span>تغییر واحد {item.name}:</span>
                                <button onClick={() => setActiveConvertItemId(null)} className="p-1 text-stone-400 hover:text-stone-600 min-h-[30px] min-w-[30px] flex items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-0.5 pt-1">
                                {conversions.map(c => (
                                  <button
                                    key={c.unit}
                                    onClick={() => handleConvertUnit(item, c.unit)}
                                    className={`w-full text-right px-2.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[36px] cursor-pointer ${
                                      item.unit === c.unit
                                        ? 'bg-emerald-600 text-white'
                                        : 'hover:bg-emerald-50 text-stone-700'
                                    }`}
                                  >
                                    <span>{c.unit}</span>
                                    {item.unit === c.unit && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-100 shrink-0">
                    نیازمند: {item.quantity} {item.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-24 overflow-hidden sm:overflow-y-auto">
          <div className="bg-white rounded-t-[32px] rounded-b-none sm:rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 p-5 sm:p-6 relative space-y-5 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute left-5 top-5 text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">اشتراک‌گذاری لیست خرید</h3>
                <p className="text-xs text-stone-500">ارسال مستقیم برای اعضای خانواده جهت خرید اقلام</p>
              </div>
            </div>

            {/* Toggle include fridge items */}
            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
              <span className="text-xs font-bold text-stone-700">شامل اقلام موجود در یخچال هم بشود؟</span>
              <button
                type="button"
                onClick={() => setIncludeFridgeItemsInShare(!includeFridgeItemsInShare)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  includeFridgeItemsInShare ? 'bg-amber-500 justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">پیش‌نمایش متن ارسالی:</label>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-mono text-stone-800 whitespace-pre-line max-h-44 overflow-y-auto leading-relaxed">
                {generateShareText()}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <a
                href={`sms:?body=${shareTextEncoded}`}
                className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-stone-200"
              >
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>ارسال پیامک (SMS)</span>
              </a>

              <a
                href={`https://wa.me/?text=${shareTextEncoded}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-emerald-200"
              >
                <Send className="w-5 h-5 text-emerald-600" />
                <span>واتساپ (WhatsApp)</span>
              </a>

              <a
                href={`https://t.me/share/url?url=&text=${shareTextEncoded}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-sky-200"
              >
                <ExternalLink className="w-5 h-5 text-sky-600" />
                <span>تلگرام (Telegram)</span>
              </a>

              <button
                onClick={handleWebShare}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-amber-200"
              >
                <Share2 className="w-5 h-5 text-amber-600" />
                <span>اشتراک‌گذاری سیستم</span>
              </button>

              <button
                onClick={handleCopyText}
                className="col-span-2 sm:col-span-2 p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'متن کپی شد!' : 'کپی کل متن در حافظه'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL CONFIRMATION MODAL */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-24 overflow-hidden sm:overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-5 sm:p-6 relative space-y-5">
            <button
              onClick={() => setIsClearConfirmOpen(false)}
              className="absolute left-5 top-5 text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">پاک کردن کامل لیست خرید</h3>
                <p className="text-xs text-stone-500">تأیید حذف تمام اقلام</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 font-medium leading-relaxed bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
              آیا از پاک کردن تمام اقلام موجود در لیست خرید اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={confirmClearList}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، پاک شود</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SNAPP MARKET ONLINE PURCHASE MODAL */}
      {isSnappMarketModalOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-24 overflow-hidden sm:overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-t-[32px] rounded-b-none sm:rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 p-5 sm:p-6 relative space-y-5 max-h-[88vh] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <button
              onClick={() => setIsSnappMarketModalOpen(false)}
              className="absolute left-5 top-5 text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-11 h-11 bg-purple-700 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <Store className="w-6 h-6 text-purple-100" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <span>خرید آنلاین از اسنپ مارکت</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    Snapp Market
                  </span>
                </h3>
                <p className="text-xs text-stone-500">سفارش مستقیم و جستجوی آنلاین اقلام مورد نیاز آشپزخانه</p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Info Box */}
              <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-4 rounded-2xl shadow-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>راهنمای خریدمستقیم</span>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  با کلیک روی دکمه جستجو در برابر هر کالا، مستقیماً به صفحه جستجوی آن در سوپرمارکت آنلاین اسنپ مارکت هدایت می‌شوید تا آن را به سبد خرید خود اضافه کنید.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <a
                  onClick={(e) => { e.preventDefault(); openExternalLink("https://snapp.market"); }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ورود به سایت اسنپ مارکت</span>
                </a>

                <button
                  onClick={handleCopySnappText}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {snappCopySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-purple-600" />}
                  <span>{snappCopySuccess ? 'لیست کپی شد!' : 'کپی متن اقلام برای اسنپ مارکت'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 pb-1">
                  <span>اقلام آماده خرید ({unboughtItemsToBuy.length} مورد):</span>
                </div>

                {unboughtItemsToBuy.length === 0 ? (
                  <div className="text-center py-8 bg-stone-50 rounded-2xl text-stone-400 text-xs font-medium">
                    همه اقلام خریداری شده یا در یخچال موجود هستند!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {unboughtItemsToBuy.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-stone-50 hover:bg-purple-50/50 border border-stone-200/80 p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-stone-800 block">{item.name}</span>
                          <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                            مقدار: {item.quantity}
                          </span>
                        </div>

                        <a
                          onClick={(e) => { e.preventDefault(); openExternalLink(`https://snapp.market/shopping-list/general-search?query=${encodeURIComponent(item.name)}`); }}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>جستجو در اسنپ مارکت</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer button */}
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setIsSnappMarketModalOpen(false)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                بستن راهنما
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
