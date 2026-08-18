import React, { useState, useEffect } from 'react';
import { User as UserIcon, ChefHat, Settings, LogOut, Check, Users, ShieldCheck, ArrowLeft, ShoppingBag, Calendar, History, Clock, Lock, Info, MapPin, Mail, Phone, Heart, Headphones, MessageSquare, Send, Trash2, Star, Instagram } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getFamilyMembersCount, setFamilyMembersCount } from '../utils/userSettings';
import { fetchUserShoppingHistory, fetchUserMealHistory, fetchRecipes, ShoppingHistoryLog, MealPlanHistoryLog } from '../db';
import { Recipe } from '../data/initialData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { openExternalLink } from '../lib/capacitor';

export const ProfilePage: React.FC = () => {
  const { user, updateUserInList, logout, refreshProfile } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [city, setCity] = useState(user?.city || '');
  const [familyMembers, setFamilyMembers] = useState(getFamilyMembersCount());
  const [saved, setSaved] = useState(false);

  const [activeProfileTab, setActiveProfileTab] = useState<'settings' | 'favorites' | 'shopping_history' | 'meal_history' | 'contact'>('settings');
  const [shoppingLogs, setShoppingLogs] = useState<ShoppingHistoryLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealPlanHistoryLog[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Contact form state
  const [contactSubject, setContactSubject] = useState('پیشنهاد و انتقاد');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    setFamilyMembers(getFamilyMembersCount());
    if (user?.id) {
      refreshProfile();
      loadUserHistories();
    }
    loadFavorites();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBirthDate(user.birthDate || '');
      setCity(user.city || '');
    }
  }, [user]);

  const loadFavorites = async () => {
    const favIds: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    if (favIds.length > 0) {
      const allRecipes = await fetchRecipes();
      const filtered = allRecipes.filter(r => favIds.includes(r.id));
      setFavoriteRecipes(filtered);
    } else {
      setFavoriteRecipes([]);
    }
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favIds: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    const updated = favIds.filter(f => f !== id);
    localStorage.setItem('sofreh_favs', JSON.stringify(updated));
    setFavoriteRecipes(prev => prev.filter(r => r.id !== id));
  };

  const loadUserHistories = async () => {
    setLoadingHistory(true);
    const [sLogs, mLogs] = await Promise.all([
      fetchUserShoppingHistory(user?.id),
      fetchUserMealHistory(user?.id)
    ]);
    setShoppingLogs(sLogs || []);
    setMealLogs(mLogs || []);
    setLoadingHistory(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactMessage('');
    }, 3500);
  };

  // Determine if phone or email was provided during registration
  const isPhoneLocked = Boolean(user?.registeredPhone || (user?.phone && user.phone.trim().length > 0));
  const isEmailLocked = Boolean(user?.registeredEmail && user.registeredEmail.trim().length > 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updates: any = {};
      if (!isEmailLocked) updates.email = email.trim();
      if (!isPhoneLocked) updates.phone = phone.trim();
      updates.birthDate = birthDate.trim();
      updates.city = city.trim();

      await updateUserInList(user.id, updates);
    }
    setFamilyMembersCount(familyMembers);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-700/20">
          <ChefHat className="w-10 h-10" />
        </div>
        <div className="space-y-1 text-center sm:text-right flex-1">
          <h1 className="text-2xl font-extrabold text-stone-900">{user?.name || 'کاربر سفره'}</h1>
          <p className="text-xs text-emerald-700 font-bold">
            {user?.isAdmin ? 'مدیر ارشد سامانه (Admin)' : 'عضو کاربر عادی'}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-500 pt-1">
            <span>{user?.phone || user?.email || 'حساب کاربری فعال'}</span>
            {user?.city && (
              <span className="flex items-center gap-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                <MapPin className="w-3 h-3 text-emerald-700" />
                {user.city}
              </span>
            )}
            {user?.birthDate && (
              <span className="flex items-center gap-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                <Calendar className="w-3 h-3 text-emerald-700" />
                متولد {user.birthDate}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب</span>
        </button>
      </div>

      {/* Admin Quick Access Box (Only visible for Admins) */}
      {user?.isAdmin ? (
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>مدیریت محتوا و تحلیل فعالیت‌ها</span>
            </div>
            <h3 className="text-base font-extrabold">ورود به پنل مدیریت سامانه</h3>
            <p className="text-xs text-stone-300">مدیریت دستورات پخت، کاربران و تحلیل رفتار خرید و برنامه‌های غذایی</p>
          </div>

          <Link
            to="/admin"
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>ورود به پنل ادمین</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200/80 text-stone-700 flex items-center gap-3 text-xs font-medium">
          <ShieldCheck className="w-5 h-5 text-stone-400 shrink-0" />
          <span>سطح دسترسی شما «کاربر عادی» است. دسترسی به پنل مدیریت ویژه مدیران سامانه می‌باشد.</span>
        </div>
      )}

      {/* Navigation Tabs in Profile */}
      <div className="flex border-b border-stone-200 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveProfileTab('settings')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'settings'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تنظیمات</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('favorites')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'favorites'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>علاقه‌مندی‌ها</span>
          {favoriteRecipes.length > 0 && (
            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              {favoriteRecipes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveProfileTab('shopping_history')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'shopping_history'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>سابقه خرید</span>
          {shoppingLogs.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {shoppingLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveProfileTab('meal_history')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'meal_history'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>سابقه برنامه هفتگی</span>
          {mealLogs.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {mealLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveProfileTab('contact')}
          className={`pb-3 px-3 sm:px-4 font-bold text-xs flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeProfileTab === 'contact'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Headphones className="w-4 h-4 text-emerald-700" />
          <span>تماس با ما</span>
        </button>
      </div>

      {/* TAB 1: Account Settings */}
      {activeProfileTab === 'settings' && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-700" />
              تنظیمات حساب کاربری
            </h3>
            <span className="text-[11px] text-stone-400 font-medium">اطلاعات کاربری و تکمیلی</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium">
            {/* 1. Full Name (Locked) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.name || 'کاربر سفره'}
                  disabled
                  readOnly
                  className="w-full px-4 py-2.5 bg-stone-100/90 border border-stone-200/80 rounded-xl text-stone-500 font-bold cursor-not-allowed select-none pl-9"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                <span>ثبت‌شده در ثبت‌نام اولیه (غیرقابل تغییر)</span>
              </p>
            </div>

            {/* 2. Mobile Phone (Locked if entered during registration, Editable if not) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                شماره همراه
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isPhoneLocked ? (user?.phone || '') : phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={isPhoneLocked}
                  readOnly={isPhoneLocked}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isPhoneLocked
                      ? 'bg-stone-100/90 border border-stone-200 text-stone-500 cursor-not-allowed select-none pl-9'
                      : 'bg-stone-50 border border-stone-200 text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600'
                  }`}
                />
                {isPhoneLocked && (
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <p className={`text-[11px] flex items-center gap-1 mt-1 ${isPhoneLocked ? 'text-stone-400' : 'text-emerald-700 font-bold'}`}>
                {isPhoneLocked ? (
                  <span>شماره همراه ثبت‌نامی (غیرقابل تغییر)</span>
                ) : (
                  <span>امکان ورود شماره همراه جهت تکمیل حساب کاربری</span>
                )}
              </p>
            </div>

            {/* 3. Email Address (Locked if entered during registration, Editable if not) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                ایمیل کاربری
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={isEmailLocked ? (user?.email || '') : email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isEmailLocked}
                  readOnly={isEmailLocked}
                  placeholder="example@domain.com"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isEmailLocked
                      ? 'bg-stone-100/90 border border-stone-200 text-stone-500 cursor-not-allowed select-none pl-9'
                      : 'bg-stone-50 border border-stone-200 text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600'
                  }`}
                />
                {isEmailLocked && (
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <p className={`text-[11px] flex items-center gap-1 mt-1 ${isEmailLocked ? 'text-stone-400' : 'text-emerald-700 font-bold'}`}>
                {isEmailLocked ? (
                  <span>ایمیل ثبت‌نامی (غیرقابل تغییر)</span>
                ) : (
                  <span>امکان افزودن یا ویرایش ایمیل برای تکمیل حساب</span>
                )}
              </p>
            </div>

            {/* 4. Date of Birth (Editable) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                تاریخ تولد
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                placeholder="مثال: ۱۳۷۲/۰۵/۲۰"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold"
              />
              <p className="text-[11px] text-stone-400 mt-1">تاریخ تولد به شمسی (اختیاری)</p>
            </div>

            {/* 5. City (Editable) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                شهر محل سکونت
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="مثال: تهران، مشهد، اصفهان، شیراز..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold"
              />
              <p className="text-[11px] text-stone-400 mt-1">نام شهر محل سکونت خود را وارد کنید</p>
            </div>

            {/* 6. Family Members Count (Editable) */}
            <div className="space-y-1">
              <label className="block text-stone-700 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                تعداد اعضای خانواده (پیش‌فرض سروینگ)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={familyMembers}
                onChange={e => setFamilyMembers(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold"
              />
              <p className="text-[11px] text-stone-400 mt-1">جهت محاسبه میزان مواد اولیه دستورات پخت</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {saved ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{saved ? 'تغییرات ذخیره شد' : 'ذخیره تغییرات حساب'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Shopping History Logs */}
      {activeProfileTab === 'shopping_history' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              سابقه خریدهای شما
            </h3>
            <span className="text-xs text-stone-400 font-medium">ذخیره‌شده روی هاست</span>
          </div>

          {loadingHistory ? (
            <p className="text-xs text-stone-500 text-center py-6">در حال دریافت سابقه خریدها...</p>
          ) : shoppingLogs.length === 0 ? (
            <div className="text-center py-8 text-stone-500 space-y-2">
              <History className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs font-bold">هنوز هیچ سابقه خریدی برای شما ثبت نشده است.</p>
              <p className="text-[11px] text-stone-400">اقلامی که به لیست خرید اضافه کرده یا تیک خریدم می‌زنید اینجا ثبت می‌شوند.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {shoppingLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-stone-50 border border-stone-200/70 rounded-2xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900">{log.itemName}</span>
                      {log.quantity && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                          {log.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">دسته‌بندی: {log.category || 'سایر'}</p>
                  </div>

                  <div className="text-left space-y-1 shrink-0">
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                      log.action === 'purchased' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'cleared' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.action === 'purchased' ? 'خریداری شد' : log.action === 'cleared' ? 'پاکسازی کامل' : 'افزوده شد'}
                    </span>
                    <p className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{log.dateStr || new Date(log.timestamp).toLocaleDateString('fa-IR')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Meal Choice History Logs */}
      {activeProfileTab === 'meal_history' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              سابقه غذاهای انتخابی در برنامه هفتگی
            </h3>
            <span className="text-xs text-stone-400 font-medium">ذخیره‌شده روی هاست</span>
          </div>

          {loadingHistory ? (
            <p className="text-xs text-stone-500 text-center py-6">در حال دریافت سابقه غذاها...</p>
          ) : mealLogs.length === 0 ? (
            <div className="text-center py-8 text-stone-500 space-y-2">
              <History className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs font-bold">هنوز هیچ سابقه انتخابی غذایی ثبت نشده است.</p>
              <p className="text-[11px] text-stone-400">غذاهایی که در برنامه هفتگی انتخاب می‌کنید در اینجا ثبت می‌گردند.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {mealLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-stone-50 border border-stone-200/70 rounded-2xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900">{log.recipeTitle}</span>
                      <span className="bg-stone-200 text-stone-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {log.dayName} - {log.mealType}
                      </span>
                    </div>
                    {log.category && (
                      <p className="text-[11px] text-stone-500">دسته‌بندی: {log.category}</p>
                    )}
                  </div>

                  <div className="text-left space-y-1 shrink-0">
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                      log.action === 'selected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.action === 'selected' ? 'انتخاب شد' : 'حذف شد'}
                    </span>
                    <p className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{log.dateStr || new Date(log.timestamp).toLocaleDateString('fa-IR')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Favorites */}
      {activeProfileTab === 'favorites' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              دستورهای غذایی مورد علاقه شما
            </h3>
            <span className="text-xs text-stone-400 font-medium">ذخیره‌شده روی حساب شما</span>
          </div>

          {favoriteRecipes.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-3">
              <Heart className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
              <p className="text-sm font-bold text-stone-700">هنوز هیچ دستور غذایی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
              <p className="text-xs text-stone-400">می‌توانید با کلیک روی قلب روی کارت هر غذا در صفحه دستورات پخت، آن را اینجا ذخیره کنید.</p>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-800 transition-colors mt-2"
              >
                <ChefHat className="w-4 h-4" />
                <span>مشاهده دستورات پخت</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {favoriteRecipes.map(recipe => (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="group bg-stone-50 rounded-2xl overflow-hidden border border-stone-200/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-28 sm:h-36 overflow-hidden bg-stone-100">
                      <ImageWithFallback loading="lazy" decoding="async" fetchpriority="low"
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Remove from favorites button */}
                      <button
                        onClick={e => removeFavorite(recipe.id, e)}
                        className="absolute top-2.5 right-2.5 p-1 bg-transparent border-0 outline-none text-white hover:text-rose-300 transition-all cursor-pointer active:scale-90 z-10 focus:outline-none"
                        title="حذف از علاقه‌مندی‌ها"
                      >
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500 stroke-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] hover:scale-110 transition-transform" />
                      </button>

                      <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{recipe.rating || 4.8}</span>
                      </div>

                      <span className="absolute bottom-2 right-2 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        {recipe.category}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 space-y-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {recipe.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {recipe.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] font-bold text-stone-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} د</span>
                    </div>
                    <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md">
                      {recipe.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Contact Us */}
      {activeProfileTab === 'contact' && (
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-emerald-700" />
              تماس با پشتیبانی و ارتباط با ما
            </h3>
            <span className="text-xs text-stone-400 font-medium">پاسخگویی سریع</span>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:02191015480"
              className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center gap-3 hover:bg-emerald-100/60 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-800 font-bold">تلفن پشتیبانی</p>
                <p className="text-xs font-black text-stone-900 dir-ltr text-right">۰۲۱-۹۱۰۱۵۴۸۰</p>
              </div>
            </a>

            <a
              href="mailto:support@sofreh.app"
              className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3 hover:bg-stone-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-stone-600 font-bold">ایمیل پشتیبانی</p>
                <p className="text-xs font-black text-stone-900">support@sofreh.app</p>
              </div>
            </a>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-800 font-bold">ساعات پاسخگویی</p>
                <p className="text-xs font-black text-stone-900">همه روزه ۹ الی ۲۱</p>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <form onSubmit={handleContactSubmit} className="space-y-4 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              ارسال پیام مستقیم به پشتیبانی
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-stone-700 font-bold">موضوع پیام</label>
                <select
                  value={contactSubject}
                  onChange={e => setContactSubject(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-bold min-h-[44px]"
                >
                  <option value="پیشنهاد و انتقاد">پیشنهاد و انتقاد</option>
                  <option value="گزارش مشکل و باگ">گزارش مشکل و باگ</option>
                  <option value="درخواست اضافه کردن دستور غذا">درخواست اضافه کردن دستور غذا</option>
                  <option value="سایر موارد">سایر موارد</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-stone-700 font-bold">فرستنده پیام</label>
                <input
                  type="text"
                  value={user?.name ? `${user.name} (${user.phone || user.email || ''})` : 'کاربر مهمان'}
                  disabled
                  className="w-full p-2.5 bg-stone-100 border border-stone-200/80 rounded-xl text-stone-500 font-bold min-h-[44px] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-stone-700 font-bold">متن پیام شما</label>
              <textarea
                rows={4}
                required
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                placeholder="پیام، نظر یا پیشنهاد خود را اینجا بنویسید..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium resize-none text-xs"
              />
            </div>

            {contactSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>پیام شما با موفقیت به پشتیبانی سفره ارسال شد. به زودی بررسی و پاسخ داده می‌شود.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-stone-400">پیام شما به صورت مستقیم برای تیم پشتیبانی ارسال می‌گردد.</p>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پیام</span>
                </button>
              </div>
            )}
          </form>

          {/* Social Links */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-stone-600">ما را در شبکه‌های اجتماعی دنبال کنید:</span>
            <div className="flex items-center gap-2">
              <a
                onClick={(e) => { e.preventDefault(); openExternalLink("https://instagram.com"); }}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>اینستاگرام</span>
              </a>
              <a
                onClick={(e) => { e.preventDefault(); openExternalLink("https://t.me"); }}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-100 hover:bg-blue-50 text-stone-700 hover:text-blue-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
              >
                <Send className="w-4 h-4 text-blue-500" />
                <span>تلگرام</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
