const fs = require('fs');
let fridge = fs.readFileSync('src/pages/Fridge.tsx', 'utf8');

const importRegex = /import React, \{ useState, useMemo, useEffect, useContext \} from 'react';/;
if (importRegex.test(fridge)) {
    // Already good
} else {
    fridge = fridge.replace(
      /import React, \{ useState, useMemo, useEffect \} from 'react';/,
      `import React, { useState, useMemo, useEffect, useContext } from 'react';`
    );
}

const COMMON_REGEX = /const COMMON_INGREDIENTS: Record<string, string\[\]> = \{[\s\S]*?  \]\n\};\n\n/;
fridge = fridge.replace(COMMON_REGEX, '');

const fridgeStateOld = `function Fridge() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('لبنیات و تخم‌مرغ');
  const [suggestions, setSuggestions] = useState<any[]>([]);`;

const fridgeStateNew = `function Fridge() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('لبنیات و تخم‌مرغ');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [adminIngredients, setAdminIngredients] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data && data.ingredients) {
        setAdminIngredients(data.ingredients);
        if (!activeCategory && Object.keys(data.ingredients).length > 0) {
            setActiveCategory(Object.keys(data.ingredients)[0]);
        }
      }
    });
  }, []);`;
fridge = fridge.replace(fridgeStateOld, fridgeStateNew);

fridge = fridge.replace(
  /Object\.entries\(COMMON_INGREDIENTS\)/g,
  `Object.entries(adminIngredients)`
);

fridge = fridge.replace(
  /Object\.keys\(COMMON_INGREDIENTS\)/g,
  `Object.keys(adminIngredients)`
);

fridge = fridge.replace(
  /if \(!searchQuery\) return COMMON_INGREDIENTS;/,
  `if (!searchQuery) return adminIngredients;`
);

fs.writeFileSync('src/pages/Fridge.tsx', fridge);
console.log('patched');
