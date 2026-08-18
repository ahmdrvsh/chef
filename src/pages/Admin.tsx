import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChefHat,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Database,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Key,
  Users,
  Eye,
  Sliders,
  UserCheck,
  UserX,
  Lock,
  Edit3,
  X,
  Check,
  ShieldAlert,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ArrowRightLeft,
  Upload,
  Image as ImageIcon,
  Instagram,
  Save,
  Link as LinkIcon,
  BarChart2,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Download,
  PieChart,
  Tag
} from 'lucide-react';
import { Recipe, Ingredient, IngredientConversion, CATEGORIES, INGREDIENT_CATEGORIES, COMMON_UNITS, isCategoryMatch } from '../data/initialData';
import { fetchRecipes, fetchIngredients, deleteRecipe, addRecipe, addIngredient, deleteIngredient, updateRecipe, updateIngredient, fetchAnalyticsSummary } from '../db';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { BatchImportRecipeModal } from '../components/BatchImportRecipeModal';
import { EditRecipeModal } from '../components/EditRecipeModal';
import { EditIngredientModal } from '../components/EditIngredientModal';
import { IngredientsDatabaseModal } from '../components/IngredientsDatabaseModal';
import { Link } from 'react-router-dom';
import { useAuth, StoredUser } from '../context/AuthContext';
import { isValidIranianMobile, formatIranianMobile } from '../utils/authUtils';

