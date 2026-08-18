import React, { useState } from 'react';
import { ChefHat, Refrigerator, Calendar, ShoppingBag, Check, Plus, Trash2, ArrowLeft } from 'lucide-react';

export const LandingShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatToCook' | 'fridge' | 'weekly' | 'shopping'>('whatToCook');

  const tabs = [
    { id: 'whatToCook', label: 'چی بپزم؟', icon: ChefHat },
    { id: 'fridge', label: 'یخچال هوشمند', icon: Refrigerator },
    { id: 'weekly', label: 'برنامه هفتگی', icon: Calendar },
    { id: 'shopping', label: 'لیست خرید', icon: ShoppingBag },
  ] as const;

  return (
    <section id="showcase" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            نمای محیط برنامه
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            برنامه‌ای کاربردی با طراحی اصیل و مدرن
          </h2>
          <p className="text-stone-600 text-xs sm:text-base font-medium">
            با بخش‌های اصلی اپلیکیشن سفره بیشتر آشنا شوید
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive App Screen Phone Frame */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-stone-900 p-3.5 sm:p-5 rounded-[36px] sm:rounded-[44px] shadow-2xl border-4 border-stone-800">
            
            {/* Screen Mockup Content */}
            <div className="bg-[#FAF9F5] rounded-[28px] sm:rounded-[34px] p-4 sm:p-6 text-stone-900 min-h-[360px] sm:min-h-[400px] flex flex-col justify-between font-vazir border border-stone-200">
              
              {/* TOP: Tab Content Preview */}
              <div className="space-y-4">
                
                {/* 1. What to Cook Screen */}
                {activeTab === 'whatToCook' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-stone-900">پیشنهاد هوشمند «چی بپزم؟»</h3>
                        <p className="text-[11px] text-stone-500 font-medium">بر اساس موجودی فعلی یخچال شما</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200/60">
                        ۳ پیشنهاد کامل
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-stone-800">زرشک‌پلو با مرغ مجلسی</h4>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">مواد موجود: مرغ، برنج، زرشک</span>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-700 text-white px-2.5 py-1 rounded-lg">آماده پخت</span>
                      </div>

                      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-stone-800">کوکو سبزی خانگی</h4>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">مواد موجود: سبزی، تخم‌مرغ</span>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-700 text-white px-2.5 py-1 rounded-lg">آماده پخت</span>
                      </div>

                      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-stone-800">عدس‌پلو با کشمش</h4>
                          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">نیازمند خرید ۱ ماده</span>
                        </div>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">۸۵٪ آماده</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Smart Fridge Screen */}
                {activeTab === 'fridge' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-stone-900">موجودی یخچال دیجیتال</h3>
                        <p className="text-[11px] text-stone-500 font-medium">مدیریت موجودی و میزان مصرف اقلام</p>
                      </div>
                      <button className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Plus className="w-3 h-3" /> افزودن ماده
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-800 block">مرغ تازه</span>
                          <span className="text-[10px] text-stone-400 font-bold">۱ کیلوگرم</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-800 block">برنج ایرانی</span>
                          <span className="text-[10px] text-stone-400 font-bold">۵ پیمانه</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-800 block">تخم‌مرغ</span>
                          <span className="text-[10px] text-stone-400 font-bold">۶ عدد</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-800 block">رب گوجه</span>
                          <span className="text-[10px] text-stone-400 font-bold">۱ قوطی</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Weekly Plan Screen */}
                {activeTab === 'weekly' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-stone-900">برنامه‌ریزی غذاهای هفته</h3>
                        <p className="text-[11px] text-stone-500 font-medium">تنظیم وعده‌های ناهار و شام روزانه</p>
                      </div>
                      <span className="text-[10px] font-bold text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-md">
                        شنبه تا جمعه
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl flex items-center justify-center shrink-0">شنبه</span>
                          <div>
                            <span className="text-xs font-black text-stone-800 block">ناهار: چلوکباب تابه</span>
                            <span className="text-[10px] text-stone-400 font-medium">شام: سالاد الویه</span>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-stone-400" />
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-amber-100 text-amber-800 text-xs font-black rounded-xl flex items-center justify-center shrink-0">یکشنبه</span>
                          <div>
                            <span className="text-xs font-black text-stone-800 block">ناهار: زرشک‌پلو با مرغ</span>
                            <span className="text-[10px] text-stone-400 font-medium">شام: سوپ جو</span>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-stone-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Shopping List Screen */}
                {activeTab === 'shopping' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-stone-900">لیست خرید اقلام کسر شده</h3>
                        <p className="text-[11px] text-stone-500 font-medium">تنها موادی که در یخچال کم داری</p>
                      </div>
                      <button className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                        بروزرسانی خودکار
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-stone-300 flex items-center justify-center text-white" />
                          <span className="text-xs font-bold text-stone-800">کشمش پلویی (۲۰۰ گرم)</span>
                        </div>
                        <Trash2 className="w-3.5 h-3.5 text-stone-300" />
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-stone-300 flex items-center justify-center text-white" />
                          <span className="text-xs font-bold text-stone-800">سیب‌زمینی (۱ کیلو)</span>
                        </div>
                        <Trash2 className="w-3.5 h-3.5 text-stone-300" />
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-emerald-600 text-white rounded flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-bold text-stone-400 line-through">روغـن مایع (۱ عدد)</span>
                        </div>
                        <Trash2 className="w-3.5 h-3.5 text-stone-300" />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Nav Bar Simulation */}
              <div className="pt-3 border-t border-stone-200/80 grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-stone-400">
                <div className={`p-1.5 rounded-xl flex flex-col items-center gap-0.5 ${activeTab === 'whatToCook' ? 'text-emerald-800 bg-emerald-50' : ''}`}>
                  <ChefHat className="w-4 h-4" />
                  <span>چی بپزم؟</span>
                </div>
                <div className={`p-1.5 rounded-xl flex flex-col items-center gap-0.5 ${activeTab === 'fridge' ? 'text-emerald-800 bg-emerald-50' : ''}`}>
                  <Refrigerator className="w-4 h-4" />
                  <span>یخچال</span>
                </div>
                <div className={`p-1.5 rounded-xl flex flex-col items-center gap-0.5 ${activeTab === 'weekly' ? 'text-emerald-800 bg-emerald-50' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  <span>برنامه</span>
                </div>
                <div className={`p-1.5 rounded-xl flex flex-col items-center gap-0.5 ${activeTab === 'shopping' ? 'text-emerald-800 bg-emerald-50' : ''}`}>
                  <ShoppingBag className="w-4 h-4" />
                  <span>خرید</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

