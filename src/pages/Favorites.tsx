import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, Users, ChefHat } from 'lucide-react';
import { Recipe } from '../data/initialData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { fetchRecipes } from '../db';

export const FavoritesPage: React.FC = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const allRecipes = await fetchRecipes();
    const favIds: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    setFavoriteRecipes(allRecipes.filter(r => favIds.includes(r.id)));
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favIds: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    const updated = favIds.filter(f => f !== id);
    localStorage.setItem('sofreh_favs', JSON.stringify(updated));
    setFavoriteRecipes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
            <span>دستورات مورد علاقه شما</span>
          </div>
          <h1 className="text-3xl font-black">غذاهای نشان‌شده سفره</h1>
          <p className="text-emerald-100 text-xs sm:text-sm">
            مجموعه دستورات پخت مورد علاقه شما برای دسترسی سریع و آسان.
          </p>
        </div>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">هنوز هیچ دستور پختی را نشان نکرده‌اید</h3>
          <p className="text-xs text-stone-500">می‌توانید با کلیک روی آیکون قلب در دستورات پخت، غذاها را به این بخش اضافه کنید.</p>
          <Link
            to="/recipes"
            className="inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            مشاهده همه دستورات پخت
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRecipes.map(recipe => (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <ImageWithFallback
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={e => removeFavorite(recipe.id, e)}
                  className="absolute top-2.5 right-2.5 p-1 bg-transparent border-0 outline-none text-white hover:text-rose-300 transition-all cursor-pointer active:scale-90 z-10 focus:outline-none"
                  aria-label="حذف از نشان‌شده‌ها"
                >
                  <Heart className="w-6 h-6 fill-rose-500 text-rose-500 stroke-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">{recipe.title}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{recipe.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{recipe.prepTime + recipe.cookTime} دقیقه</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{recipe.rating || 4.8}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
