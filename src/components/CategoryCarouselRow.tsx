import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

export interface SubCategoryItem {
  id: string;
  title: string;
  image: string;
  matchKeyword: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  iconName: string;
  items: SubCategoryItem[];
}

interface CategoryCarouselRowProps {
  group: CategoryGroup;
  onItemClick: (item: SubCategoryItem) => void;
}

export const CategoryCarouselRow: React.FC<CategoryCarouselRowProps> = ({
  group,
  onItemClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const calculateActiveCard = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardRect = el.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const dist = Math.abs(containerCenter - cardCenter);

      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateActiveCard);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial calculation
    calculateActiveCard();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [calculateActiveCard]);

  const handleCardClick = (item: SubCategoryItem, idx: number) => {
    // If user clicked an inactive card on mobile, scroll it into view or navigate
    onItemClick(item);
  };

  return (
    <div className="space-y-2">
      {/* Row Header */}
      <div className="px-1">
        <h3 className="text-xs sm:text-sm font-black text-stone-900">
          {group.title}
        </h3>
      </div>

      {/* Horizontal Scrollable Carousel with 30% smaller adjacent cards */}
      <div
        ref={containerRef}
        className="flex items-center gap-1 sm:gap-4 overflow-x-auto py-3 px-[18vw] sm:px-6 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-3.5 sm:-mx-6 lg:-mx-8"
        style={{ scrollPaddingLeft: '18vw', scrollPaddingRight: '18vw' }}
      >
        {group.items.map((item, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={item.id}
              ref={el => (cardRefs.current[idx] = el)}
              type="button"
              onClick={() => handleCardClick(item, idx)}
              className={`group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 snap-center cursor-pointer text-right flex flex-col justify-end p-3.5 sm:p-5 border-2 transition-all duration-300 ease-out origin-center ${
                isActive
                  ? 'w-[60vw] sm:w-56 md:w-64 scale-100 shadow-md border-emerald-500/80 z-10'
                  : 'w-[60vw] sm:w-56 md:w-64 scale-[0.70] sm:scale-95 border-transparent hover:border-emerald-300/40 z-0'
              }`}
            >
              {/* Background Image */}
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay for Readability (Clean & Vibrant) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:from-black/85 transition-opacity duration-300" />

              {/* Title Overlay */}
              <div className="relative z-10 space-y-0.5">
                <span className="text-sm sm:text-base font-black block drop-shadow-md text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
