const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Add state
const oldState = `const [calories, setCalories] = useState('');`;
const newState = `const [calories, setCalories] = useState('');\n  const [servings, setServings] = useState('4');`;
code = code.replace(oldState, newState);

// Update resetForm
const oldReset = `setCalories('');`;
const newReset = `setCalories('');\n    setServings('4');`;
code = code.replace(oldReset, newReset);

// Update handleEdit
const oldEdit = `setCalories(recipe.calories?.toString() || '');`;
const newEdit = `setCalories(recipe.calories?.toString() || '');\n    setServings(recipe.servings?.toString() || '4');`;
code = code.replace(oldEdit, newEdit);

// Update handleSubmit
const oldSubmit = `calories: Number(calories) || 0,`;
const newSubmit = `calories: Number(calories) || 0,\n      servings: Number(servings) || 4,`;
code = code.replace(oldSubmit, newSubmit);

// Update Form UI
const oldUI = `<div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-stone-200 mb-1">کالری (تقریبی)</label>
                      <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>`;
const newUI = `<div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-stone-200 mb-1">کالری (تقریبی)</label>
                      <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-stone-200 mb-1">تعداد نفرات</label>
                      <input type="number" required value={servings} onChange={e => setServings(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>`;
code = code.replace(oldUI, newUI);

// Fix grid layout if it was grid-cols-4 it needs to be 5?
// Actually let's just make it grid-cols-2 md:grid-cols-5
const oldGrid = `grid grid-cols-2 md:grid-cols-4 gap-4`;
const newGrid = `grid grid-cols-2 md:grid-cols-5 gap-4`;
code = code.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/Admin.tsx', code);
