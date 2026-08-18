const fs = require('fs');
let code = fs.readFileSync('src/pages/Fridge.tsx', 'utf8');

code = code.replace(
  `Check, BookOpen, Sun, Moon } from 'lucide-react';`, 
  `Check, BookOpen, Sun, Moon, ShoppingCart } from 'lucide-react';`
);

const oldLink = `<Link to="/recipes" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="دستورات پخت">`;
const newLink = `<Link to="/shopping-list" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="لیست خرید">
                <ShoppingCart className="w-4 h-4" />
              </Link>
              <Link to="/recipes" className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity" title="دستورات پخت">`;

code = code.replace(oldLink, newLink);
fs.writeFileSync('src/pages/Fridge.tsx', code);
