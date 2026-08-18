const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = `import Favorites from './pages/Favorites';`;
code = code.replace(importStr, importStr + `\nimport ShoppingList from './pages/ShoppingList';`);

const routeStr = `<Route path="/favorites" element={user ? <Favorites /> : <Login />} />`;
code = code.replace(routeStr, routeStr + `\n            <Route path="/shopping-list" element={<ShoppingList />} />`);

fs.writeFileSync('src/App.tsx', code);
