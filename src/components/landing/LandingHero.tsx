import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Refrigerator, 
  ChefHat, 
  Calendar, 
  ShoppingBag,
  Clock,
  Flame,
  Utensils
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28 bg-[#FAF9F5]">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Right Column: Content & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>دستیار هوشمند آشپزی و برنامه‌ریزی غذا ✨</span>
            </div>

            {/* Main Persian Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.25]">
              سفره؛ آشپزی هوشمند، <br className="hidden sm:inline" />
              <span className="text-emerald-700 relative inline-block">
                متناسب با زندگی تو
                <svg className="absolute -bottom-2 right-0 w-full h-2.5 text-emerald-200/70 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="6" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              از آنچه در یخچالت داری تا غذایی که امروز باید بپزی؛ سفره کمک می‌کند با پیشنهادهای هوشمند بهتر انتخاب کنی، دقیق‌تر برنامه‌ریزی کنی و کمتر هدر بدهی.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-3.5 sm:py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>شروع رایگان</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-7 py-3.5 sm:py-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm rounded-2xl border border-stone-300 shadow-2xs transition-all hover:border-stone-400 active:scale-95 flex items-center justify-center cursor-pointer min-h-[48px]"
              >
                ورود به برنامه
              </button>
            </div>

            {/* Grounded Trust Indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-stone-500 border-t border-stone-200/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>بدون نیاز به کارت اعتباری</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>دسترسی روی همه دستگاه‌ها</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>برنامه‌ریزی سریع و آسان</span>
              </div>
            </div>

          </div>

          {/* Left Column: Realistic Product Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative mt-2 lg:mt-0">
            
            {/* Soft Ambient Shadow */}
            <div className="absolute inset-0 bg-emerald-200/30 rounded-3xl blur-2xl transform rotate-2 scale-95 pointer-events-none" />

            {/* Phone Container Frame */}
            <div className="relative w-full max-w-[320px] sm:max-w-[350px] bg-stone-900 p-3 sm:p-3.5 rounded-[42px] shadow-2xl border-4 border-stone-800">
              
              {/* Phone Notch / Speaker */}
              <div className="w-24 h-3.5 bg-stone-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-1 bg-stone-700 rounded-full" />
              </div>

              {/* Phone Screen Canvas */}
              <div className="bg-[#FAF9F5] rounded-[32px] p-3.5 sm:p-4 text-stone-900 space-y-3 border border-stone-200 overflow-hidden font-vazir">
                
                {/* Header Greeting */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block">امروز چه بپزیم؟</span>
                    <h2 className="text-xs font-black text-stone-800">سلام، خوش آمدید 👋</h2>
                  </div>
                  <div className="w-7 h-7 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    س
                  </div>
                </div>

                {/* Fridge Ingredients Summary */}
                <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <div className="flex items-center gap-1.5">
                      <Refrigerator className="w-3.5 h-3.5 text-emerald-700" />
                      <span>مواد موجود در یخچال</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black">
                      ۸ ماده آماده
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-bold">مرغ (۱ کیلو)</span>
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-bold">برنج (۴ پیمانه)</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold">زرشک</span>
                  </div>
                </div>

                {/* Smart Suggestion Showcase Card */}
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 p-3.5 rounded-2xl text-white shadow-md space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-200">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      پیشنهاد هوشمند
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-black">تطابق کامل</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-white/20 flex items-center justify-center shrink-0">
                      <ChefHat className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-white">زرشک‌پلو با مرغ مجلسی</h3>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-100 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-amber-300" /> ۴۵ دقیقه
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-amber-300" /> آسان
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Pills */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <div className="bg-white p-2 rounded-xl border border-stone-200 text-center text-[10px] font-bold text-stone-700 flex flex-col items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-emerald-700" />
                    <span>چی بپزم؟</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200 text-center text-[10px] font-bold text-stone-700 flex flex-col items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>برنامه هفته</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200 text-center text-[10px] font-bold text-stone-700 flex flex-col items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    <span>لیست خرید</span>
                  </div>
                </div>

              </div>

              {/* Floating Badge overlay */}
              <div className="absolute -bottom-3 -right-3 bg-white px-3 py-2 rounded-2xl shadow-lg border border-stone-200 flex items-center gap-2 text-stone-800 text-xs font-bold z-20">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center shrink-0 font-black">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] leading-tight">
                  <span className="block font-black text-stone-900">امشب چی بپزم؟</span>
                  <span className="text-stone-400 font-medium">پیشنهاد آماده پخت</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

