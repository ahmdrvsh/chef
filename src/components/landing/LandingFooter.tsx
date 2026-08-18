import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 py-12 sm:py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800 text-center md:text-right">
          
          {/* Logo & Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">سفره</span>
            </div>
            <p className="text-xs text-stone-400 font-medium">
              دستیار هوشمند آشپزی و برنامه‌ریزی غذا
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold text-stone-300">
            <a
              href="#features"
              onClick={e => handleNavClick(e, '#features')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              امکانات
            </a>
            <a
              href="#how-it-works"
              onClick={e => handleNavClick(e, '#how-it-works')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              چگونه کار می‌کند
            </a>
            <a
              href="#smart-cooking"
              onClick={e => handleNavClick(e, '#smart-cooking')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              آشپزی هوشمند
            </a>
            <a
              href="#faq"
              onClick={e => handleNavClick(e, '#faq')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              سوالات متداول
            </a>
            <button
              onClick={() => navigate('/login')}
              className="hover:text-amber-300 transition-colors cursor-pointer py-1"
            >
              ورود
            </button>
            <button
              onClick={() => navigate('/register')}
              className="hover:text-amber-300 transition-colors cursor-pointer py-1"
            >
              ثبت‌نام
            </button>
          </nav>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right text-[11px] font-bold text-stone-500">
          <p>© ۱۴۰۴ سفره. تمامی حقوق محفوظ است.</p>
          <p className="text-stone-600">طراحی شده برای آشپزی آسان و هوشمند ایرانی</p>
        </div>

      </div>
    </footer>
  );
};

