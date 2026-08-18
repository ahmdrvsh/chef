const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');
code = code.replace(
  `{c.userName.charAt(0)}`,
  `{(c.userName || 'کاربر ناشناس').charAt(0)}`
);
code = code.replace(
  `<span className="font-bold text-stone-800 dark:text-stone-100 text-sm block">{c.userName}</span>`,
  `<span className="font-bold text-stone-800 dark:text-stone-100 text-sm block">{c.userName || 'کاربر ناشناس'}</span>`
);
fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
