const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const oldRoute = `app.get('/api/recipes', (req, res) => {
  const db = getDb();
  const search = req.query.search as string;
  const mealType = req.query.mealType as string;
  const difficulty = req.query.difficulty as string;
  
  let recipes = db.recipes.filter(r => r.published);
  
  if (search) recipes = recipes.filter(r => r.title.includes(search));
  if (mealType) recipes = recipes.filter(r => r.mealTypes.includes(mealType));
  if (difficulty) recipes = recipes.filter(r => r.difficulty === difficulty);
  
  res.json(recipes);
});`;
const newRoute = `app.get('/api/recipes', (req, res) => {
  const db = getDb();
  const search = req.query.search as string;
  const mealType = req.query.mealType as string;
  const difficulty = req.query.difficulty as string;
  const maxTime = req.query.maxTime as string;
  const diet = req.query.diet as string;
  
  let recipes = db.recipes.filter(r => r.published);
  
  if (search) recipes = recipes.filter(r => r.title.includes(search));
  if (mealType) recipes = recipes.filter(r => r.mealTypes.includes(mealType));
  if (difficulty) recipes = recipes.filter(r => r.difficulty === difficulty);
  if (diet) recipes = recipes.filter(r => r.tags && r.tags.includes(diet));
  if (maxTime) {
    if (maxTime === '30') recipes = recipes.filter(r => (r.prepTime + r.cookTime) <= 30);
    else if (maxTime === '60') recipes = recipes.filter(r => (r.prepTime + r.cookTime) <= 60);
    else if (maxTime === '61') recipes = recipes.filter(r => (r.prepTime + r.cookTime) > 60);
  }
  
  res.json(recipes);
});`;
code = code.replace(oldRoute, newRoute);
fs.writeFileSync('server.ts', code);
