import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Refrigerator, Calendar, ShoppingBag, Sparkles } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { path: '/recipes', label: 'دستورات', icon: UtensilsCrossed },
      { path: '/suggestions', label: 'برنامه', icon: Calendar },
      { path: '/what-to-cook', label: 'چی بپزم؟', icon: Sparkles, isHighlight: true },
      { path: '/fridge', label: 'یخچال', icon: Refrigerator },
      { path: '/shopping-list', label: 'خرید', icon: ShoppingBag }
    ],
    []
  );

  // Find active item index (0 to 4)
  const activeIndex = useMemo(() => {
    const currentPath = location.pathname;
    if (currentPath === '/recipes' || currentPath.startsWith('/recipes/')) return 0;
    if (currentPath === '/suggestions') return 1;
    if (currentPath === '/what-to-cook') return 2;
    if (currentPath === '/fridge') return 3;
    if (currentPath === '/shopping-list') return 4;
    return 0; // Default to recipes
  }, [location.pathname]);

  const activeItem = navItems[activeIndex] || navItems[0];
  const ActiveIcon = activeItem.icon;

  // Center percentage for 5 tabs (RTL: index 0 is at rightmost 10%, index 4 is at leftmost 90%)
  const activeCenterPercent = activeIndex * 20 + 10;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none w-full">
      <div className="relative w-full pointer-events-auto">
        
        {/* ========================================================================= */}
        {/* SVG BACKGROUND WITH CONCAVE CUTOUT NOTCH & BORDER                         */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 top-0 h-full w-full pointer-events-none overflow-visible">
          <svg
            className="w-full h-full overflow-visible drop-shadow-[0_-3px_10px_rgba(0,0,0,0.06)]"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Mask: White shows through, Black creates transparent hole */}
              <mask id="nav-concave-cutout-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <g
                  className="transition-all duration-400 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
                  style={{
                    transform: `translateX(calc(100% - ${activeCenterPercent}%))`
                  }}
                >
                  {/* Black shape cutting a 30% deeper, smooth transparent concave notch */}
                  <path
                    d="M -56 10 C -36 10 -28 49 0 49 C 28 49 36 10 56 10 L 56 0 L -56 0 Z"
                    fill="black"
                  />
                </g>
              </mask>
            </defs>

            {/* Solid White Navigation Bar Background (Straight edge-to-edge, masked cutout) */}
            <rect
              x="0"
              y="10"
              width="100%"
              height="100%"
              fill="#FFFFFF"
              mask="url(#nav-concave-cutout-mask)"
            />

            {/* Top Border Line following the 30% deeper concave notch curve */}
            <g
              className="transition-all duration-400 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
              style={{
                transform: `translateX(calc(100% - ${activeCenterPercent}%))`
              }}
            >
              <path
                d="M -600 10 L -56 10 C -36 10 -28 49 0 49 C 28 49 36 10 56 10 L 600 10"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* ANIMATED FLOATING ACTIVE BUBBLE (30% RAISED ABOVE BAR LINE)               */}
        {/* ========================================================================= */}
        <div
          className="absolute -top-1 w-12 h-12 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.34,1.35,0.64,1)] z-30 flex items-center justify-center"
          style={{
            right: `calc(${activeCenterPercent}% - 24px)`
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white text-emerald-800 shadow-md shadow-stone-900/15 border-2 border-emerald-500/50 flex flex-col items-center justify-center transform transition-transform duration-300 active:scale-95 ring-2 ring-emerald-500/10">
            <ActiveIcon className="w-5 h-5 text-emerald-700 stroke-[2.2] animate-in zoom-in-75 duration-200" />
            <span className="text-[9px] font-black text-emerald-950 mt-0.5 leading-none tracking-tight">
              {activeItem.label}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION BAR ITEMS ROW                                                  */}
        {/* ========================================================================= */}
        <nav
          dir="rtl"
          className="relative w-full pt-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] px-1 flex items-center justify-around z-10"
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 cursor-pointer group"
              >
                {/* Regular Inactive Tab View */}
                <div
                  className={`flex flex-col items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'opacity-0 scale-50 pointer-events-none translate-y-1'
                      : 'opacity-85 group-hover:opacity-100 scale-100'
                  }`}
                >
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      item.isHighlight ? 'text-amber-600' : 'text-stone-500 group-hover:text-stone-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-900 tracking-tight whitespace-nowrap mt-0.5">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};


