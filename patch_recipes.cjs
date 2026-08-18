const fs = require('fs');
let code = fs.readFileSync('src/pages/Recipes.tsx', 'utf8');

const oldState = `  const [difficulty, setDifficulty] = useState('');
  const mealTypes = ['صبحانه', 'ناهار', 'شام', 'دسر', 'کیک', 'نوشیدنی', 'پیش‌غذا', 'عصرانه'];`;
const newState = `  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [diet, setDiet] = useState('');
  const mealTypes = ['صبحانه', 'ناهار', 'شام', 'دسر', 'کیک', 'نوشیدنی', 'پیش‌غذا', 'عصرانه'];
  const diets = ['گیاه‌خواری', 'بدون گلوتن', 'وگان', 'رژیمی'];`;
code = code.replace(oldState, newState);

const oldQuery = `      if (search) query.append('search', search);
      if (mealType) query.append('mealType', mealType);
      if (difficulty) query.append('difficulty', difficulty);`;
const newQuery = `      if (search) query.append('search', search);
      if (mealType) query.append('mealType', mealType);
      if (difficulty) query.append('difficulty', difficulty);
      if (maxTime) query.append('maxTime', maxTime);
      if (diet) query.append('diet', diet);`;
code = code.replace(oldQuery, newQuery);

const oldDeps = `  }, [search, mealType, difficulty]);`;
const newDeps = `  }, [search, mealType, difficulty, maxTime, diet]);`;
code = code.replace(oldDeps, newDeps);

const oldFilters = `        <select 
          className="bg-stone-50 dark:bg-stone-900 rounded-xl border-none px-4 py-3.5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all outline-none text-stone-700 dark:text-stone-200"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">همه سختی‌ها</option>
          <option value="آسان">آسان</option>
          <option value="متوسط">متوسط</option>
          <option value="سخت">سخت</option>
        </select>
      </div>`;
const newFilters = `        <select 
          className="bg-stone-50 dark:bg-stone-900 rounded-xl border-none px-4 py-3.5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all outline-none text-stone-700 dark:text-stone-200"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">همه سختی‌ها</option>
          <option value="آسان">آسان</option>
          <option value="متوسط">متوسط</option>
          <option value="سخت">سخت</option>
        </select>
        <select 
          className="bg-stone-50 dark:bg-stone-900 rounded-xl border-none px-4 py-3.5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all outline-none text-stone-700 dark:text-stone-200"
          value={maxTime}
          onChange={(e) => setMaxTime(e.target.value)}
        >
          <option value="">همه زمان‌ها</option>
          <option value="30">زیر ۳۰ دقیقه</option>
          <option value="60">زیر ۱ ساعت</option>
          <option value="61">بیش از ۱ ساعت</option>
        </select>
        <select 
          className="bg-stone-50 dark:bg-stone-900 rounded-xl border-none px-4 py-3.5 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all outline-none text-stone-700 dark:text-stone-200"
          value={diet}
          onChange={(e) => setDiet(e.target.value)}
        >
          <option value="">رژیم غذایی</option>
          {diets.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>`;
code = code.replace(oldFilters, newFilters);

fs.writeFileSync('src/pages/Recipes.tsx', code);
