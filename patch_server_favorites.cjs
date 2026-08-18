const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Update recipe endpoint
const recipeEndpointOld = `app.get('/api/recipes/:id', (req, res) => {
  const db = getDb();
  const recipe = db.recipes.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: 'غذا یافت نشد' });
  
  recipe.views = (recipe.views || 0) + 1;
  saveDb(db);
  
  res.json(recipe);
});`;

const recipeEndpointNew = `app.get('/api/recipes/:id', (req, res) => {
  const db = getDb();
  const recipe = db.recipes.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: 'غذا یافت نشد' });
  
  recipe.views = (recipe.views || 0) + 1;
  saveDb(db);
  
  const comments = db.comments.filter(c => c.recipeId === req.params.id);
  const ratingCount = comments.length;
  const avgRating = ratingCount > 0 
    ? (comments.reduce((sum, c) => sum + (c.rating || 5), 0) / ratingCount).toFixed(1) 
    : 0;
  
  res.json({ ...recipe, ratingCount, averageRating: avgRating });
});`;

content = content.replace(recipeEndpointOld, recipeEndpointNew);

// Add favorites endpoints before Vite middleware
const favoritesEndpoints = `
// Favorites
app.get('/api/favorites', authenticateToken, (req: any, res: any) => {
  const db = getDb();
  const userFavorites = db.favorites.filter(f => f.userId === req.user.id);
  const favoriteRecipes = userFavorites.map(f => db.recipes.find(r => r.id === f.recipeId)).filter(Boolean);
  res.json(favoriteRecipes);
});

app.get('/api/favorites/:recipeId', authenticateToken, (req: any, res: any) => {
  const db = getDb();
  const isFavorite = db.favorites.some(f => f.userId === req.user.id && f.recipeId === req.params.recipeId);
  res.json({ isFavorite });
});

app.post('/api/favorites/:recipeId', authenticateToken, (req: any, res: any) => {
  const db = getDb();
  const existingIndex = db.favorites.findIndex(f => f.userId === req.user.id && f.recipeId === req.params.recipeId);
  
  if (existingIndex >= 0) {
    db.favorites.splice(existingIndex, 1);
    saveDb(db);
    return res.json({ isFavorite: false });
  } else {
    db.favorites.push({
      userId: req.user.id,
      recipeId: req.params.recipeId,
      createdAt: new Date().toISOString()
    });
    saveDb(db);
    return res.json({ isFavorite: true });
  }
});
`;

const marker = `  // Vite middleware for development`;
content = content.replace(marker, favoritesEndpoints + '\n' + marker);

fs.writeFileSync('server.ts', content);
console.log('Patched server.ts with favorites endpoints');
