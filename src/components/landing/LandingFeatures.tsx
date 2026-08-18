import React from 'react';
import { ChefHat, Refrigerator, BookOpen, Calendar, ShoppingBag } from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: ChefHat,
      title: 'چی بپزم؟',
      description: 'پیشنهاد هوشمند غذا متناسب با مواد موجود در یخچال',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    {
      icon: Refrigerator,
      title: 'یخچال هوشمند',
      description: 'ثبت و مدیریت کامل موجودی اقلام و مقدار مصرف',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
    {
      icon: BookOpen,
      title: 'دستورهای پخت',
      description: 'دسترسی سریع به دستورپخت‌های گام‌به‌گام و آزموده شده',
      accent: 'text-amber-700 bg-amber-50 border-amber-200/80',
    },
    {
      icon: Calendar,
      title: 'برنامه غذایی',
      description: 'تنظیم دقیق وعده‌های ناهار و شام برای طول هفته',
      accent: 'text-stone-800 bg-stone-100 border-stone-200/80',
    },
    {
      icon: ShoppingBag,
      title: 'لیست خرید',
      description: 'تبدیل خودکار کمبودهای یخچال به لیست خرید منظم',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 inline-block">
            امکانات اصلی سفره
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            همه چیز برای یک آشپزی ساده‌تر و منظم‌تر
          </h2>
          <p className="text-stone-600 text-xs sm:text-base font-medium leading-relaxed">
            سفره تمام ابزارهای مورد نیاز برای مدیریت غذای روزمره را در یک تجربه کاربرپسند گرد هم آورده است.
          </p>
        </div>

        {/* 5 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F5] p-5 sm:p-6 rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all hover:shadow-sm group flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className={`w-11 h-11 rounded-xl ${item.accent} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

