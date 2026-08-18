const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const handleCommentSubmitOld = `  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    await fetch(\`/api/recipes/\${id}/comments\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newComment, rating })
    });
    setNewComment('');
    setRating(5);
    fetchComments();
  };`;

const handleCommentSubmitNew = `  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    await fetch(\`/api/recipes/\${id}/comments\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newComment, rating: 0 }) // 0 rating means no rating attached to comment
    });
    setNewComment('');
    fetchComments();
  };

  const handleRatingSubmit = async (selectedRating: number) => {
    if (!user) {
      alert('برای ثبت امتیاز ابتدا وارد شوید.');
      return;
    }
    setRating(selectedRating);
    const token = localStorage.getItem('token');
    await fetch(\`/api/recipes/\${id}/rate\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating: selectedRating })
    });
    // fetch recipe again to update rating
    fetch(\`/api/recipes/\${id}\`).then(res => res.json()).then(data => {
      setRecipe(data);
    });
  };`;
code = code.replace(handleCommentSubmitOld, handleCommentSubmitNew);

const formOld = `            <form onSubmit={handleCommentSubmit} className="mb-12 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6 rounded-3xl shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">امتیاز شما:</label>
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
              <textarea 
                className="w-full border-none bg-stone-50 dark:bg-stone-900 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none mb-4 transition-all resize-none text-stone-700 dark:text-stone-200"
                rows={3}
                placeholder="نظر خود را بنویسید..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="bg-stone-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-stone-900 shadow-md transition-all hover:-translate-y-0.5">ثبت نظر</button>
            </form>`;

const formNew = `            <div className="mb-8 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6 rounded-3xl shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">ثبت امتیاز به این غذا:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => handleRatingSubmit(star)}
                      className="p-1 focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={\`w-8 h-8 transition-colors \${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-2">با کلیک روی ستاره‌ها، امتیاز شما ثبت می‌شود.</p>
              </div>
            </div>
            
            <form onSubmit={handleCommentSubmit} className="mb-12 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6 rounded-3xl shadow-sm">
              <textarea 
                className="w-full border-none bg-stone-50 dark:bg-stone-900 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none mb-4 transition-all resize-none text-stone-700 dark:text-stone-200"
                rows={3}
                placeholder="نظر خود را بنویسید..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              ></textarea>
              <button type="submit" className="bg-stone-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-stone-900 shadow-md transition-all hover:-translate-y-0.5">ثبت نظر</button>
            </form>`;

code = code.replace(formOld, formNew);

// Also we should hide stars for comments that have rating=0
const commentRenderOld = `                <div className="flex pr-14 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={\`w-4 h-4 \${star <= c.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                  ))}
                </div>
                <p className="pr-14 text-stone-600 dark:text-stone-300 leading-relaxed text-sm">
                  {c.content}
                </p>`;
                
const commentRenderNew = `                {c.rating > 0 && (
                  <div className="flex pr-14 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={\`w-4 h-4 \${star <= c.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                    ))}
                  </div>
                )}
                {c.content && (
                  <p className="pr-14 text-stone-600 dark:text-stone-300 leading-relaxed text-sm">
                    {c.content}
                  </p>
                )}`;
code = code.replace(commentRenderOld, commentRenderNew);

fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
