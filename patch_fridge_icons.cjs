const fs = require('fs');
let code = fs.readFileSync('src/pages/Fridge.tsx', 'utf8');

// 1. Add AuthContext and ThemeContext import
code = code.replace(`import { AuthContext } from '../App';`, `import { AuthContext, ThemeContext } from '../App';`);

// 2. Add lucide icons
code = code.replace(`import { Search, Menu, User, Globe, Heart, ExternalLink, ChevronDown, ChevronUp, ChevronRight, Check } from 'lucide-react';`, `import { Search, Menu, User, Globe, Heart, ExternalLink, ChevronDown, ChevronUp, ChevronRight, Check, BookOpen, Sun, Moon } from 'lucide-react';`);

// 3. Add ThemeContext to Fridge
code = code.replace(`const { user } = useContext(AuthContext);`, `const { user } = useContext(AuthContext);\n  const { isDarkMode, toggleTheme } = useContext(ThemeContext);`);

// 4. Update the icons in header
const oldIcons = `<div className="flex items-center gap-3">
              <Link to="/profile" className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center hover:bg-white dark:bg-stone-800/10 transition-colors">
                <User className="w-4 h-4" />
              </Link>
            </div>`;

const newIcons = `<div className="flex items-center gap-2 md:gap-3">
              <Link to="/recipes" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="دستورات پخت">
                <BookOpen className="w-4 h-4" />
              </Link>
              <Link to="/favorites" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="علاقه‌مندی‌ها">
                <Heart className="w-4 h-4" />
              </Link>
              <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="تغییر تم">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/profile" className="w-8 h-8 border border-white/40 rounded-full flex items-center justify-center hover:bg-white dark:bg-stone-800/10 transition-colors bg-white/10" title="پروفایل">
                <User className="w-4 h-4" />
              </Link>
            </div>`;
            
code = code.replace(oldIcons, newIcons);

fs.writeFileSync('src/pages/Fridge.tsx', code);
