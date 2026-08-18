const fs = require('fs');
let code = fs.readFileSync('src/pages/RecipeDetail.tsx', 'utf8');

const oldElements = `{user ? (
            <div className="mb-8 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6 rounded-3xl shadow-sm">`;
const newElements = `{user ? (
            <>
            <div className="mb-8 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6 rounded-3xl shadow-sm">`;
code = code.replace(oldElements, newElements);

const oldElementsEnd = `              <button type="submit" className="bg-stone-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-stone-900 shadow-md transition-all hover:-translate-y-0.5">ثبت نظر</button>
            </form>
          ) : (`;
const newElementsEnd = `              <button type="submit" className="bg-stone-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-stone-900 shadow-md transition-all hover:-translate-y-0.5">ثبت نظر</button>
            </form>
            </>
          ) : (`;
code = code.replace(oldElementsEnd, newElementsEnd);

fs.writeFileSync('src/pages/RecipeDetail.tsx', code);
