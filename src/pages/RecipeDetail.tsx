import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Users,
  Star,
  Heart,
  ShoppingBag,
  Check,
  ChefHat,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Send,
  AlertCircle,
  ThumbsUp,
  UserCheck,
  Video,
  Play,
  ExternalLink
} from 'lucide-react';
import { Recipe, FridgeItem, ShoppingItem, RecipeIngredient, RecipeComment, RecipeRating } from '../data/initialData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  fetchRecipes,
  fetchFridge,
  fetchShoppingList,
  saveShoppingList,
  addRecipeComment,
  rateRecipe,
  getRecipeEffectiveRating
} from '../db';
import { matchIngredientInFridge } from '../utils/unitConverter';
import { useAuth } from '../context/AuthContext';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(4);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Comment & Rating States
  const [commentText, setCommentText] = useState('');
  const [commentGuestName, setCommentGuestName] = useState('');
  const [commentMessage, setCommentMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [userHoverRating, setUserHoverRating] = useState<number | null>(null);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('sofreh_recipes_updated', handleUpdate);
    return () => window.removeEventListener('sofreh_recipes_updated', handleUpdate);
  }, [id]);

  const loadData = async () => {
    const recipes = await fetchRecipes();
    const found = recipes.find(r => r.id === id);
    if (found) {
      setRecipe(found);
      setServings(found.servings || 4);
    }
    const fridgeData = await fetchFridge();
    setFridge(fridgeData);

    const favs = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    if (id && favs.includes(id)) {
      setIsFavorite(true);
    }
  };

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ChefHat className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-stone-700">در حال بارگذاری دستور پخت...</h2>
      </div>
    );
  }

  const multiplier = servings / (recipe.servings || 4);

  const toggleFavorite = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('sofreh_favs') || '[]');
    let updated: string[];
    if (favs.includes(recipe.id)) {
      updated = favs.filter(f => f !== recipe.id);
      setIsFavorite(false);
    } else {
      updated = [...favs, recipe.id];
      setIsFavorite(true);
    }
    localStorage.setItem('sofreh_favs', JSON.stringify(updated));
  };

  const handleAddIngredientsToShoppingList = async () => {
    const currentShopping = await fetchShoppingList();
    const newItems: ShoppingItem[] = [...currentShopping];

    recipe.ingredients.forEach(ing => {
      const baseAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(String(ing.amount));
      const scaledAmount = !isNaN(baseAmount) && baseAmount > 0
        ? Math.round(baseAmount * multiplier * 10) / 10
        : ing.amount;

      const fridgeStatus = matchIngredientInFridge(ing.name, scaledAmount, ing.unit, fridge);

      if (!fridgeStatus.isSufficient) {
        const itemQuantity = fridgeStatus.deficitQuantity || scaledAmount;
        const existing = newItems.find(s => s.name === ing.name);
        if (existing) {
          existing.quantity = `${existing.quantity} + ${itemQuantity}`;
        } else {
          newItems.push({
            id: 'shop_' + Date.now() + Math.random().toString(36).substring(2, 5),
            name: ing.name,
            quantity: itemQuantity,
            unit: ing.unit,
            category: 'مواد پخت غذا',
            isBought: false,
            isFromFridge: fridgeStatus.isInFridge,
            fridgeQuantity: fridgeStatus.fridgeQuantity,
            statusText: fridgeStatus.statusText
          });
        }
      }
    });

    await saveShoppingList(newItems);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // Separate ingredients into 3 categories: اصلی, افزودنی, اختیاری
  const mainIngredients = recipe.ingredients.filter(ing => !ing.type || ing.type === 'اصلی');
  const additiveIngredients = recipe.ingredients.filter(ing => ing.type === 'افزودنی');
  const optionalIngredients = recipe.ingredients.filter(ing => ing.type === 'اختیاری');

  // Compute rating display values
  const effectiveRating = getRecipeEffectiveRating(recipe);
  const totalUserRatingsCount = recipe.ratings?.length || 0;

  // Active User Rating
  const activeUserId = user ? user.id : 'guest_' + (localStorage.getItem('sofreh_guest_id') || '1');
  const activeUserName = user ? user.name : (commentGuestName.trim() || 'کاربر مهمان');

  const existingUserRatingObj = recipe.ratings?.find(r => r.userId === activeUserId);
  const existingUserScore = existingUserRatingObj?.score || 0;

  const handleScoreSubmit = async (score: number) => {
    if (!activeUserId) return;

    let currentGuestId = localStorage.getItem('sofreh_guest_id');
    if (!user && !currentGuestId) {
      currentGuestId = 'guest_' + Date.now();
      localStorage.setItem('sofreh_guest_id', currentGuestId);
    }

    const effectiveId = user ? user.id : currentGuestId!;
    const res = await rateRecipe(recipe.id, score, { id: effectiveId, name: activeUserName });

    if (res.success && res.recipes) {
      const updatedFound = res.recipes.find(r => r.id === recipe.id);
      if (updatedFound) setRecipe(updatedFound);
      setRatingMessage(`امتیاز ${score} ستاره شما ثبت گردید.`);
      setTimeout(() => setRatingMessage(null), 3000);
    }
  };

  // Comments Handling
  const commentsList = recipe.comments || [];
  const userCommentCount = commentsList.filter(c => c.userId === activeUserId).length;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    let currentGuestId = localStorage.getItem('sofreh_guest_id');
    if (!user && !currentGuestId) {
      currentGuestId = 'guest_' + Date.now();
      localStorage.setItem('sofreh_guest_id', currentGuestId);
    }

    const effectiveId = user ? user.id : currentGuestId!;
    const displayName = user ? user.name : (commentGuestName.trim() || 'کاربر مهمان');

    const res = await addRecipeComment(recipe.id, commentText, {
      id: effectiveId,
      name: displayName
    });

    if (res.success && res.recipes) {
      const updatedFound = res.recipes.find(r => r.id === recipe.id);
      if (updatedFound) setRecipe(updatedFound);
      setCommentText('');
      setCommentMessage({ text: 'نظر شما با موفقیت ثبت شد.' });
      setTimeout(() => setCommentMessage(null), 3000);
    } else {
      setCommentMessage({ text: res.message || 'خطا در ثبت نظر', error: true });
    }
  };

  const renderIngredientCard = (ing: RecipeIngredient, idx: number) => {
    const baseAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(String(ing.amount));
    const amount = !isNaN(baseAmount) && baseAmount > 0
      ? Math.round(baseAmount * multiplier * 10) / 10
      : ing.amount;

    const fridgeStatus = matchIngredientInFridge(ing.name, amount, ing.unit, fridge);

    return (
      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/80 border border-stone-100">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-stone-800 block">{ing.name}</span>
          {fridgeStatus.isSufficient ? (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              ✓ در یخچال موجود است
            </span>
          ) : fridgeStatus.isInFridge ? (
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
              {fridgeStatus.statusText}
            </span>
          ) : (
            <span className="text-[10px] text-stone-400 block">نیاز به خرید دارد</span>
          )}
        </div>
        <span className="text-xs font-black text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-xl">
          {amount} {ing.unit}
        </span>
      </div>
    );
  };

  const renderVideoPlayer = (url?: string) => {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();

    // YouTube URL
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      let videoId = '';
      if (trimmed.includes('youtu.be/')) {
        videoId = trimmed.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (trimmed.includes('v=')) {
        videoId = trimmed.split('v=')[1]?.split('&')[0] || '';
      } else if (trimmed.includes('/embed/')) {
        videoId = trimmed.split('/embed/')[1]?.split('?')[0] || '';
      }
      if (videoId) {
        return (
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-600" />
              <span>ویدیو آموزشی تهیه {recipe.title}</span>
            </h3>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`ویدیو آموزشی ${recipe.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        );
      }
    }

    // Aparat URL
    if (trimmed.includes('aparat.com')) {
      let videoHash = '';
      if (trimmed.includes('/v/')) {
        videoHash = trimmed.split('/v/')[1]?.split('?')[0] || '';
      } else if (trimmed.includes('/embed/')) {
        videoHash = trimmed.split('/embed/')[1]?.split('?')[0] || '';
      }
      if (videoHash) {
        return (
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-600" />
              <span>ویدیو آموزشی تهیه {recipe.title} (آپارات)</span>
            </h3>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-black">
              <iframe
                src={`https://www.aparat.com/video/video/embed/videohash/${videoHash}/vt/frame`}
                title={`ویدیو آموزشی ${recipe.title}`}
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        );
      }
    }

    // Direct MP4 / Video file URL
    if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i)) {
      return (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-600" />
            <span>ویدیو آموزشی {recipe.title}</span>
          </h3>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-black">
            <video controls src={trimmed} className="w-full h-full object-contain">
              مرورگر شما امکان پخش آنلاین این ویدیو را ندارد.
            </video>
          </div>
        </div>
      );
    }

    // External Video Link (Instagram, etc.)
    return (
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="p-5 bg-gradient-to-r from-stone-900 to-rose-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl shrink-0">
              <Play className="w-6 h-6 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">ویدیو آموزش پخت این غذا موجود است</h4>
              <p className="text-stone-300 text-xs mt-0.5">جهت مشاهده کامل فیلم آموزش طرز تهیه، وارد لینک زیر شوید:</p>
            </div>
          </div>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0 self-end sm:self-center"
          >
            <span>مشاهده فیلم آموزشی</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Back Button */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-700 text-xs font-bold transition-colors min-h-[40px]"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به لیست دستورات پخت</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-stone-200/90 grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-52 sm:h-72 md:h-full bg-stone-100">
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleFavorite}
            aria-label="افزودن به علاقه‌مندی‌ها"
            className="absolute top-3 right-3 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-stone-800 transition-all shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-700'}`} />
          </button>
        </div>

        <div className="p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* All Categories */}
              {((recipe.categories && recipe.categories.length > 0)
                ? recipe.categories
                : (recipe.category ? [recipe.category] : [])
              ).map(cat => (
                <span key={cat} className="bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg shadow-xs">
                  {cat}
                </span>
              ))}

              <span className="bg-stone-100 text-stone-700 font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg border border-stone-200/60">
                سختی: {recipe.difficulty}
              </span>

              {/* All Diets */}
              {((recipe.diets && recipe.diets.length > 0)
                ? recipe.diets
                : (recipe.diet ? [recipe.diet] : [])
              ).map(d => (
                <span key={d} className="bg-emerald-50 text-emerald-800 font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg border border-emerald-200/60">
                  رژیم: {d}
                </span>
              ))}

              {/* All Meal Types */}
              {(recipe.mealTypes && recipe.mealTypes.length > 0) ? (
                recipe.mealTypes.map(m => (
                  <span key={m} className="bg-amber-50 text-amber-900 font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                    وعده: {m}
                  </span>
                ))
              ) : recipe.mealType ? (
                <span className="bg-amber-50 text-amber-900 font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                  وعده: {recipe.mealType}
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-stone-900 leading-tight">
              {recipe.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
            <div>
              <Clock className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span className="block text-[10px] text-stone-500">زمان کل</span>
              <span className="text-xs font-bold text-stone-800">{recipe.prepTime + recipe.cookTime} دقیقه</span>
            </div>
            <div>
              <Users className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span className="block text-[10px] text-stone-500">تعداد نفرات اولیه</span>
              <span className="text-xs font-bold text-stone-800">{recipe.servings} نفر</span>
            </div>
            <div>
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 mx-auto mb-1" />
              <span className="block text-[10px] text-stone-500">امتیاز</span>
              <span className="text-xs font-bold text-stone-800">
                {effectiveRating} / ۵ {recipe.useAdminRating ? '★' : `(${totalUserRatingsCount})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients Column (with Categorization) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900">مواد اولیه</h3>

            {/* Adjust Servings */}
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-9 h-9 min-h-[36px] min-w-[36px] bg-white rounded-lg font-bold text-stone-700 shadow-xs hover:bg-emerald-700 hover:text-white transition-colors flex items-center justify-center text-sm cursor-pointer"
                aria-label="کاهش تعداد نفرات"
              >
                -
              </button>
              <span className="text-xs font-black px-1.5 text-stone-800">{servings} نفر</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="w-9 h-9 min-h-[36px] min-w-[36px] bg-white rounded-lg font-bold text-stone-700 shadow-xs hover:bg-emerald-700 hover:text-white transition-colors flex items-center justify-center text-sm cursor-pointer"
                aria-label="افزایش تعداد نفرات"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Main Ingredients */}
            {mainIngredients.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg w-max">
                  <span>📌 مواد اصلی</span>
                </div>
                <div className="space-y-2">
                  {mainIngredients.map((ing, idx) => renderIngredientCard(ing, idx))}
                </div>
              </div>
            )}

            {/* Additive Ingredients */}
            {additiveIngredients.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 bg-stone-100 border border-stone-200/60 px-2.5 py-1 rounded-lg w-max">
                  <span>🌿 افزودنی‌ها و چاشنی‌ها</span>
                </div>
                <div className="space-y-2">
                  {additiveIngredients.map((ing, idx) => renderIngredientCard(ing, idx))}
                </div>
              </div>
            )}

            {/* Optional Ingredients */}
            {optionalIngredients.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg w-max">
                  <span>✨ مواد اختیاری</span>
                </div>
                <div className="space-y-2">
                  {optionalIngredients.map((ing, idx) => renderIngredientCard(ing, idx))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAddIngredientsToShoppingList}
            className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 ${
              addedToCart
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4" />
                به لیست خرید اضافه شد
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                افزودن اقلام کسرشده به لیست خرید
              </>
            )}
          </button>
        </div>

        {/* Instructions, Tips, Rating & Comments Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Section if available */}
          {renderVideoPlayer(recipe.videoUrl)}

          {/* Instructions Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-stone-900 pb-4 border-b border-stone-100">
              مراحل تهیه گام‌به‌گام
            </h3>

            <div className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
                  <span className="w-8 h-8 rounded-2xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips Section (Displayed conditionally ONLY if tips content exists) */}
            {recipe.tips && recipe.tips.trim().length > 0 && (
              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-stone-50 border border-amber-200/80 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>نکات و فوت‌وفن‌های پخت</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line font-medium pr-7">
                    {recipe.tips}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Ratings Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold text-stone-900">امتیاز این دستور پخت</h3>
                <p className="text-xs text-stone-500">
                  {recipe.useAdminRating
                    ? 'امتیاز تاییدشده توسط کارشناسان سفره'
                    : `میانگین ${effectiveRating} از ۵ بر اساس ${totalUserRatingsCount} نظر ثبت‌شده`}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200/60">
                <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                <span className="text-xl font-black text-stone-800">{effectiveRating}</span>
                <span className="text-xs text-stone-500">/ ۵</span>
              </div>
            </div>

            {/* Interactive Rating Component */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <span className="text-xs sm:text-sm font-bold text-stone-800 block">
                  {existingUserScore > 0 ? 'امتیاز ثبت‌شده شما برای این غذا:' : 'امتیاز شما به این دستور پخت:'}
                </span>
                {existingUserScore > 0 && (
                  <span className="text-[11px] text-amber-700 font-semibold block">
                    (با کلیک روی ستاره‌ها می‌توانید امتیاز خود را ویرایش کنید)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 dir-ltr">
                {[1, 2, 3, 4, 5].map(star => {
                  const isHighlighted = (userHoverRating !== null ? userHoverRating : existingUserScore) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setUserHoverRating(star)}
                      onMouseLeave={() => setUserHoverRating(null)}
                      onClick={() => handleScoreSubmit(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      title={`${star} ستاره`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isHighlighted
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {ratingMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{ratingMessage}</span>
              </div>
            )}
          </div>

          {/* User Comments Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-stone-900">نظرات و تجربیات کاربران ({commentsList.length})</h3>
              </div>

              <span className="text-xs text-stone-500 font-medium">
                سقف مجاز: ۵ نظر برای هر کاربر
              </span>
            </div>

            {/* Comment Form */}
            {userCommentCount >= 5 ? (
              <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>شما حداکثر تعداد نظر مجاز (۵ نظر) را برای این دستور پخت ثبت کرده‌اید.</span>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی شما (اختیاری)"
                      value={commentGuestName}
                      onChange={e => setCommentGuestName(e.target.value)}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="تجربه پخت، پیشنهادات یا سئوال خود را درباره این غذا بنویسید..."
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-medium">
                    تعداد نظرات ثبت‌شده شما: {userCommentCount} از ۵
                  </span>

                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت نظر</span>
                  </button>
                </div>

                {commentMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      commentMessage.error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {commentMessage.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    <span>{commentMessage.text}</span>
                  </div>
                )}
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {commentsList.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs space-y-1">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold">هنوز نظری برای این دستور پخت ثبت نشده است.</p>
                  <p className="text-stone-400">اولین نفری باشید که تجربه پخت خود را به اشتراک می‌گذارید!</p>
                </div>
              ) : (
                commentsList.map(comment => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-stone-50/80 border border-stone-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                          {comment.userName ? comment.userName.charAt(0) : 'ک'}
                        </div>
                        <span className="text-xs font-bold text-stone-800">{comment.userName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">{comment.createdAt}</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed pr-9 font-medium whitespace-pre-line">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
