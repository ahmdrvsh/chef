const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

code = code.replace(
  `      body: JSON.stringify({ content: newComment, rating: 0 }) // 0 rating means no rating attached to comment`,
  `      body: JSON.stringify({ content: newComment, rating: 0, userName: user?.name }) // 0 rating means no rating attached to comment`
);
fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
