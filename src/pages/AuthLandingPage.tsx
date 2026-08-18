import React, { useState, useEffect } from 'react';
import { ChefHat, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidIranianMobile } from '../utils/authUtils';

interface AuthLandingPageProps {
  defaultTab?: 'login' | 'register';
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ defaultTab = 'login' }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim()) {
      setError('لطفاً شماره همراه، ایمیل یا نام کاربری را وارد کنید.');
      return;
    }
    if (!loginPassword) {
      setError('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (!res.success) {
        setError(res.message || 'خطا در ورود به حساب کاربری');
      }
    } catch {
      setError('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    if (!regPhone.trim()) {
      setError('لطفاً شماره همراه خود را وارد کنید.');
      return;
    }
    if (!isValidIranianMobile(regPhone)) {
      setError('شماره همراه وارد شده معتبر نیست. فرمت صحیح: ۱۱ رقم (مانند ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }
    if (!regPassword || regPassword.trim().length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(regName, regPhone, regPassword, regEmail);
      if (!res.success) {
        setError(res.message || 'خطا در ثبت‌نام کاربر جدید');
      }
    } catch {
      setError('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between selection:bg-emerald-700 selection:text-white">
      {/* Top Banner Header */}
      <header className="bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-stone-900 tracking-tight block">سفره</span>
              <span className="text-[10px] text-emerald-700 font-bold block -mt-1">دستیار هوشمند آشپزی خانگی</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold text-stone-500">
            <span>برای استفاده از تمامی امکانات سامانه، وارد حساب خود شوید</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Centered Box at Top */}
      <main className="max-w-md mx-auto px-4 sm:px-6 py-12 w-full flex-1 flex flex-col justify-start">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          
          {/* Logo / Header in Card */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
              <ChefHat className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-stone-900">سامانه سفره</h1>
            <p className="text-xs text-stone-500">لطفاً برای ورود یا ثبت‌نام اطلاعات خود را وارد کنید</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LogIn className={`w-4 h-4 ${activeTab === 'login' ? 'text-white' : 'text-emerald-700'}`} />
              <span>ورود به حساب</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${activeTab === 'register' ? 'text-white' : 'text-emerald-700'}`} />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">نام کاربری، شماره همراه یا ایمیل *</label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="شماره همراه یا ایمیل خود را وارد کنید"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">رمز عبور *</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogIn className="w-5 h-5" />
                <span>{isSubmitting ? 'در حال بررسی اطلاعات...' : 'ورود به سامانه'}</span>
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">شماره همراه * (۱۱ رقم)</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>ایمیل (اختیاری)</span>
                  <span className="text-[10px] text-stone-400 font-normal">جهت بازیابی حساب</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="example@sofreh.ir"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">رمز عبور جدید * (حداقل ۶ کاراکتر)</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-colors text-right"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <UserPlus className="w-5 h-5" />
                <span>{isSubmitting ? 'در حال ثبت‌نام و ذخیره‌سازی...' : 'ثبت‌نام و ایجاد حساب'}</span>
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <p className="font-bold text-stone-700">سفره - دستیار هوشمند آشپزی و برنامه‌ریزی تغذیه خانواده</p>
        <p className="text-[11px] text-stone-400 mt-1">© تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
};
