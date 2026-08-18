const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const oldRender = `<div className="flex pr-14 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={\`w-3 h-3 \${star <= (c.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                  ))}
                </div>`;
const newRender = `{c.rating > 0 && (
                  <div className="flex pr-14 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={\`w-3 h-3 \${star <= c.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}\`} />
                    ))}
                  </div>
                )}`;
code = code.replace(oldRender, newRender);
fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
