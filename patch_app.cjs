const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importOld = `import Admin from './pages/Admin';`;
const importNew = `import Admin from './pages/Admin';
import Profile from './pages/Profile';`;
content = content.replace(importOld, importNew);

const appCtxOld = `export const AuthContext = React.createContext<any>(null);`;
const appCtxNew = `export const AuthContext = React.createContext<any>(null);
export const ThemeContext = React.createContext<any>(null);`;
content = content.replace(appCtxOld, appCtxNew);

const appCompOld = `function AppContent() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch(e) {}
    }
  }, []);`;

const appCompNew = `function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch(e) {}
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };`;

content = content.replace(appCompOld, appCompNew);

const iconImportsOld = `import { ChefHat, Search, Menu, User, Globe, ChevronRight, ChevronDown, ChevronUp, LogOut } from 'lucide-react';`;
const iconImportsNew = `import { ChefHat, Search, Menu, User, Globe, ChevronRight, ChevronDown, ChevronUp, LogOut, Moon, Sun } from 'lucide-react';`;
content = content.replace(iconImportsOld, iconImportsNew);

const returnOld = `  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className={\`min-h-screen bg-stone-50 font-sans text-stone-800 transition-colors duration-300 \${isFridgeRoute ? 'h-screen overflow-hidden flex flex-col' : ''}\`} dir="rtl">
        {/* Navbar */}
        {!isFridgeRoute && (
          <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 transition-all duration-300">`;

const returnNew = `  return (
    <AuthContext.Provider value={{ user, setUser }}>
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={\`min-h-screen bg-stone-50 dark:bg-stone-900 font-sans text-stone-800 dark:text-stone-100 transition-colors duration-300 \${isFridgeRoute ? 'h-screen overflow-hidden flex flex-col' : ''}\`} dir="rtl">
        {/* Navbar */}
        {!isFridgeRoute && (
          <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50 transition-all duration-300">`;
content = content.replace(returnOld, returnNew);

const navbarEndOld = `                      </button>
                    </div>
                  ) : (`;
                  
const navbarEndNew = `                        <Link to="/profile" className="text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl" title="پروفایل">
                          <User className="w-5 h-5" />
                        </Link>
                      </button>
                    </div>
                  ) : (`;
content = content.replace(navbarEndOld, navbarEndNew);

// Add the theme toggle button next to search
const searchOld = `                  <div className="relative hidden md:block">
                    <input type="text" placeholder="جستجوی غذا..." className="pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 border-none focus:ring-2 focus:ring-orange-500/50 text-sm w-64 transition-all duration-300 outline-none" />
                    <Search className="absolute left-3 top-3 text-stone-400 w-4 h-4" />
                  </div>`;
const searchNew = `                  <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="relative hidden md:block">
                      <input type="text" placeholder="جستجوی غذا..." className="pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 dark:text-stone-100 border-none focus:ring-2 focus:ring-orange-500/50 text-sm w-64 transition-all duration-300 outline-none" />
                      <Search className="absolute left-3 top-3 text-stone-400 dark:text-stone-500 w-4 h-4" />
                    </div>
                  </div>`;
content = content.replace(searchOld, searchNew);

const routerOld = `            <Route path="/favorites" element={user ? <Favorites /> : <Login />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}`;

const routerNew = `            <Route path="/favorites" element={user ? <Favorites /> : <Login />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
          </Routes>
        </main>
      </div>
    </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}`;
content = content.replace(routerOld, routerNew);

// Also change the title from text-stone-800 to dark:text-white
content = content.replace(`className="text-2xl font-bold tracking-tight text-stone-800"`, `className="text-2xl font-bold tracking-tight text-stone-800 dark:text-white"`);

fs.writeFileSync('src/App.tsx', content);
