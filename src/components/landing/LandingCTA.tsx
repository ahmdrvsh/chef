import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const LandingCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden border border-emerald-700">
          
          {/* Subtle Decorative Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پیوستن به سفره</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              امروز آشپزی را ساده‌تر کن
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
              با سفره، همیشه می‌دانی چه چیزی بپزی. همین حالا ثبت‌نام کن و تصمیم‌گیری درباره غذا را لذت‌بخش کن.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-sm rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>شروع رایگان</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-950/60 hover:bg-emerald-950/90 text-white font-bold text-sm rounded-2xl border border-emerald-600/60 transition-all active:scale-95 flex items-center justify-center cursor-pointer min-h-[48px]"
              >
                ورود به سفره
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

