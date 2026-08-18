const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace synchronous imports with lazy imports
const components = [
  'LandingPage', 'AuthLandingPage', 'RecipesPage', 'RecipeDetailPage',
  'CategoryFilteredRecipesPage', 'FridgePage', 'WhatToCookPage',
  'SuggestionsPage', 'ShoppingListPage', 'FavoritesPage', 'ProfilePage', 'AdminPage'
];

components.forEach(comp => {
  const importRegex = new RegExp(`import \\{ ${comp} \\} from '\\.\\/pages\\/([^']+)';`);
  const match = app.match(importRegex);
  if (match) {
    app = app.replace(importRegex, `const ${comp} = React.lazy(() => import('./pages/${match[1]}').then(module => ({ default: module.${comp} })));`);
  }
});

// We need to ensure we have Suspense
if (!app.includes('Suspense')) {
  app = app.replace("import React from 'react';", "import React, { Suspense } from 'react';");
}

// Wrap Routes inside Suspense.
app = app.replace(/<Routes>/g, '<Suspense fallback={<div className="flex h-screen items-center justify-center text-emerald-600 animate-pulse font-bold text-sm">در حال بارگذاری...</div>}><Routes>');
app = app.replace(/<\/Routes>/g, '</Routes></Suspense>');

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx patched for lazy loading');
