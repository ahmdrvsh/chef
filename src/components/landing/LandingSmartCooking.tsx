import React from 'react';
import { Sparkles, Check, Clock, Utensils, Award, SlidersHorizontal } from 'lucide-react';

export const LandingSmartCooking: React.FC = () => {
  const availableIngredients = ['مرغ', 'برنج', 'پیاز', 'زعفران'];

  return (
    <section id="smart-cooking" className="py-16 sm:py-20 lg:py-24 bg-white border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-6 sm:p-10 md:p-12 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle Decorative Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Right: Copy & Intelligence Explanation */}
            <div className="lg:col-span-6 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 bg-emerald-700/60 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>هوشمندی کاربردی در آشپزی</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug">
                سفره فقط دستور غذا پیشنهاد نمی‌دهد؛ <br />
                <span className="text-amber-300">شرایط تو را می‌فهمد.</span>
              </h2>

              <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed font-medium">
                پیشنهادهای سفره هوشمندانه طراحی شده‌اند تا با تحلیل متغیرهای روزمره شما، دقیقا همان غذایی را پیشنهاد دهند که شرایط پخت آن را دارید:
              </p>

              {/* Grounded intelligence criteria */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs text-emerald-100 font-bold">
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>موجودی فعلی یخچال</span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>نوع وعده (ناهار یا شام)</span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>زمان و سرعت پخت</span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>ترجیحات غذایی خانواده</span>
                </div>
              </div>
            </div>

            {/* Left: Interactive/Visual Smart Matching Demo Card */}
            <div className="lg:col-span-6">
              <div className="bg-white/10 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-white/20 space-y-4">
                
                {/* Fridge Ingredients Input Simulation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span>اقلام انتخاب شده از یخچال:</span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-300">
                      <SlidersHorizontal className="w-3 h-3" /> شرایط فعال
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableIngredients.map((item, i) => (
                      <span
                        key={i}
                        className="bg-emerald-700/80 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex items-center gap-3 text-emerald-300/60 text-xs font-bold">
                  <div className="h-px bg-emerald-500/30 flex-1" />
                  <span className="bg-emerald-800/80 text-amber-300 px-3 py-1 rounded-full border border-emerald-600 text-[11px] font-black">
                    ✨ خروجی پیشنهاد سفره
                  </span>
                  <div className="h-px bg-emerald-500/30 flex-1" />
                </div>

                {/* Match Result Card */}
                <div className="bg-white text-stone-900 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-1 border border-emerald-200/80">
                        تطابق کامل با موجودی یخچال
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-stone-900">
                        زرشک‌پلو با مرغ مجلسی
                      </h3>
                    </div>
                    <div className="bg-emerald-700 text-white p-2 sm:p-2.5 rounded-xl text-center shrink-0">
                      <span className="block text-xs font-black">۱۰۰٪</span>
                      <span className="text-[9px] text-emerald-200 block -mt-0.5 font-bold">آماده پخت</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center text-xs font-bold text-stone-600">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block font-normal">زمان پخت</span>
                      <span>۴۵ دقیقه</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <Utensils className="w-3.5 h-3.5 text-amber-600 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block font-normal">مواد لازم</span>
                      <span>۴ از ۴ ماده</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <Award className="w-3.5 h-3.5 text-stone-700 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block font-normal">درجه پخت</span>
                      <span>آسان</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

