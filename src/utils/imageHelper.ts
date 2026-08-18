export function getLocalHostRecipeImage(index: number = 0, seed?: string): number {
  let hash = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const dishNum = (Math.abs(hash + index) % 5) + 1;
  return dishNum;
}

export function sanitizeImageUrl(url?: string, index: number = 0, title?: string): string {
  if (!url || url.includes('unsplash.com')) {
    const dishNum = getLocalHostRecipeImage(index, title);
    return `/images/dishes/dish-${dishNum}.svg`;
  }
  return url;
}

export function sanitizeCategoryImage(url?: string, title?: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes('سوپ') || t.includes('آش')) return '/images/categories/soup.svg';
  if (t.includes('سالاد')) return '/images/categories/salad.svg';
  if (t.includes('پیش‌غذا') || t.includes('پیش غذا')) return '/images/categories/appetizer.svg';
  if (t.includes('دسر') || t.includes('شیرینی') || t.includes('کیک')) return '/images/categories/dessert.svg';
  if (t.includes('نوشیدنی')) return '/images/categories/beverage.svg';
  if (t.includes('فست‌فود') || t.includes('فست فود')) return '/images/categories/fastfood.svg';
  if (t.includes('سنتی')) return '/images/categories/traditional.svg';
  return '/images/categories/main.svg';
}
