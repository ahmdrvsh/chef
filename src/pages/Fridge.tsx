import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Refrigerator,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  Search,
  Minus,
  Zap,
  CheckCircle2,
  Edit3,
  X,
  MapPin,
  Snowflake,
  Box,
  Archive,
  Layers,
  AlertTriangle,
  Clock,
  BellRing,
  Bell,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  WifiOff,
  RefreshCw,
  Wifi,
  Eraser,
  Filter,
  Mic
} from 'lucide-react';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import {
  FridgeItem,
  Ingredient,
  COMMON_UNITS,
  INGREDIENT_CATEGORIES,
  INITIAL_INGREDIENTS,
  STORAGE_LOCATIONS
} from '../data/initialData';
import {
  fetchFridge,
  addToFridge,
  deleteFromFridge,
  updateFridge,
  updateFridgeItem,
  fetchIngredients,
  syncPendingData
} from '../db';
import { IngredientInput } from '../components/IngredientInput';
import {
  analyzeExpiry,
  groupFridgeItemsByExpiry,
  requestAndSendBrowserNotification
} from '../utils/expiryNotifier';
import { JalaliDatePickerModal } from '../components/JalaliDatePickerModal';
import { formatToPersianShamsi } from '../utils/jalali';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const FridgePage: React.FC = () => {
  const { isOnline, justReconnected } = useOnlineStatus();
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);

  // Mobile View Tab Switcher ('inventory' | 'add')
  const [mobileTab, setMobileTab] = useState<'inventory' | 'add'>('inventory');

  // Unified Add Section State (quick 1-click vs custom specs)
  const [addMode, setAddMode] = useState<'quick' | 'custom'>('quick');

  // Left Column Form state
  const [selectedIngredient, setSelectedIngredient] = useState<{ name: string; category: string; defaultUnit: string } | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unit, setUnit] = useState<string>('عدد');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [location, setLocation] = useState<string>('یخچال');

  // Left Column Quick Select Category & Search
  const [bankCategory, setBankCategory] = useState<string>('همه');
  const [bankSearchTerm, setBankSearchTerm] = useState<string>('');

  // Right Column Filter & Search state
  const [fridgeFilterCategory, setFridgeFilterCategory] = useState<string>('همه');
  const [fridgeFilterLocation, setFridgeFilterLocation] = useState<string>('همه');
  const [fridgeSearchTerm, setFridgeSearchTerm] = useState<string>('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<number | string>(1);
  const [editUnit, setEditUnit] = useState<string>('عدد');
  const [editCategory, setEditCategory] = useState<string>('سایـر');
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('یخچال');

  // Jalali Shamsi DatePicker Modal State
  const [isJalaliPickerOpen, setIsJalaliPickerOpen] = useState<boolean>(false);
  const [jalaliPickerTarget, setJalaliPickerTarget] = useState<'add' | 'edit'>('edit');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  const handleClearFridge = async () => {
    if (fridgeItems.length === 0) {
      showToast('یخچال شما در حال حاضر خالی است.');
      return;
    }

    if (window.confirm('آیا از پاکسازی کامل تمامی محتویات یخچال مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
      await updateFridge([]);
      setFridgeItems([]);
      showToast('تمامی محتویات یخچال با موفقیت پاکسازی شد.');
    }
  };

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Expiration Alert & Filter State
  const [warningDaysThreshold, setWarningDaysThreshold] = useState<number>(3);
  const [fridgeFilterExpiry, setFridgeFilterExpiry] = useState<string>('همه');
  const [expiryAlertDismissed, setExpiryAlertDismissed] = useState<boolean>(false);
  const [isExpiryListOpen, setIsExpiryListOpen] = useState<boolean>(false);
  const [isBankFilterOpen, setIsBankFilterOpen] = useState<boolean>(false);
  const [isFridgeFilterOpen, setIsFridgeFilterOpen] = useState<boolean>(false);

  // Accordion state for inventory categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleExpandAllCategories = () => {
    const allExp: Record<string, boolean> = {};
    groupedFridgeItems.forEach(group => {
      allExp[group.category] = true;
    });
    setExpandedCategories(allExp);
  };

  const handleCollapseAllCategories = () => {
    setExpandedCategories({});
  };

  useEffect(() => {
    const handleClearEvent = () => {
      handleClearFridge();
    };
    window.addEventListener('clear-fridge', handleClearEvent);
    return () => window.removeEventListener('clear-fridge', handleClearEvent);
  }, [fridgeItems]);

  // Expiration Analysis & Grouping
  const expiryGroups = useMemo(() => {
    return groupFridgeItemsByExpiry(fridgeItems, warningDaysThreshold);
  }, [fridgeItems, warningDaysThreshold]);

  const totalExpiryAlertCount = expiryGroups.expired.length + expiryGroups.expiringSoon.length;

  const handleClearAllExpiredItems = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (expiryGroups.expired.length === 0) return;

    const count = expiryGroups.expired.length;
    const expiredIds = new Set(expiryGroups.expired.map(exp => exp.item.id));
    const remaining = fridgeItems.filter(item => !expiredIds.has(item.id));

    setFridgeItems(remaining);
    const updated = await updateFridge(remaining);
    if (Array.isArray(updated)) {
      setFridgeItems(updated);
    }
    showToast(`${count} کالای منقضی شده با موفقیت از موجودی حذف گردید.`);
  };

  const handleEnableNotifications = async () => {
    if (totalExpiryAlertCount === 0) {
      showToast('در حال حاضر کالای منقضی یا نزدیک به انقضایی وجود ندارد.');
      return;
    }

    const title = `هشدار انقضای مواد غذایی (سفره)`;
    const body = `${expiryGroups.expired.length} کالا منقضی شده و ${expiryGroups.expiringSoon.length} کالا در آستانه انقضا قرار دارد.`;

    const success = await requestAndSendBrowserNotification(title, body);
    if (success) {
      showToast('نوتیفیکیشن با موفقیت روی دستگاه شما ارسال شد.');
    } else {
      showToast('امکان ارسال نوتیفیکیشن فعال نشد یا توسط مرورگر لغو گردید.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fridgeData = await fetchFridge();
    if (Array.isArray(fridgeData)) {
      setFridgeItems(fridgeData);
    } else {
      setFridgeItems([]);
    }

    const ingData = await fetchIngredients();
    if (Array.isArray(ingData) && ingData.length > 0) {
      setAllIngredients(ingData);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Add Item via Form
  const handleAddItemFromForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !selectedIngredient.name.trim()) return;

    const itemName = selectedIngredient.name.trim();
    const itemQty = Number(quantity) || 1;
    const itemUnit = unit || selectedIngredient.defaultUnit || 'عدد';
    const itemCat = selectedIngredient.category || 'سایـر';
    const itemLoc = location || 'یخچال';

    const updated = await addToFridge({
      name: itemName,
      quantity: itemQty,
      unit: itemUnit,
      category: itemCat,
      expiryDate: expiryDate || undefined,
      location: itemLoc
    });

    setFridgeItems(updated);
    setSelectedIngredient(null);
    setQuantity(1);
    setExpiryDate('');
    setLocation('یخچال');
    showToast(`«${itemName}» با مقدار ${itemQty} ${itemUnit} به ${itemLoc} اضافه شد.`);
  };

  // Instant 1-Click Add Item from Ingredients Bank
  const handleQuickAdd = async (ing: Ingredient) => {
    const defaultQty = 1;
    const defaultLoc = 'یخچال';
    const updated = await addToFridge({
      name: ing.name,
      quantity: defaultQty,
      unit: ing.defaultUnit || 'عدد',
      category: ing.category,
      location: defaultLoc
    });

    setFridgeItems(updated);
    showToast(`✓ «${ing.name}» (۱ ${ing.defaultUnit || 'عدد'}) به موجودی اضافه شد.`);
  };

  // Switch to custom form with pre-selected ingredient from quick bank
  const handleConfigureIngredient = (ing: Ingredient) => {
    setSelectedIngredient({
      name: ing.name,
      category: ing.category,
      defaultUnit: ing.defaultUnit || 'عدد'
    });
    setUnit(ing.defaultUnit || 'عدد');
    setQuantity(1);
    setAddMode('custom');
    showToast(`«${ing.name}» جهت تنظیم مقدار، تاریخ و محل نگهداری انتخاب گردید.`);
  };

  // Open Edit Modal for a Fridge Item
  const handleOpenEditModal = (item: FridgeItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit || 'عدد');
    setEditCategory(item.category || 'سایـر');
    setEditExpiryDate(item.expiryDate || '');
    setEditLocation(item.location || 'یخچال');
  };

  // Submit Edited Item
  const handleSaveEditedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedQty = Math.max(0.1, Number(editQuantity) || 1);
    const updated = await updateFridgeItem(editingItem.id, {
      name: editName.trim(),
      quantity: updatedQty,
      unit: editUnit,
      category: editCategory,
      expiryDate: editExpiryDate || undefined,
      location: editLocation
    });

    setFridgeItems(updated);
    setEditingItem(null);
    showToast(`تغییرات «${editName}» با موفقیت ذخیره شد.`);
  };

  // Quick Quantity Increase / Decrease directly on Card
  const handleUpdateQuantity = async (e: React.MouseEvent, item: FridgeItem, delta: number) => {
    e.stopPropagation();
    const newQty = Math.max(0, Number((item.quantity + delta).toFixed(1)));
    if (newQty === 0) {
      const updated = await deleteFromFridge(item.id);
      setFridgeItems(updated);
      showToast(`«${item.name}» از لیست حذف شد.`);
    } else {
      const updated = await updateFridgeItem(item.id, { quantity: newQty });
      setFridgeItems(updated);
    }
  };

  // Delete Item
  const handleDeleteFridgeItem = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const updated = await deleteFromFridge(id);
    setFridgeItems(updated);
    showToast(`«${name}» از لیست حذف شد.`);
  };

  // Helper for location badges
  const getLocationBadge = (locName?: string) => {
    switch (locName) {
      case 'فریزر':
        return { label: 'فریزر', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: <Snowflake className="w-3 h-3 text-cyan-600" /> };
      case 'کابینت':
        return { label: 'کابینت', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: <Box className="w-3 h-3 text-amber-600" /> };
      case 'انبار':
        return { label: 'انبار', bg: 'bg-stone-100 text-stone-700 border-stone-200', icon: <Archive className="w-3 h-3 text-stone-500" /> };
      case 'سایر':
        return { label: 'سایر', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: <MapPin className="w-3 h-3 text-purple-600" /> };
      case 'یخچال':
      default:
        return { label: 'یخچال', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <Refrigerator className="w-3 h-3 text-emerald-600" /> };
    }
  };

  // Filtered ingredients in Bank (Left Column)
  const filteredBankIngredients = useMemo(() => {
    const list = Array.isArray(allIngredients) ? allIngredients : [];
    return list.filter(ing => {
      if (!ing || !ing.name) return false;
      const matchesSearch = bankSearchTerm.trim() === '' || ing.name.toLowerCase().includes(bankSearchTerm.toLowerCase());
      const matchesCategory = bankCategory === 'همه' || ing.category === bankCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allIngredients, bankCategory, bankSearchTerm]);

  // Filtered Fridge Items (Right Column)
  const filteredFridgeItems = useMemo(() => {
    const list = Array.isArray(fridgeItems) ? fridgeItems : [];
    return list.filter(item => {
      if (!item || !item.name) return false;
      const matchesSearch = fridgeSearchTerm.trim() === '' || item.name.toLowerCase().includes(fridgeSearchTerm.toLowerCase());
      const matchesCategory = fridgeFilterCategory === 'همه' || item.category === fridgeFilterCategory;
      const matchesLocation = fridgeFilterLocation === 'همه' || (item.location || 'یخچال') === fridgeFilterLocation;

      // Expiry filter
      const analysis = analyzeExpiry(item.expiryDate, warningDaysThreshold);
      let matchesExpiry = true;
      if (fridgeFilterExpiry === 'هشدار انقضا') {
        matchesExpiry = analysis.status === 'expired' || analysis.status === 'expiring_soon';
      } else if (fridgeFilterExpiry === 'منقضی شده') {
        matchesExpiry = analysis.status === 'expired';
      } else if (fridgeFilterExpiry === 'نزدیک انقضا') {
        matchesExpiry = analysis.status === 'expiring_soon';
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesExpiry;
    });
  }, [fridgeItems, fridgeFilterCategory, fridgeFilterLocation, fridgeSearchTerm, fridgeFilterExpiry, warningDaysThreshold]);

  // Grouped filtered fridge items by category
  const groupedFridgeItems = useMemo(() => {
    const map = new Map<string, FridgeItem[]>();

    (filteredFridgeItems || []).forEach(item => {
      const cat = item.category || 'سایر و تنقلات';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });

    const result: { category: string; items: FridgeItem[] }[] = [];

    // Sort with INGREDIENT_CATEGORIES order if possible, then others
    INGREDIENT_CATEGORIES.forEach(cat => {
      if (map.has(cat) && map.get(cat)!.length > 0) {
        result.push({ category: cat, items: map.get(cat)! });
        map.delete(cat);
      }
    });

    // Add any remaining categories not in INGREDIENT_CATEGORIES
    map.forEach((items, category) => {
      if (items.length > 0) {
        result.push({ category, items });
      }
    });

    return result;
  }, [filteredFridgeItems]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'سبزیجات و صیفی‌جات':
        return '🥦';
      case 'گوشت قرمز و ماکیان':
        return '🥩';
      case 'ماهی و مأکولات دریایی':
        return '🐟';
      case 'حبوبات و غلات':
        return '🫘';
      case 'برنج، نان و آرد':
        return '🌾';
      case 'لبنیات و تخم‌مرغ':
        return '🥛';
      case 'ادویه‌جات و چاشنی‌ها':
        return '🧂';
      case 'روغن، سس و رب':
        return '🫒';
      case 'مغزها و خشکبار':
        return '🥜';
      case 'میوه‌جات و مرکبات':
        return '🍎';
      case 'کنسروجات و ترشیجات':
        return '🥫';
      case 'مربا، عسل و شیرین‌کننده‌ها':
        return '🍯';
      case 'نوشیدنی‌ها و دم‌نوش‌ها':
        return '☕';
      case 'شیرینی و لوازم قنادی':
        return '🧁';
      default:
        return '📦';
    }
  };

  // Map of item names in fridge for quick lookup
  const fridgeItemNamesMap = useMemo(() => {
    const map = new Map<string, number>();
    const list = Array.isArray(fridgeItems) ? fridgeItems : [];
    list.forEach(i => {
      if (i && i.name) map.set(i.name.trim(), i.quantity);
    });
    return map;
  }, [fridgeItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Offline Status Notification Bar */}
      {!isOnline && (
        <div className="p-4 bg-teal-800 text-white rounded-3xl shadow-lg border border-teal-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
              <WifiOff className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                <span>حالت آفلاین یخچال فعال است</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold">ذخیره محلی</span>
              </div>
              <p className="text-teal-100 text-[11px] sm:text-xs">
                محتویات یخچال و تاریخ‌های انقضا به صورت کامل روی حافظه دستگاه ذخیره شده و بدون اینترنت قابل مشاهده و ویرایش است.
              </p>
            </div>
          </div>
          <button
            onClick={() => syncPendingData()}
            className="px-3.5 py-2 bg-white text-teal-900 font-bold text-xs rounded-xl shadow-xs hover:bg-teal-50 shrink-0 flex items-center gap-1.5 self-end sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>تلاش برای همگام‌سازی</span>
          </button>
        </div>
      )}

      {justReconnected && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md border border-emerald-500 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-xs font-bold">
            ارتباط اینترنت برقرار شد - تغییرات یخچال با موفقیت همگام‌سازی گردید.
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-900/90 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner (Hidden on Mobile) */}
      <div className="hidden sm:flex bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Refrigerator className="w-4 h-4 text-emerald-200" />
            <span>مدیریت هوشمند موجودی خانه</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">محتویات یخچال، فریزر و کابینت</h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            با ۱ کلیک مواد اولیه را اضافه کنید و هر زمان خواستید با کلیک روی کارت هر ماده، مقدار، واحد، تاریخ انقضا یا محل نگهداری آن را ویرایش کنید.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 hover:from-black hover:to-teal-950 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg border border-emerald-400/30 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            title="دستیار صوتی هوشمند سرآشپز"
          >
            <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>دستیار صوتی هوشمند</span>
          </button>

          <button
            onClick={handleClearFridge}
            className="p-3 bg-rose-600/90 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition flex items-center justify-center gap-1.5 border border-rose-400/40 shadow-lg cursor-pointer active:scale-95"
            title="پاکسازی کامل یخچال"
          >
            <Eraser className="w-4 h-4 text-rose-200" />
            <span className="hidden md:inline">پاکسازی یخچال</span>
          </button>

          <Link
            to="/what-to-cook"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-5 h-5 text-amber-900" />
            پیشنهاد غذا با این مواد (چی بپزم؟)
          </Link>
        </div>
      </div>

      {/* MINIMAL EXPIRATION NOTIFICATION & WARNING ALERT BANNER */}
      {totalExpiryAlertCount > 0 && !expiryAlertDismissed && (
        <div
          className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs border space-y-3 transition-colors ${
            expiryGroups.expired.length > 0
              ? 'bg-rose-50/90 border-rose-200/90 text-stone-900'
              : 'bg-amber-50/90 border-amber-200/90 text-stone-900'
          }`}
        >
          {/* 1-Line Bar */}
          <div
            onClick={() => setIsExpiryListOpen(!isExpiryListOpen)}
            className="flex items-center justify-between gap-2 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-2xs shrink-0 ${
                  expiryGroups.expired.length > 0
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {expiryGroups.expired.length > 0 ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-black truncate">
                    {expiryGroups.expired.length > 0 && (
                      <span className="text-rose-700">
                        {expiryGroups.expired.length} ماده منقضی شده
                      </span>
                    )}
                    {expiryGroups.expired.length > 0 && expiryGroups.expiringSoon.length > 0 && (
                      <span className="text-stone-400"> و </span>
                    )}
                    {expiryGroups.expiringSoon.length > 0 && (
                      <span className="text-amber-800">
                        {expiryGroups.expiringSoon.length} ماده در آستانه انقضا
                      </span>
                    )}
                  </h2>
                  <span className="text-[10px] text-stone-600 font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200/80 shadow-2xs whitespace-nowrap">
                    {isExpiryListOpen ? 'بستن لیست ▲' : 'مشاهده اقلام ▼'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpiryListOpen(!isExpiryListOpen);
                }}
                className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition-all cursor-pointer"
                title="تغییر وضعیت نمایش لیست"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpiryListOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpiryAlertDismissed(true);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white transition-colors cursor-pointer"
                title="بستن هشدار"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Items List */}
          {isExpiryListOpen && (
            <div className="pt-3 border-t border-stone-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-600 font-bold">بازه روزهای هشدار:</span>
                <select
                  value={warningDaysThreshold}
                  onChange={e => setWarningDaysThreshold(Number(e.target.value))}
                  className="bg-white text-stone-800 border border-stone-200 text-xs font-bold px-2 py-1 rounded-xl shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value={1}>۱ روز</option>
                  <option value={3}>۳ روز</option>
                  <option value={5}>۵ روز</option>
                  <option value={7}>۷ روز</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {expiryGroups.expired.map(({ item, analysis }) => (
                  <div
                    key={`banner_exp_${item.id}`}
                    className="bg-white border border-rose-200 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-rose-950 truncate">{item.name}</span>
                        <span className="text-[10px] font-extrabold text-stone-600 dir-ltr shrink-0 bg-stone-100 px-1.5 py-0.5 rounded-md">{item.quantity} {item.unit}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md inline-block">
                        {analysis.badgeText}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs cursor-pointer"
                        title="ویرایش تاریخ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFridgeItem(e, item.id, item.name)}
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs cursor-pointer"
                        title="حذف کالا"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {expiryGroups.expiringSoon.map(({ item, analysis }) => (
                  <div
                    key={`banner_soon_${item.id}`}
                    className="bg-white border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-amber-950 truncate">{item.name}</span>
                        <span className="text-[10px] font-extrabold text-stone-600 dir-ltr shrink-0 bg-stone-100 px-1.5 py-0.5 rounded-md">{item.quantity} {item.unit}</span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-block">
                        {analysis.badgeText}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs cursor-pointer"
                        title="ویرایش تاریخ انقضا"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/80 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/what-to-cook"
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-[11px] rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                    <span>پیشنهاد پخت با این مواد</span>
                  </Link>

                  {expiryGroups.expired.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllExpiredItems}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف یکجای اقلام منقضی ({expiryGroups.expired.length})</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-[11px] rounded-xl border border-stone-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>نوتیفیکیشن</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden grid grid-cols-2 gap-1.5 p-1.5 bg-stone-200/80 rounded-2xl sticky top-16 z-20 backdrop-blur-md shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab('inventory')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'inventory'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Refrigerator className="w-4 h-4" />
          <span>موجودی ({fridgeItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('add')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'add'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>افزودن</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Unified Add Section (Quick 1-Click + Custom Detailed Specs) */}
        <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'add' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            {/* Header */}
            <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  افزودن ماده غذایی به موجودی
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  افزودن تک‌کلیکی از بانک مواد یا ثبت سفارشی با جزئیات کامل
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                {allIngredients.length} ماده آماده
              </span>
            </div>

            {/* Mode Segmented Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100/90 rounded-2xl">
              <button
                type="button"
                onClick={() => setAddMode('quick')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addMode === 'quick'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${addMode === 'quick' ? 'text-amber-500 fill-amber-500' : ''}`} />
                <span>افزودن تک‌کلیکی</span>
              </button>

              <button
                type="button"
                onClick={() => setAddMode('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addMode === 'custom'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Edit3 className={`w-3.5 h-3.5 ${addMode === 'custom' ? 'text-emerald-600' : ''}`} />
                <span>ثبت سفارشی (دقیق)</span>
              </button>
            </div>

            {/* SECTION 1: Quick 1-Click Bank */}
            {addMode === 'quick' && (
              <div className="space-y-3.5 animate-in fade-in">
                {/* Search Bar & Filter Button Next to It */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={bankSearchTerm}
                      onChange={e => setBankSearchTerm(e.target.value)}
                      placeholder="جستجو در بانک ۵۰۰+ ماده اولیه..."
                      className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBankFilterOpen(!isBankFilterOpen)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[38px] cursor-pointer shrink-0 ${
                      bankCategory !== 'همه' || isBankFilterOpen
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                    title="فیلتر دسته‌بندی"
                  >
                    <Filter className="w-4 h-4" />
                    {bankCategory !== 'همه' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                </div>

                {/* Collapsible Categories Bar when Filter is active */}
                {isBankFilterOpen && (
                  <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-stone-50 rounded-xl border border-stone-200/80 scrollbar-none animate-in fade-in">
                    <button
                      onClick={() => setBankCategory('همه')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        bankCategory === 'همه'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                      }`}
                    >
                      همه
                    </button>
                    {INGREDIENT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setBankCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          bankCategory === cat
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Ingredients Grid Box */}
                <div className="max-h-96 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  {filteredBankIngredients.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs font-medium">
                      ماده‌ای متناسب با جستجوی شما یافت نشد.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {filteredBankIngredients.map((ing, idx) => {
                        const existingQty = fridgeItemNamesMap.get(ing.name.trim());
                        const isInFridge = existingQty !== undefined;

                        return (
                          <div
                            key={`${ing.id}_${idx}`}
                            onClick={() => handleQuickAdd(ing)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                              isInFridge
                                ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100/70 shadow-2xs'
                                : 'bg-stone-50/90 border-stone-200 hover:border-amber-400 hover:bg-amber-50/60 shadow-2xs'
                            }`}
                            title="کلیک برای افزودن تک‌کلیکی به یخچال"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <span className="text-xs font-black text-stone-900 block leading-tight break-words">
                                {ing.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-medium text-stone-500">
                                  {ing.defaultUnit}
                                </span>
                                {isInFridge && (
                                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                    ✓ در یخچال ({existingQty})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-stone-400 text-center pt-1 border-t border-stone-100">
                  💡 جهت تعیین تاریخ انقضا، مقدار دلخواه یا محل نگهداری، از تب «ثبت سفارشی» استفاده کنید.
                </p>
              </div>
            )}

            {/* SECTION 2: Custom Specs Form */}
            {addMode === 'custom' && (
              <form onSubmit={handleAddItemFromForm} className="space-y-3.5 animate-in fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-stone-600">
                      نام ماده اولیه:
                    </label>
                    {selectedIngredient && (
                      <button
                        type="button"
                        onClick={() => setSelectedIngredient(null)}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        پاک کردن انتخاب
                      </button>
                    )}
                  </div>
                  <IngredientInput
                    onSelect={selected => {
                      setSelectedIngredient(selected);
                      setUnit(selected.defaultUnit || 'عدد');
                    }}
                    selectedName={selectedIngredient ? selectedIngredient.name : ''}
                    placeholder="مثلاً: پیاز، سیر، گوشت، زعفران..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">مقدار:</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">واحد اندازه: </label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {COMMON_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">محل نگهداری:</label>
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {STORAGE_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">تاریخ انقضا (تقویم شمسی):</label>
                    <button
                      type="button"
                      onClick={() => {
                        setJalaliPickerTarget('add');
                        setIsJalaliPickerOpen(true);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-400 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {expiryDate ? formatToPersianShamsi(expiryDate) : 'انتخاب از تقویم'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                        تقویم
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedIngredient}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  ذخیره با مشخصات دقیق
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Refrigerator Inventory (موجودی خانه و امکان ویرایش با کلیک) */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'inventory' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            {/* Header & Item Counter */}
            <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100/80 text-emerald-800 rounded-2xl">
                  <Refrigerator className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-800">موجودی ثبت‌شده شما</h2>
                  <p className="text-xs text-stone-500">جهت ویرایش مقدار، واحد، تاریخ انقضا یا محل نگهداری، روی کارت کلیک کنید.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearFridge}
                  className="sm:hidden p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200/80 shadow-xs cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                  title="پاکسازی کامل یخچال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                  {(Array.isArray(fridgeItems) ? fridgeItems : []).length} ماده اولیه
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fridgeSearchTerm}
                    onChange={e => setFridgeSearchTerm(e.target.value)}
                    placeholder="جستجو در بین مواد موجود..."
                    className="w-full pr-10 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                  />
                  {fridgeSearchTerm && (
                    <button
                      onClick={() => setFridgeSearchTerm('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Button next to Search Box */}
                <button
                  type="button"
                  onClick={() => setIsFridgeFilterOpen(!isFridgeFilterOpen)}
                  className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer shrink-0 ${
                    fridgeFilterLocation !== 'همه' || fridgeFilterExpiry !== 'همه' || fridgeFilterCategory !== 'همه' || isFridgeFilterOpen
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                  title="گزینه فیلتر"
                >
                  <Filter className="w-4 h-4" />
                  <span>فیلتر</span>
                  {(fridgeFilterLocation !== 'همه' || fridgeFilterExpiry !== 'همه' || fridgeFilterCategory !== 'همه') && (
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Dropdown Filter Panel when Filter button is clicked */}
              {isFridgeFilterOpen && (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Expiry Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">وضعیت انقضا:</label>
                      <select
                        value={fridgeFilterExpiry}
                        onChange={e => setFridgeFilterExpiry(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="همه">همه</option>
                        {totalExpiryAlertCount > 0 && <option value="هشدار انقضا">🚨 هشدار انقضا ({totalExpiryAlertCount})</option>}
                        <option value="منقضی شده">منقضی شده</option>
                        <option value="نزدیک انقضا">نزدیک انقضا</option>
                      </select>
                    </div>

                    {/* Location Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">محل نگهداری:</label>
                      <select
                        value={fridgeFilterLocation}
                        onChange={e => setFridgeFilterLocation(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="همه">همه</option>
                        {STORAGE_LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">دسته‌بندی:</label>
                      <select
                        value={fridgeFilterCategory}
                        onChange={e => setFridgeFilterCategory(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="همه">همه</option>
                        {INGREDIENT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Categorized Accordion List */}
            {filteredFridgeItems.length === 0 ? (
              <div className="bg-stone-50/80 rounded-3xl p-12 text-center border border-dashed border-stone-200 space-y-3">
                <Refrigerator className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-700">
                  {fridgeItems.length === 0
                    ? 'لیست موجودی شما در حال حاضر خالی است'
                    : 'هیچ ماده‌ای با این مشخصات در موجودی یافت نشد'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  از ستون سمت راست مواد اولیه را با ۱ کلیک یا جستجو اضافه کنید.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Categorized Toolbar */}
                {groupedFridgeItems.length > 1 && (
                  <div className="flex items-center justify-between px-1 text-xs text-stone-500 pb-1">
                    <span className="font-bold">
                      {filteredFridgeItems.length} قلم در {groupedFridgeItems.length} دسته‌بندی
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExpandAllCategories}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        باز کردن همه
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleCollapseAllCategories}
                        className="text-[11px] font-bold text-stone-500 hover:text-stone-700 hover:underline cursor-pointer"
                      >
                        بستن همه
                      </button>
                    </div>
                  </div>
                )}

                {/* Category Accordion Cards */}
                {groupedFridgeItems.map((group) => {
                  const isExpanded = Boolean(expandedCategories[group.category]) || Boolean(fridgeSearchTerm.trim());

                  return (
                    <div
                      key={group.category}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-emerald-200"
                    >
                      {/* Category Header Card */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(group.category)}
                        className={`w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer select-none ${
                          isExpanded ? 'bg-stone-50/70' : 'bg-white hover:bg-stone-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {getCategoryIcon(group.category)}
                          </div>
                          <div className="min-w-0 text-right">
                            <h3 className="text-xs sm:text-sm font-black text-stone-900 truncate">
                              {group.category}
                            </h3>
                            <span className="text-[11px] font-bold text-stone-500">
                              {group.items.length} قلم کالا
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold bg-white text-stone-600 px-2.5 py-1 rounded-xl border border-stone-200/80 shadow-2xs hidden sm:inline-block">
                            {isExpanded ? 'بستن دسته ▲' : 'مشاهده اقلام ▼'}
                          </span>
                          <div
                            className={`p-1.5 rounded-xl bg-stone-100 text-stone-600 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 bg-emerald-100 text-emerald-800' : ''
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>

                      {/* Expandable Items List Under Category */}
                      {isExpanded && (
                        <div className="p-3 sm:p-4 pt-2 bg-stone-50/30 border-t border-stone-100 space-y-2 animate-in fade-in duration-200">
                          <div className="space-y-2">
                            {group.items.map((item, idx) => {
                              const locBadge = getLocationBadge(item.location);
                              const expiryAnalysis = analyzeExpiry(item.expiryDate, warningDaysThreshold);

                              return (
                                <div
                                  key={`${item.id}_${idx}`}
                                  onClick={() => handleOpenEditModal(item)}
                                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 bg-white border hover:border-emerald-300 hover:shadow-xs ${expiryAnalysis.cardBorderClass} shadow-2xs`}
                                >
                                  {/* Right side: Item Name & Info Badges */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="min-w-0 space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs sm:text-sm font-black text-stone-900">
                                          {item.name}
                                        </span>
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${locBadge.bg}`}>
                                          {locBadge.label}
                                        </span>
                                        {(expiryAnalysis.status === 'expired' || expiryAnalysis.status === 'expiring_soon') && (
                                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${expiryAnalysis.badgeClass}`}>
                                            {expiryAnalysis.badgeText}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Left side: Quantity + Edit & Delete Actions */}
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    {/* Quantity & Unit Pill */}
                                    <div className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-xl dir-ltr shadow-2xs">
                                      <span>{item.quantity}</span>
                                      <span>{item.unit}</span>
                                    </div>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(item);
                                      }}
                                      className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                      title="ویرایش"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>

                                    {/* Delete Button (44px touch target) */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteFridgeItem(e, item.id, item.name)}
                                      className="w-10 h-10 min-w-[40px] min-h-[40px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                      title={`حذف ${item.name}`}
                                      aria-label={`حذف ${item.name}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL DIALOG */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto">
          <div className="bg-white w-full max-w-md max-h-[90vh] flex flex-col rounded-t-[32px] rounded-b-none sm:rounded-3xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-emerald-200" />
                <h3 className="font-black text-base sm:text-lg truncate">
                  ویرایش مشخصات «{editingItem.name}»
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditedItem} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">نام ماده اولیه:</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">دسته‌بندی:</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:outline-none"
                  >
                    {INGREDIENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">مقدار:</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={editQuantity}
                      onChange={e => setEditQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-center text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">واحد اندازه:</label>
                    <select
                      value={editUnit}
                      onChange={e => setEditUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:bg-white focus:outline-none"
                    >
                      {COMMON_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Storage Location */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">محل نگهداری:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {STORAGE_LOCATIONS.map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setEditLocation(loc)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          editLocation === loc
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">تاریخ انقضا (تقویم هجری شمسی):</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setJalaliPickerTarget('edit');
                        setIsJalaliPickerOpen(true);
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-stone-50 hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-400 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate">
                          {editExpiryDate ? formatToPersianShamsi(editExpiryDate) : 'انتخاب تاریخ از تقویم شمسی'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                        تقویم شمسی
                      </span>
                    </button>

                    {editExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setEditExpiryDate('')}
                        className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="حذف تاریخ انقضا"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Fixed Bottom Actions */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Jalali Shamsi DatePicker Modal */}
      <JalaliDatePickerModal
        isOpen={isJalaliPickerOpen}
        onClose={() => setIsJalaliPickerOpen(false)}
        selectedGregorianDate={jalaliPickerTarget === 'edit' ? editExpiryDate : expiryDate}
        onSelectDate={(dateStr) => {
          if (jalaliPickerTarget === 'edit') {
            setEditExpiryDate(dateStr);
          } else {
            setExpiryDate(dateStr);
          }
        }}
        itemName={jalaliPickerTarget === 'edit' ? editName : (selectedIngredient?.name || '')}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />
    </div>
  );
};
