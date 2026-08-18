const fs = require('fs');
let recipe = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const importsOld = `import { Heart, Star } from 'lucide-react';`;
const importsNew = `import { Heart, Star, Share2 } from 'lucide-react';`;
recipe = recipe.replace(importsOld, importsNew);

const toggleOld = `  const toggleFavorite = async () => {`;
const toggleNew = `  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: 'این دستور پخت را در آشپز من ببینید:',
          url: url,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('لینک کپی شد!');
    }
  };

  const toggleFavorite = async () => {`;
recipe = recipe.replace(toggleOld, toggleNew);

const buttonsOld = `            <button 
              onClick={toggleFavorite}
              disabled={isFavLoading}
              className={\`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all \${isFavorite ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:bg-stone-900'}\`}
            >
              <Heart className={\`w-5 h-5 \${isFavorite ? 'fill-rose-500 text-rose-500' : ''}\`} />
              {isFavorite ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            </button>
          </div>`;
          
const buttonsNew = `            <button 
              onClick={toggleFavorite}
              disabled={isFavLoading}
              className={\`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all \${isFavorite ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700'}\`}
            >
              <Heart className={\`w-5 h-5 \${isFavorite ? 'fill-rose-500 text-rose-500' : ''}\`} />
              {isFavorite ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"
            >
              <Share2 className="w-5 h-5" />
              اشتراک‌گذاری
            </button>
          </div>`;
recipe = recipe.replace(buttonsOld, buttonsNew);

fs.writeFileSync('src/pages/RecipeDetail.tsx', recipe);
