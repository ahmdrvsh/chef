const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importOld = `import Admin from './pages/Admin';`;
const importNew = `import Admin from './pages/Admin';
import Favorites from './pages/Favorites';`;
content = content.replace(importOld, importNew);

const navbarOld = `<Link to="/fridge" className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors tracking-wide">یخچال من</Link>`;
const navbarNew = `<Link to="/favorites" className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors tracking-wide">علاقه‌مندی‌ها</Link>
                      <Link to="/fridge" className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors tracking-wide">یخچال من</Link>`;
content = content.replace(navbarOld, navbarNew);

const routeOld = `<Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Home />} />`;
const routeNew = `<Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Home />} />
            <Route path="/favorites" element={user ? <Favorites /> : <Login />} />`;
content = content.replace(routeOld, routeNew);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx with Favorites');
