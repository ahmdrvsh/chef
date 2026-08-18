const fs = require('fs');

let content = fs.readFileSync('src/pages/Recipes.tsx', 'utf8');

if (!content.includes('VirtuosoGrid')) {
  content = content.replace(
    "import { ImageWithFallback } from '../components/ImageWithFallback';",
    "import { ImageWithFallback } from '../components/ImageWithFallback';\nimport { VirtuosoGrid } from 'react-virtuoso';"
  );
}

// Now the fun part, replacing the list.
const targetBlockStart = `<div className="grid grid-cols-2 gap-3 sm:gap-5">
            {visibleRecipes.map(recipe => {`;
            
const replacementStart = `<VirtuosoGrid
            useWindowScroll
            data={filteredAndSortedRecipes}
            listClassName="grid grid-cols-2 gap-3 sm:gap-5"
            itemContent={(index, recipe) => {`;

content = content.replace(targetBlockStart, replacementStart);

// We need to remove the closing tags of map and replace with closing tag of VirtuosoGrid
const targetBlockEnd = `                </Link>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* LOAD MORE BUTTON (WHEN USER REACHES END / MORE RECIPES AVAILABLE)         */}
          {/* ========================================================================= */}
          {hasMore ? (
            <div className="pt-4 pb-2 text-center space-y-2">
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer min-h-[48px] inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
                <span>نمایش بیشتر دستورات غذایی (۲۰ ردیف دیگر)</span>
              </button>
              <p className="text-[11px] text-stone-400 font-bold">
                در حال نمایش {visibleRecipes.length} از {filteredAndSortedRecipes.length} دستور پخت
              </p>
            </div>
          ) : (
            filteredAndSortedRecipes.length > RECIPES_PER_BATCH && (
              <div className="pt-4 text-center text-xs font-bold text-stone-400">
                ✓ تمام {filteredAndSortedRecipes.length} دستور پخت بارگذاری شدند.
              </div>
            )
          )}
        </div>`;

const replacementEnd = `                </Link>
              );
            }}
          />
        </div>`;

content = content.replace(targetBlockEnd, replacementEnd);

fs.writeFileSync('src/pages/Recipes.tsx', content);
console.log('Recipes patched for Virtuoso');
