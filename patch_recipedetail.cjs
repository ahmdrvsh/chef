const fs = require('fs');
let content = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

// 1. Imports
const importsOld = `import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';`;
const importsNew = `import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Heart, Star } from 'lucide-react';`;
content = content.replace(importsOld, importsNew);

// 2. States and fetching
const statesOld = `  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`/api/recipes/\${id}\`).then(res => res.json()).then(data => {
      setRecipe(data);
      setLoading(false);
    });
    fetchComments();
  }, [id]);`;
  
const statesNew = `  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  useEffect(() => {
    fetch(\`/api/recipes/\${id}\`).then(res => res.json()).then(data => {
      setRecipe(data);
      setLoading(false);
    });
    fetchComments();
    if (user) checkFavorite();
  }, [id, user]);

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(\`/api/favorites/\${id}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('لطفا برای افزودن به علاقه‌مندی‌ها وارد شوید.');
      return;
    }
    setIsFavLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\`/api/favorites/\${id}\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFavLoading(false);
    }
  };`;
content = content.replace(statesOld, statesNew);

// 3. Comment Submit
const submitOld = `body: JSON.stringify({ content: newComment, rating: 5 })`;
const submitNew = `body: JSON.stringify({ content: newComment, rating })`;
content = content.replace(submitOld, submitNew);
const resetOld = `setNewComment('');
    fetchComments();`;
const resetNew = `setNewComment('');
    setRating(5);
    fetchComments();`;
content = content.replace(resetOld, resetNew);

// 4. Header UI (Title + Rating + Favorite)
const headerOld = `<h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-8 tracking-tight">{recipe.title}</h1>`;
const headerNew = `<h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-6 tracking-tight">{recipe.title}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-stone-800">{recipe.averageRating > 0 ? recipe.averageRating : 'بدون امتیاز'}</span>
              <span className="text-stone-400 text-sm">({recipe.ratingCount} نظر)</span>
            </div>
            
            <button 
              onClick={toggleFavorite}
              disabled={isFavLoading}
              className={\`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all \${isFavorite ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}\`}
            >
              <Heart className={\`w-5 h-5 \${isFavorite ? 'fill-rose-500 text-rose-500' : ''}\`} />
              {isFavorite ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            </button>
          </div>`;
content = content.replace(headerOld, headerNew);

// 5. Comment form rating UI
const formOld = `<form onSubmit={handleCommentSubmit} className="mb-12">
              <textarea`;
const formNew = `<form onSubmit={handleCommentSubmit} className="mb-12 bg-white border border-stone-100 p-6 rounded-3xl shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-700 mb-2">امتیاز شما:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star className={\`w-8 h-8 transition-colors \${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea`;
content = content.replace(formOld, formNew);

// 6. Comment render UI to show rating
const commentUiOld = `<div>
                    <span className="font-bold text-stone-800 text-sm block">{c.userName}</span>
                    <span className="text-xs text-stone-400">{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed pr-14">{c.content}</p>`;

const commentUiNew = `<div>
                    <span className="font-bold text-stone-800 text-sm block">{c.userName}</span>
                    <span className="text-xs text-stone-400">{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
                <div className="flex pr-14 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={\`w-3 h-3 \${star <= (c.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed pr-14">{c.content}</p>`;
content = content.replace(commentUiOld, commentUiNew);

fs.writeFileSync('src/pages/RecipeDetail.tsx', content);
console.log('Patched RecipeDetail.tsx successfully');
