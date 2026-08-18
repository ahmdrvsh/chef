const fs = require('fs');
let code = fs.readFileSync('src/pages/Fridge.tsx', 'utf8');

code = code.replace(`const [isSidebarOpen, setIsSidebarOpen] = useState(true);`, `const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);`);

const oldSidebarClass = `className="w-full md:w-80 lg:w-[350px] shrink-0 flex flex-col border-r border-gray-200 dark:border-stone-600 bg-white dark:bg-stone-800 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-all"`;
const newSidebarClass = `className="fixed inset-0 md:relative md:inset-auto w-full md:w-80 lg:w-[350px] shrink-0 flex flex-col border-r border-gray-200 dark:border-stone-600 bg-white dark:bg-stone-800 z-50 md:z-10 shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-all h-full"`;
code = code.replace(oldSidebarClass, newSidebarClass);

fs.writeFileSync('src/pages/Fridge.tsx', code);
