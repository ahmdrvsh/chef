const fs = require('fs');
let code = fs.readFileSync('src/pages/Fridge.tsx', 'utf8');

// Always open sidebar
code = code.replace(`const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);`, `const [isSidebarOpen, setIsSidebarOpen] = useState(true);`);

// Mobile layout col-reverse
code = code.replace(`<div className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-stone-800 overflow-hidden text-sm" dir="ltr">`, `<div className="w-full h-full flex flex-col-reverse md:flex-row bg-white dark:bg-stone-800 overflow-hidden text-sm" dir="ltr">`);

// Sidebar classes
const oldSidebarClass = `className="fixed inset-0 md:relative md:inset-auto w-full md:w-80 lg:w-[350px] shrink-0 flex flex-col border-r border-gray-200 dark:border-stone-600 bg-white dark:bg-stone-800 z-50 md:z-10 shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-all h-full"`;
const newSidebarClass = `className="w-full md:w-80 lg:w-[350px] shrink-0 flex flex-col border-r border-gray-200 dark:border-stone-600 bg-white dark:bg-stone-800 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-all h-[40%] md:h-full border-t md:border-t-0"`;
code = code.replace(oldSidebarClass, newSidebarClass);

// Clear button in header
const oldSidebarHeader = `<div className="flex items-center gap-2 opacity-90">
              <span className="font-bold text-sm cursor-pointer">AZ</span>
              <div className="flex flex-col gap-[3px] items-center justify-center w-6 h-6 cursor-pointer">
                <span className="w-1 h-1 bg-white dark:bg-stone-800 rounded-full"></span>
                <span className="w-1 h-1 bg-white dark:bg-stone-800 rounded-full"></span>
                <span className="w-1 h-1 bg-white dark:bg-stone-800 rounded-full"></span>
              </div>
            </div>`;
const newSidebarHeader = `<div className="flex items-center gap-2 opacity-90">
              {items.length > 0 && (
                <button onClick={() => { setItems([]); saveFridge([]); }} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors border border-white/30" title="پاک کردن انتخاب‌ها">
                  پاک کردن
                </button>
              )}
            </div>`;
code = code.replace(oldSidebarHeader, newSidebarHeader);

fs.writeFileSync('src/pages/Fridge.tsx', code);
