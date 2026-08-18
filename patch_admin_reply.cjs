const fs = require('fs');

// Patch Admin.tsx
let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminContent = adminContent.replace(
  '<p className="font-bold text-orange-800 mb-1">پاسخ مدیر:</p>',
  '<p className="font-bold text-orange-800 mb-1">محیاس:</p>'
);
fs.writeFileSync('src/pages/Admin.tsx', adminContent);

// Patch RecipeDetail.tsx
let recipeDetailContent = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');
recipeDetailContent = recipeDetailContent.replace(
  '<p className="font-bold text-orange-800 text-xs mb-1">پاسخ مدیر:</p>',
  '<p className="font-bold text-orange-800 text-xs mb-1">محیاس:</p>'
);
fs.writeFileSync('src/pages/RecipeDetail.tsx', recipeDetailContent);

