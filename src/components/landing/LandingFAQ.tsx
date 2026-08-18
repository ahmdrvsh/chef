import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'آیا استفاده از برنامه سفره رایگان است؟',
      a: 'بله، ثبت‌نام اولیه و استفاده از امکانات اصلی سامانه سفره شامل مدیریت یخچال، موتور پیشنهاد غذا «چی بپزم؟»، دستورات پخت و لیست خرید کاملاً رایگان است.',
    },
    {
      q: 'سفره چطور غذاهای پیشنهادی را انتخاب می‌کند؟',
      a: 'سفره با بررسی مواد اولیه موجود در یخچال دیجیتال شما، دستورهای پخت قابل تهیه را محاسبه کرده و بر اساس درصد تطابق مواد و زمان پخت بهترین گزینه‌ها را پیشنهاد می‌دهد.',
    },
    {
      q: 'آیا امکان برنامه‌ریزی هفتگی غذا وجود دارد؟',
      a: 'بله! شما می‌توانید وعده‌های ناهار و شام ۷ روز هفته خود را برنامه‌ریزی کرده و متناسب با آن لیست خرید کمبودها را دریافت کنید.',
    },
    {
      q: 'آیا سفره روی گوشی‌های هوشمند کار می‌کند؟',
      a: 'بله، سفره به صورت وب‌اپلیکیشن کاملاً واکنش‌گرا (PWA) طراحی شده و روی تمامی دستگاه‌های آیفون، اندروید، تبلت و رایانه بدون نیاز به نصب نرم‌افزار پیچیده کار می‌کند.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-white border-y border-stone-200/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            پاسخ به پرسش‌ها
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            سؤالات متداول
          </h2>
          <p className="text-stone-600 text-xs sm:text-base font-medium">
            پاسخ به متداول‌ترین سؤالات درباره نحوه کارکرد سامانه سفره
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F5] rounded-2xl border border-stone-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-right font-black text-xs sm:text-sm text-stone-900 flex items-center justify-between gap-4 cursor-pointer min-h-[48px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-stone-600 font-medium leading-relaxed border-t border-stone-200/40">
                    <p className="pt-3">{faq.a}</p>
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

