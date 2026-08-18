import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Menu, X, ArrowLeft } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: '#features', label: 'امکانات' },
    { href: '#how-it-works', label: 'چگونه کار می‌کند' },
    { href: '#smart-cooking', label: 'آشپزی هوشمند' },
    { href: '#showcase', label: 'نمای برنامه' },
    { href: '#faq', label: 'سوالات متداول' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Right: Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-stone-900 leading-none">
                سفره
              </span>
              <span className="text-[10px] text-emerald-800 font-extrabold mt-0.5">
                دستیار هوشمند آشپزی
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className="text-xs font-extrabold text-stone-600 hover:text-emerald-800 transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Left: Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 text-xs font-black text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer min-h-[40px]"
            >
              ورود
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-700/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <span>شروع رایگان</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 text-xs font-black text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer min-h-[36px]"
            >
              ورود
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-emerald-800 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="منو"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-stone-900/40 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-[#FAF9F5] border-b border-stone-200 p-5 shadow-2xl space-y-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href)}
                  className="px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between min-h-[44px]"
                >
                  <span>{link.label}</span>
                  <span className="text-stone-300">←</span>
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-stone-200/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/register');
                }}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>شروع رایگان</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3.5 bg-white text-stone-800 font-bold text-xs rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-center cursor-pointer min-h-[48px]"
              >
                ورود به برنامه سفره
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

