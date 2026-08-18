const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const postCommentOld = `  const newComment: Comment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    content,
    rating,
    createdAt: new Date().toISOString()
  };`;

const postCommentNew = `  const userObj = db.users.find(u => u.id === req.user.id);
  const newComment: Comment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    userName: userObj ? userObj.name : (req.user.name || 'کاربر ناشناس'),
    content,
    rating,
    createdAt: new Date().toISOString()
  };`;
server = server.replace(postCommentOld, postCommentNew);

const getRecipeOld = `  const comments = db.comments.filter(c => c.recipeId === req.params.id);
  const ratingCount = comments.length;
  const avgRating = ratingCount > 0 
    ? (comments.reduce((sum, c) => sum + (c.rating || 5), 0) / ratingCount).toFixed(1) 
    : 0;`;

const getRecipeNew = `  const comments = db.comments.filter(c => c.recipeId === req.params.id);
  const ratingCount = comments.length;
  
  const sortedComments = [...comments].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const userRatings = new Map();
  sortedComments.forEach(c => {
    if (c.rating) userRatings.set(c.userId, c.rating);
  });
  const uniqueRatings = Array.from(userRatings.values());
  const uniqueCount = uniqueRatings.length;
  const avgRating = uniqueCount > 0 
    ? (uniqueRatings.reduce((sum, r) => sum + r, 0) / uniqueCount).toFixed(1) 
    : 0;`;
server = server.replace(getRecipeOld, getRecipeNew);

fs.writeFileSync('server.ts', server);
console.log('patched');