export const AdminPage: React.FC = () => {
  const { user: currentUser, users, updateUserInList, deleteUserFromList, addUserToList, syncUsersFromServer } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'recipes' | 'ingredients' | 'settings' | 'analytics'>('users');

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsFilterType, setAnalyticsFilterType] = useState<'all' | 'shopping' | 'meal'>('all');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [recipeStatusFilter, setRecipeStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [ingredientSearch, setIngredientSearch] = useState('');

  // Password Change State
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);

  // Add Ingredient Form
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState(INGREDIENT_CATEGORIES[0]);
  const [newIngUnit, setNewIngUnit] = useState(COMMON_UNITS[0]);
  const [newIngCalories, setNewIngCalories] = useState('150');
  const [newIngConversions, setNewIngConversions] = useState<IngredientConversion[]>([]);
  const [newIngTargetUnit, setNewIngTargetUnit] = useState('گرم');
  const [newIngTargetRatio, setNewIngTargetRatio] = useState('1');
  const [ingSuccessMessage, setIngSuccessMessage] = useState('');

  // Modals for Editing Recipe & Ingredient
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Add Modal & Toast States
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleBatchImportRecipes = async (newRecipes: Omit<Recipe, 'id'>[]) => {
    let addedCount = 0;
    for (const recipe of newRecipes) {
      await addRecipe(recipe);
      addedCount++;
    }
    await loadData();
    showToast(`تعداد ${addedCount} دستور پخت جدید با موفقیت اضافه شد.`);
  };

  useEffect(() => {
    loadData();
    syncUsersFromServer();
  }, []);

  const loadData = async () => {
    const [rData, iData] = await Promise.all([fetchRecipes(), fetchIngredients()]);
    setRecipes(rData);
    setIngredients(iData);
    loadAnalytics();
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    const data = await fetchAnalyticsSummary();
    setAnalyticsData(data);
    setLoadingAnalytics(false);
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
    csvContent += "شناسه,کاربر,نوع رویداد,عنوان / کالا,دسته / جزییات,اکشن,تاریخ\n";

    if (analyticsData.shoppingHistory) {
      analyticsData.shoppingHistory.forEach((item: any) => {
        csvContent += `"${item.id || ''}","${item.userName || item.userId || 'کاربر'}","لیست خرید","${item.itemName || ''}","${item.category || ''}","${item.action || ''}","${item.dateStr || ''}"\n`;
      });
    }

    if (analyticsData.mealHistory) {
      analyticsData.mealHistory.forEach((item: any) => {
        csvContent += `"${item.id || ''}","${item.userName || item.userId || 'کاربر'}","برنامه هفتگی","${item.recipeTitle || ''}","${item.dayName || ''} - ${item.mealType || ''}","${item.action || ''}","${item.dateStr || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sofreh_user_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('خروجی اکسل با موفقیت دانلود شد.');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Recipe Operations
  const handleDeleteRecipe = async (id: string, title: string) => {
    if (window.confirm(`آیا از حذف دستور پخت "${title}" اطمینان دارید؟`)) {
      const updated = await deleteRecipe(id);
      setRecipes(updated);
      showToast(`دستور پخت "${title}" با موفقیت حذف شد.`);
    }
  };

  const handleApproveRecipe = async (r: Recipe) => {
    const updated = await updateRecipe(r.id, { status: 'published' });
    setRecipes(updated);
    showToast(`دستور پخت "${r.title}" تایید و با موفقیت منتشر گردید.`);
  };

  const handleRejectRecipe = async (r: Recipe) => {
    const updated = await updateRecipe(r.id, { status: 'rejected' });
    setRecipes(updated);
    showToast(`دستور پخت "${r.title}" رد گردید.`);
  };

  // Ingredient Operations
  const handleAddNewIngConversion = () => {
    const ratioNum = parseFloat(newIngTargetRatio);
    if (isNaN(ratioNum) || ratioNum <= 0) {
      alert('لطفاً نسبت معتبر وارد کنید.');
      return;
    }
    if (newIngTargetUnit === newIngUnit) {
      alert('واحد مقصد نمی‌تواند همان واحد اصلی باشد.');
      return;
    }
    if (newIngConversions.some(c => c.unit === newIngTargetUnit)) {
      alert('این واحد قبلاً اضافه شده است.');
      return;
    }
    setNewIngConversions(prev => [...prev, { unit: newIngTargetUnit, ratio: ratioNum }]);
    setNewIngTargetRatio('1');
  };

  const handleRemoveNewIngConversion = (unitToRemove: string) => {
    setNewIngConversions(prev => prev.filter(c => c.unit !== unitToRemove));
  };

  const handleAddIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const calNum = parseFloat(newIngCalories) || 150;
    const saved = await addIngredient(newIngName.trim(), newIngCategory, newIngUnit, newIngConversions, calNum);
    setIngredients(prev => [...prev, saved]);
    setNewIngName('');
    setNewIngCalories('150');
    setNewIngConversions([]);
    setIngSuccessMessage(`ماده اولیه "${saved.name}" با موفقیت ثبت شد.`);
    setTimeout(() => setIngSuccessMessage(''), 3000);
  };

  const handleQuickUpdateCalories = async (id: string, newCaloriesVal: string) => {
    const num = parseFloat(newCaloriesVal);
    if (isNaN(num) || num < 0) return;
    const updated = await updateIngredient(id, { caloriesPer100g: num });
    setIngredients(updated);
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (window.confirm(`آیا ماده اولیه "${name}" از بانک اطلاعات حذف شود؟`)) {
      const updated = await deleteIngredient(id);
      setIngredients(updated);
      showToast(`ماده اولیه "${name}" حذف شد.`);
    }
  };

  // User Management Handlers
  const handleToggleAdminStatus = (targetUser: StoredUser) => {
    if (targetUser.id === currentUser?.id) {
      if (!window.confirm('آیا مطمئن هستید که می‌خواهید دسترسی ادمین خود را لغو کنید؟')) {
        return;
      }
    }
    const newAdminVal = !targetUser.isAdmin;
    updateUserInList(targetUser.id, { isAdmin: newAdminVal });
    showToast(
      newAdminVal
        ? `دسترسی ادمین به "${targetUser.name}" اعطا شد.`
        : `دسترسی ادمین از "${targetUser.name}" سلب شد.`
    );
  };

  const handleSaveNewPassword = (userId: string, userName: string) => {
    if (!newPasswordVal || newPasswordVal.trim().length < 6) {
      alert('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    updateUserInList(userId, { password: newPasswordVal.trim() });
    setEditingPasswordUserId(null);
    setNewPasswordVal('');
    showToast(`رمز عبور کاربر "${userName}" با موفقیت بروزرسانی شد.`);
  };

  const handleDeleteUser = (targetUser: StoredUser) => {
    if (targetUser.id === currentUser?.id) {
      alert('شما نمی‌توانید حساب کاربری جاری خودتان را حذف کنید.');
      return;
    }
    if (window.confirm(`آیا از حذف کامل کاربر "${targetUser.name}" اطمینان دارید؟`)) {
      deleteUserFromList(targetUser.id);
      showToast(`کاربر "${targetUser.name}" از سامانه حذف گردید.`);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim() || !newUserPassword.trim()) {
      alert('لطفاً تمامی فیلدهای الزامی (نام، شماره همراه، رمز عبور) را پر کنید.');
      return;
    }

    if (!isValidIranianMobile(newUserPhone)) {
      alert('شماره همراه وارد شده معتبر نیست. فرمت صحیح: ۱۱ رقم (مانند ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    if (newUserPassword.trim().length < 6) {
      alert('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    const created = await addUserToList({
      name: newUserName.trim(),
      email: newUserEmail.trim() || undefined,
      phone: formatIranianMobile(newUserPhone),
      password: newUserPassword.trim(),
      isAdmin: newUserIsAdmin
    });

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserPassword('');
    setNewUserIsAdmin(false);

    showToast(`کاربر جدید "${created.name}" با موفقیت اضافه شد.`);
  };

  const handleResetDefaultData = () => {
    if (window.confirm('آیا می‌خواهید داده‌های سفره به حالت اولیه کارخانه بازگردانده شوند؟')) {
      localStorage.removeItem('sofreh_recipes_v2');
      localStorage.removeItem('sofreh_ingredients_v2');
      localStorage.removeItem('sofreh_fridge_v2');
      localStorage.removeItem('sofreh_meal_plan_v2');
      localStorage.removeItem('sofreh_shopping_v2');
      localStorage.removeItem('sofreh_users_list_v3');
      localStorage.removeItem('sofreh_users_list_v4');
      localStorage.removeItem('sofreh_auth_user_v4');
      window.location.reload();
    }
  };

  // Filters & Counts
  const pendingRecipes = recipes.filter(r => r.status === 'pending');
  const publishedRecipesCount = recipes.filter(r => (r.status || 'published') === 'published').length;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      (r.submittedBy && r.submittedBy.toLowerCase().includes(recipeSearch.toLowerCase())) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(recipeSearch.toLowerCase()));
    
    const matchesCat = isCategoryMatch(r, selectedCategory);

    const rStatus = r.status || 'published';
    let matchesStatus = true;
    if (recipeStatusFilter !== 'all') {
      matchesStatus = rStatus === recipeStatusFilter;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const adminCount = users.filter(u => u.isAdmin).length;
  const standardCount = users.length - adminCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Banner Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>پنل مدیریت ارشد سامانه «سفره»</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">مدیریت کاربران، تایید دستورات پخت و مواد اولیه</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            از این بخش می‌توانید کاربران را راهبری کنید، دستورات پخت ارسالی کاربران را بررسی، تایید یا ویرایش نمایید و لیست مواد اولیه را مدیریت کنید.
          </p>
        </div>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">تعداد کل کاربران</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{users.length} نفر</div>
          <p className="text-[11px] text-stone-400">{adminCount} مدیر / {standardCount} کاربر عادی</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">دستورات پخت</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{recipes.length} غذا</div>
          <p className="text-[11px] text-stone-400">{publishedRecipesCount} منتشر شده</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">در انتظار تایید</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              pendingRecipes.length > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-100 text-stone-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${pendingRecipes.length > 0 ? 'text-amber-600' : 'text-stone-900'}`}>
            {pendingRecipes.length} دستور
          </div>
          <p className="text-[11px] text-stone-400">نیازمند بررسی و انتشار</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">بانک مواد اولیه</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{ingredients.length} قلم</div>
          <p className="text-[11px] text-stone-400">ماده اولیه ثبت‌شده</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-[140px] cursor-pointer ${
            activeTab === 'users'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مدیریت کاربران ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-[140px] relative cursor-pointer ${
            activeTab === 'recipes'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مدیریت دستورات پخت ({recipes.length})</span>
          {pendingRecipes.length > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black mr-1 animate-pulse">
              {pendingRecipes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-[140px] cursor-pointer ${
            activeTab === 'ingredients'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>مدیریت مواد اولیه ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-[140px] cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>تنظیمات و راهنما</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            loadAnalytics();
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-[160px] cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>تحلیل رفتار و تبلیغات</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                لیست و مدیریت دسترسی کاربران سامانه
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                مشاهده اطلاعات، تغییر رمز عبور، اعطا یا لغو دسترسی مدیر (Admin) و حذف کاربران
              </p>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>ایجاد کاربر / مدیر جدید</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="جستجوی کاربر بر اساس نام، ایمیل یا شماره همراه..."
              className="w-full px-4 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <th className="p-3.5 rounded-r-xl">نام و اطلاعات کاربر</th>
                  <th className="p-3.5">سطح دسترسی (Role)</th>
                  <th className="p-3.5">رمز عبور فعلی</th>
                  <th className="p-3.5">تاریخ ثبت‌نام</th>
                  <th className="p-3.5 rounded-l-xl text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                          u.isAdmin ? 'bg-amber-500 shadow-sm' : 'bg-stone-400'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === currentUser?.id && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">شما</span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono mt-0.5 dir-ltr text-right">
                            {u.phone || u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleAdminStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          u.isAdmin
                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                        title="جهت تغییر نقش کلیک کنید"
                      >
                        {u.isAdmin ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            <span>مدیر کل (Admin)</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                            <span>کاربر عادی</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3.5">
                      {editingPasswordUserId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newPasswordVal}
                            onChange={e => setNewPasswordVal(e.target.value)}
                            placeholder="رمز جدید..."
                            className="w-28 px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => handleSaveNewPassword(u.id, u.name)}
                            className="p-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                            title="ذخیره"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPasswordUserId(null)}
                            className="p-1 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                            title="انصراف"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded-lg text-xs">
                            {u.password || '••••••'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPasswordUserId(u.id);
                              setNewPasswordVal(u.password || '');
                            }}
                            className="p-1 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                            title="ویرایش رمز عبور"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                      {u.createdAt || '۱۴۰۳/۰۵/۰۱'}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.id === currentUser?.id
                              ? 'text-stone-300 cursor-not-allowed'
                              : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="حذف کاربر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPES MANAGEMENT */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          {/* Pending Approval Highlight Section */}
          {pendingRecipes.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base">
                  <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>دستورات پخت در انتظار بررسی و تایید مدیر ({pendingRecipes.length} مورد)</span>
                </div>
                <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  نیازمند اقدام
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRecipes.map(pr => (
                  <div key={pr.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <img loading="lazy" decoding="async" fetchpriority="low" src={pr.image} alt={pr.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-stone-900 text-sm truncate">{pr.title}</h4>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                            {pr.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">{pr.description}</p>
                        <div className="text-[11px] text-stone-400 mt-2 flex items-center gap-3">
                          <span>ارسال‌کننده: <strong className="text-stone-700">{pr.submittedBy || 'کاربر عمومی'}</strong></span>
                          {pr.submittedAt && <span>تاریخ: {pr.submittedAt}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                      <Link
                        to={`/recipes/${pr.id}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>پیش‌نمایش</span>
                      </Link>

                      <button
                        onClick={() => setEditingRecipe(pr)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-200 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>

                      <button
                        onClick={() => handleRejectRecipe(pr)}
                        className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>رد</span>
                      </button>

                      <button
                        onClick={() => handleApproveRecipe(pr)}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تایید و انتشار</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Recipe Table & Filter Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-800">بانک جامع دستورات پخت سفره</h2>
                <p className="text-xs text-stone-500">امکان ویرایش کامل، تغییر وضعیت انتشار، اضافه یا حذف دستورات غذایی</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsBatchImportOpen(true)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>ورود دسته‌جمعی (فایل تکست / JSON)</span>
                </button>

                <button
                  onClick={() => setIsAddRecipeOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن دستی تک‌تک</span>
                </button>
              </div>
            </div>

            {/* Filter Pills for Status */}
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 overflow-x-auto">
              <span className="text-xs font-bold text-stone-500 ml-2">وضعیت:</span>
              <button
                onClick={() => setRecipeStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  recipeStatusFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                همه ({recipes.length})
              </button>

              <button
                onClick={() => setRecipeStatusFilter('published')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  recipeStatusFilter === 'published'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                منتشر شده ({recipes.filter(r => (r.status || 'published') === 'published').length})
              </button>

              <button
                onClick={() => setRecipeStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  recipeStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                در انتظار تایید ({pendingRecipes.length})
              </button>

              <button
                onClick={() => setRecipeStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  recipeStatusFilter === 'rejected'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                رد شده ({recipes.filter(r => r.status === 'rejected').length})
              </button>
            </div>

            {/* Search & Category Filter bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام غذا، ارسال‌کننده یا مواد اولیه..."
                  className="w-full px-4 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Recipes Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                    <th className="p-3 rounded-r-xl">تصویر و نام غذا</th>
                    <th className="p-3">ارسال‌کننده</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">وضعیت انتشار</th>
                    <th className="p-3">زمان پخت</th>
                    <th className="p-3 rounded-l-xl text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRecipes.map(r => {
                    const rStatus = r.status || 'published';
                    return (
                      <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3 flex items-center gap-3 font-bold text-stone-800">
                          <img loading="lazy" decoding="async" fetchpriority="low" src={r.image} alt={r.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200" />
                          <div>
                            <span className="block text-sm font-extrabold">{r.title}</span>
                            <span className="text-[10px] text-stone-400 font-normal line-clamp-1">{r.description}</span>
                          </div>
                        </td>

                        <td className="p-3 font-medium text-stone-600">
                          {r.submittedBy || 'مدیر سیستم'}
                        </td>

                        <td className="p-3 font-bold text-stone-600">
                          <div>
                            <span>{(r.categories && r.categories.length > 0) ? r.categories.join('، ') : r.category}</span>
                            {((r.diets && r.diets.length > 0) || r.diet) && (
                              <span className="block text-[10px] text-amber-700 font-normal mt-0.5">
                                رژیم: {((r.diets && r.diets.length > 0) ? r.diets : (r.diet ? [r.diet] : [])).join('، ')}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          {rStatus === 'published' && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[10px]">
                              منتشر شده
                            </span>
                          )}
                          {rStatus === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg text-[10px] animate-pulse">
                              در انتظار تایید
                            </span>
                          )}
                          {rStatus === 'rejected' && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 font-bold rounded-lg text-[10px]">
                              رد شده
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-stone-600">{(r.prepTime || 0) + (r.cookTime || 0)} دقیقه</td>

                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            {rStatus === 'pending' && (
                              <button
                                onClick={() => handleApproveRecipe(r)}
                                title="تایید و انتشار سریع"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setEditingRecipe(r)}
                              title="ویرایش کامل دستور پخت"
                              className="p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/recipes/${r.id}`}
                              title="مشاهده نمایش عمومی"
                              className="p-2 text-stone-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteRecipe(r.id, r.title)}
                              title="حذف دستور پخت"
                              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INGREDIENTS DICTIONARY */}
      {activeTab === 'ingredients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Ingredient Form */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-xs h-fit">
            <h2 className="text-base font-bold text-stone-800 pb-3 border-b border-stone-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              افزودن ماده اولیه جدید
            </h2>

            {ingSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{ingSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddIngredientSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-700 font-bold mb-1">نام ماده اولیه *</label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={e => setNewIngName(e.target.value)}
                  placeholder="مثال: لیمو عمانی، انار، زرشک"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">دسته‌بندی اصلی</label>
                <select
                  value={newIngCategory}
                  onChange={e => setNewIngCategory(e.target.value)}
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
                  value={newIngUnit}
                  onChange={e => setNewIngUnit(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">کالری در هر ۱۰۰ گرم (Kcal)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={newIngCalories}
                  onChange={e => setNewIngCalories(e.target.value)}
                  placeholder="مثال: ۱۵۰"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 font-bold text-stone-800"
                />
              </div>

              {/* CONVERSION RATIOS INPUT IN ADD INGREDIENT FORM */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/80 space-y-2 text-[11px]">
                <div className="font-extrabold text-amber-900 flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                  <span>تعیین وزن هر واحد (چند گرم؟ - اختیاری)</span>
                </div>
                
                {newIngConversions.length > 0 && (
                  <div className="space-y-1 bg-white p-2 rounded-xl border border-amber-100">
                    {newIngConversions.map(c => (
                      <div key={c.unit} className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                        <span>هر ۱ {c.unit} = {c.ratio} گرم</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewIngConversion(c.unit)}
                          className="text-stone-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5 items-center">
                  <select
                    value={newIngTargetUnit}
                    onChange={e => setNewIngTargetUnit(e.target.value)}
                    className="w-1/2 p-1.5 bg-white border border-stone-200 rounded-lg font-bold"
                  >
                    {COMMON_UNITS.filter(u => u !== 'گرم' && u !== 'کیلوگرم').map(u => (
                      <option key={u} value={u}>هر ۱ {u}</option>
                    ))}
                  </select>
                  <div className="w-1/3 flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      value={newIngTargetRatio}
                      onChange={e => setNewIngTargetRatio(e.target.value)}
                      placeholder="گرم"
                      className="w-full p-1.5 bg-white border border-stone-200 rounded-lg text-center font-bold"
                    />
                    <span className="text-[10px] text-stone-500 font-bold">گرم</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewIngConversion}
                    className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0"
                    title="افزودن وزن واحد"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت ماده اولیه در سیستم</span>
              </button>
            </form>
          </div>

          {/* Ingredients Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-800">بانک مواد اولیه سفره ({filteredIngredients.length})</h2>
                <p className="text-[11px] text-stone-500 mt-0.5">شامل واحد پیش‌فرض و نسبتهای دقیق تبدیل واحد</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDbModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل / خروجی اکسل</span>
                </button>

                <div className="relative w-48 sm:w-56">
                  <input
                    type="text"
                    value={ingredientSearch}
                    onChange={e => setIngredientSearch(e.target.value)}
                    placeholder="جستجو ماده اولیه..."
                    className="w-full px-3 py-1.5 pr-8 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-stone-600 font-bold z-10">
                  <tr>
                    <th className="p-3">نام ماده اولیه</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3">واحد پیش‌فرض</th>
                    <th className="p-3">کالری / ۱۰۰ گرم</th>
                    <th className="p-3">نسبت‌های تبدیل واحد</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredIngredients.map(ing => (
                    <tr key={ing.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3 font-bold text-stone-800">{ing.name}</td>
                      <td className="p-3 font-medium text-stone-600">{ing.category}</td>
                      <td className="p-3 text-stone-500 font-bold">{ing.defaultUnit}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            defaultValue={ing.caloriesPer100g ?? 150}
                            onBlur={e => handleQuickUpdateCalories(ing.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-center font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                          />
                          <span className="text-[10px] text-stone-400 font-medium">کالری</span>
                        </div>
                      </td>
                      <td className="p-3 text-stone-600">
                        {ing.conversions && ing.conversions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ing.conversions.map(c => (
                              <span key={c.unit} className="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md font-bold">
                                {c.unit} ({c.ratio})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">فرمول استاندارد پیش‌فرض</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingIngredient(ing)}
                            className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="ویرایش ماده اولیه"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف ماده اولیه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM SETTINGS & ADMIN ACCESS INFO */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 space-y-6 shadow-xs">
            <div className="space-y-2 pb-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                راهنمای امنیت و دسترسی‌های مدیر
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                تغییرات اعمال شده در این بخش شامل دسترسی کاربران، تایید دستورات پخت و لیست مواد اولیه مستقیماً در سیستم ثبت می‌گردد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200/80 space-y-3">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  فرآیند تایید دستورات پخت
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  دستورات پخت ارسالی توسط کاربران به صورت پیش‌فرض در وضعیت «در انتظار تایید» قرار می‌گیرند. مدیر سیستم می‌تواند آن‌ها را بررسی، در صورت لزوم ویرایش، و سپس منتشر نماید.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-3">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-stone-600" />
                  بازنشانی داده‌های اولیه
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  در صورت نیاز می‌توانید تمامی داده‌های سامانه را به تنظیمات کارخانه بازگردانید.
                </p>
                <button
                  onClick={handleResetDefaultData}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  بازنشانی کارخانه‌ای سامانه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USER BEHAVIOR ANALYTICS & ADVERTISING PLANNING */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full mb-1">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>تحلیل داده‌ها و بازاریابی هدفمند</span>
                </div>
                <h2 className="text-xl font-black text-stone-900">تحلیل رفتار خرید و برنامه‌ریزی تبلیغاتی کاربران</h2>
                <p className="text-xs text-stone-500 mt-1">
                  بررسی الگوی خرید مواد اولیه، غذاهای محبوب هفته و آماده‌سازی گزارش‌های تحلیل بازار جهت جذب تبلیغات
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>خروجی اکسل (CSV) گزارش‌ها</span>
              </button>
            </div>

            {/* Overview Metric Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  کل تعاملات لیست خرید
                </span>
                <p className="text-2xl font-black text-stone-900">
                  {analyticsData?.summary?.totalShoppingLogs || 0} مورد
                </p>
                <p className="text-[10px] text-stone-500">شامل افزودن به لیست، خریدها و پاکسازی‌ها</p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  کل انتخابی‌های برنامه‌ریزی غذا
                </span>
                <p className="text-2xl font-black text-stone-900">
                  {analyticsData?.summary?.totalMealLogs || 0} مورد
                </p>
                <p className="text-[10px] text-stone-500">غذاهای انتخاب‌شده برای برنامه هفتگی</p>
              </div>

              <div className="bg-sky-50/60 border border-sky-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  کل کاربران ثبت‌شده در سیستم
                </span>
                <p className="text-2xl font-black text-stone-900">
                  {users.length} کاربر
                </p>
                <p className="text-[10px] text-stone-500">خانواده‌های فعال در برنامه سفره</p>
              </div>
            </div>
          </div>

          {/* Top Demand Cards: Most Purchased Items & Top Recipes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Purchased Items */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  پرتقاضاترین اقلام لیست خرید (مناسب تبلیغات)
                </h3>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold">Top Demand</span>
              </div>

              {!analyticsData?.topPurchasedItems || analyticsData.topPurchasedItems.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">داده‌ای برای خریدهای اخیر ثبت نشده است.</p>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topPurchasedItems.slice(0, 7).map((item: any, idx: number) => {
                    const maxCount = analyticsData.topPurchasedItems[0]?.count || 1;
                    const percent = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-stone-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-black">
                              {idx + 1}
                            </span>
                            {item.name}
                          </span>
                          <span className="text-stone-500 text-[11px]">{item.count} بار خرید</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Selected Recipes */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  محبوب‌ترین غذاها در برنامه هفتگی
                </h3>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold">Top Recipes</span>
              </div>

              {!analyticsData?.topSelectedRecipes || analyticsData.topSelectedRecipes.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">داده‌ای برای غذاهای انتخابی ثبت نشده است.</p>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topSelectedRecipes.slice(0, 7).map((item: any, idx: number) => {
                    const maxCount = analyticsData.topSelectedRecipes[0]?.count || 1;
                    const percent = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-stone-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                              {idx + 1}
                            </span>
                            {item.title}
                          </span>
                          <span className="text-stone-500 text-[11px]">{item.count} بار انتخاب</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Full Detailed Activity Logs Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                جدول سابقه ریز فعالیت‌های کاربران روی هاست
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در کالا، غذا یا کاربر..."
                    value={analyticsSearch}
                    onChange={e => setAnalyticsSearch(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={analyticsFilterType}
                  onChange={e => setAnalyticsFilterType(e.target.value as any)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">همه رویدادها</option>
                  <option value="shopping">فقط لیست خرید</option>
                  <option value="meal">فقط برنامه هفتگی</option>
                </select>
              </div>
            </div>

            {loadingAnalytics ? (
              <p className="text-xs text-stone-500 py-10 text-center">در حال دریافت داده‌های تحلیلی...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">نوع رویداد</th>
                      <th className="p-3">نام کاربر</th>
                      <th className="p-3">عنوان کالا / غذا</th>
                      <th className="p-3">جزئیات / دسته‌بندی</th>
                      <th className="p-3">نوع اقدام</th>
                      <th className="p-3">تاریخ و زمان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(() => {
                      let combinedLogs: any[] = [];
                      if (analyticsFilterType === 'all' || analyticsFilterType === 'shopping') {
                        (analyticsData?.shoppingHistory || []).forEach((item: any) => {
                          combinedLogs.push({ ...item, type: 'shopping' });
                        });
                      }
                      if (analyticsFilterType === 'all' || analyticsFilterType === 'meal') {
                        (analyticsData?.mealHistory || []).forEach((item: any) => {
                          combinedLogs.push({ ...item, type: 'meal' });
                        });
                      }

                      combinedLogs.sort((a, b) => b.timestamp - a.timestamp);

                      if (analyticsSearch.trim()) {
                        const q = analyticsSearch.toLowerCase();
                        combinedLogs = combinedLogs.filter(log =>
                          (log.userName && log.userName.toLowerCase().includes(q)) ||
                          (log.itemName && log.itemName.toLowerCase().includes(q)) ||
                          (log.recipeTitle && log.recipeTitle.toLowerCase().includes(q)) ||
                          (log.category && log.category.toLowerCase().includes(q))
                        );
                      }

                      if (combinedLogs.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-stone-400">
                              هیچ موردی مطابق جستجوی شما یافت نشد.
                            </td>
                          </tr>
                        );
                      }

                      return combinedLogs.slice(0, 100).map((log: any) => (
                        <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-3 font-bold">
                            {log.type === 'shopping' ? (
                              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                لیست خرید
                              </span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                برنامه هفتگی
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-extrabold text-stone-900">
                            {log.userName || log.userId || 'کاربر سفره'}
                          </td>
                          <td className="p-3 font-bold text-stone-800">
                            {log.itemName || log.recipeTitle || '-'}
                          </td>
                          <td className="p-3 text-stone-500">
                            {log.type === 'shopping'
                              ? log.category || 'سایر'
                              : `${log.dayName || ''} - ${log.mealType || ''}`}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              log.action === 'purchased' || log.action === 'selected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'cleared' || log.action === 'removed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action === 'purchased' ? 'خریداری شد' :
                               log.action === 'selected' ? 'انتخاب شد' :
                               log.action === 'cleared' ? 'پاکسازی کامل' :
                               log.action === 'removed' ? 'حذف شد' : 'افزوده شد'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-400 dir-ltr text-right text-[11px]">
                            {log.dateStr || new Date(log.timestamp).toLocaleDateString('fa-IR')}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 pb-24 overflow-hidden sm:overflow-y-auto">
          <div className="bg-white rounded-t-[32px] rounded-b-none sm:rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-5 sm:p-6 relative max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                ایجاد حساب کاربری / مدیر جدید
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-medium mt-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="مثال: رضا محمدی"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ایمیل یا شناسه کاربری (اختیاری)</label>
                <input
                  type="text"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="user@sofreh.ir"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">شماره همراه *</label>
                <input
                  type="text"
                  required
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">رمز عبور اولیه *</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAdminCheck"
                  checked={newUserIsAdmin}
                  onChange={e => setNewUserIsAdmin(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                />
                <label htmlFor="isAdminCheck" className="text-stone-800 font-bold cursor-pointer">
                  اعطای دسترسی مدیر کل (Admin)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
                >
                  ثبت و ایجاد کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => setIsAddRecipeOpen(false)}
        onSuccess={newR => {
          setRecipes(prev => [newR, ...prev]);
          showToast(`دستور پخت "${newR.title}" ثبت گردید.`);
        }}
      />

      {/* Batch Import Recipe Modal */}
      <BatchImportRecipeModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImport={handleBatchImportRecipes}
      />

      {/* Edit Recipe Modal */}
      <EditRecipeModal
        recipe={editingRecipe}
        isOpen={!!editingRecipe}
        onClose={() => setEditingRecipe(null)}
        onSuccess={updatedList => {
          setRecipes(updatedList);
          showToast('تغییرات دستور پخت با موفقیت بروزرسانی شد.');
        }}
      />

      {/* Edit Ingredient Modal */}
      <EditIngredientModal
        ingredient={editingIngredient}
        isOpen={!!editingIngredient}
        onClose={() => setEditingIngredient(null)}
        onSuccess={updatedList => {
          setIngredients(updatedList);
          showToast('تغییرات ماده اولیه بروزرسانی شد.');
        }}
      />

      {/* Ingredients Full Database & Unit Conversions Modal */}
      <IngredientsDatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
};
