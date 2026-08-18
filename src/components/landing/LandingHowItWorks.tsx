import React from 'react';
import { Refrigerator, Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: '۱',
      title: 'مواد غذایی خودت را وارد کن',
      description: 'اقلام موجود در منزل را در چند ثانیه به یخچال سفره اضافه کن تا همیشه دقیقاً بدانی چه چیزهایی داری.',
      icon: Refrigerator,
    },
    {
      number: '۲',
      title: 'سفره شرایط تو را بررسی می‌کند',
      description: 'موتور هوشمند سفره مواد موجود، زمان پخت و ترجیحات تو را تحلیل کرده و بهترین غذاها را پیدا می‌کند.',
      icon: Sparkles,
    },
    {
      number: '۳',
      title: 'غذا، برنامه و لیست خرید دریافت کن',
      description: 'دستورپخت آماده پخت، برنامه غذایی هفته و لیست خرید اقلام کسر شده را یکجا تحویل بگیر.',
      icon: ShoppingBag,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            مسیر ۳ گامه
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            سفره چگونه کار می‌کند؟
          </h2>
          <p className="text-stone-600 text-xs sm:text-base font-medium">
            در سه مرحله بسیار سریع، تصمیم‌گیری درباره غذا و برنامه‌ریزی آشپزی را ساده کن.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 relative flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-emerald-700/25">
                      ۰{step.number}
                    </span>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200/60 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 z-10 text-stone-300">
                    <ArrowLeft className="w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

