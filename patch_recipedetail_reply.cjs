const fs = require('fs');
let content = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const commentOld = `<p className="text-stone-600 text-sm leading-relaxed pr-14">{c.content}</p>
              </div>`;
              
const commentNew = `<p className="text-stone-600 text-sm leading-relaxed pr-14">{c.content}</p>
                {c.adminReply && (
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mt-4 mr-14">
                    <p className="font-bold text-orange-800 text-xs mb-1">پاسخ مدیر:</p>
                    <p className="text-orange-900 text-sm">{c.adminReply}</p>
                  </div>
                )}
              </div>`;

content = content.replace(commentOld, commentNew);
fs.writeFileSync('src/pages/RecipeDetail.tsx', content);
console.log('Patched RecipeDetail.tsx reply');
