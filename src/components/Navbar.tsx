import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ChefHat,
  Refrigerator,
  Calendar,
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BellRing,
  Eraser
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchFridge } from '../db';
import { analyzeExpiry } from '../utils/expiryNotifier';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expiringCount, setExpiringCount] = useState<number>(0);

  useEffect(() => {
    checkExpiringItems();
  }, [location.pathname]);

  const checkExpiringItems = async () => {
    try {
      const items = await fetchFridge();
      if (Array.isArray(items)) {
        const count = items.filter(item => {
          if (!item.expiryDate) return false;
          const status = analyzeExpiry(item.expiryDate).status;
          return status === 'expired' || status === 'expiring_soon';
        }).length;
        setExpiringCount(count);
      }
    } catch (e) {
      // silent
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const baseNavItems = [
    { path: '/recipes', label: 'دستورات پخت', icon: UtensilsCrossed },
    { path: '/what-to-cook', label: 'چی بپزم؟', icon: Sparkles, highlight: true },
    { path: '/fridge', label: 'یخچال من', icon: Refrigerator, badgeCount: expiringCount },
    { path: '/suggestions', label: 'برنامه هفتگی', icon: Calendar },
    { path: '/shopping-list', label: 'لیست خرید', icon: ShoppingBag },
    { path: '/favorites', label: 'علاقه‌مندی‌ها', icon: Heart }
  ];

  const navItems = user?.isAdmin
    ? [...baseNavItems, { path: '/admin', label: 'پنل مدیریت', icon: ShieldCheck }]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name: "سفره" */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-stone-900 tracking-tight block">سفره</span>
              <span className="hidden md:block text-[10px] text-emerald-700 font-bold -mt-1">دستیار هوشمند آشپزی</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    active
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : item.highlight
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/80'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {Boolean(item.badgeCount && item.badgeCount > 0) && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            {location.pathname === '/fridge' && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('clear-fridge'))}
                className="md:hidden p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200/80 shadow-xs cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                title="پاکسازی کامل یخچال"
                aria-label="پاکسازی کامل یخچال"
              >
                <Eraser className="w-4 h-4" />
              </button>
            )}

            <Link
              to="/profile"
              className="flex items-center gap-1.5 p-2 md:px-3.5 md:py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all border border-stone-200/80 bg-white min-h-[40px] md:min-h-[44px] shadow-2xs"
              title={user?.name || 'حساب من'}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline max-w-[120px] truncate">{user?.name || 'حساب من'}</span>
            </Link>

            <button
              onClick={logout}
              title="خروج از حساب"
              aria-label="خروج از حساب"
              className="hidden md:flex p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200/80 bg-white min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 flex flex-col">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs top-16"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-[#FAF9F5] border-b border-stone-200 shadow-xl px-4 pt-3 pb-6 space-y-1 z-10 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
                    active
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badgeCount && item.badgeCount > 0) && (
                    <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
