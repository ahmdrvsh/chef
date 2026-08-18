const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const oldState = `const [recipe, setRecipe] = useState<any>(null);`;
const newState = `const [recipe, setRecipe] = useState<any>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);`;
code = code.replace(oldState, newState);

const oldIngredients = `<h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 border-b border-stone-100 dark:border-stone-700 pb-4">مواد لازم</h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing: any, i: number) => (
                <li key={i} className="flex justify-between items-baseline text-sm">
                  <span className="font-bold text-stone-700 dark:text-stone-200">{ing.name}</span>
                  <div className="flex-1 border-b-2 border-dotted border-stone-200 dark:border-stone-600 mx-3"></div>
                  <span className="text-stone-500 dark:text-stone-400 font-medium">{ing.quantity} {ing.unit}</span>
                </li>
              ))}
            </ul>`;

const newIngredients = `<h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 border-b border-stone-100 dark:border-stone-700 pb-4">مواد لازم</h3>
            <div className="flex items-center justify-between mb-4 mt-2">
              <span className="text-sm font-bold text-stone-600 dark:text-stone-300">مناسب برای {recipe.servings ? recipe.servings * servingsMultiplier : servingsMultiplier} نفر</span>
              <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-1">
                <button onClick={() => setServingsMultiplier(Math.max(1, servingsMultiplier - 1))} className="text-stone-500 hover:text-orange-500 font-bold w-6 h-6 flex items-center justify-center">-</button>
                <span className="font-bold text-stone-800 dark:text-stone-100 w-4 text-center">{servingsMultiplier}x</span>
                <button onClick={() => setServingsMultiplier(servingsMultiplier + 1)} className="text-stone-500 hover:text-orange-500 font-bold w-6 h-6 flex items-center justify-center">+</button>
              </div>
            </div>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing: any, i: number) => {
                const parsedQty = parseFloat(ing.quantity);
                const displayQty = !isNaN(parsedQty) ? (parsedQty * servingsMultiplier).toString() : ing.quantity;
                return (
                  <li key={i} className="flex justify-between items-baseline text-sm">
                    <span className="font-bold text-stone-700 dark:text-stone-200">{ing.name}</span>
                    <div className="flex-1 border-b-2 border-dotted border-stone-200 dark:border-stone-600 mx-3"></div>
                    <span className="text-stone-500 dark:text-stone-400 font-medium">{displayQty} {ing.unit}</span>
                  </li>
                );
              })}
            </ul>`;

code = code.replace(oldIngredients, newIngredients);
fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
