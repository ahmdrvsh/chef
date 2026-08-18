const fs = require('fs');

let content = fs.readFileSync('src/pages/Recipes.tsx', 'utf8');

// Ensure VirtuosoGrid is imported
if (!content.includes('VirtuosoGrid')) {
  content = content.replace(
    "import { ImageWithFallback } from '../components/ImageWithFallback';",
    "import { ImageWithFallback } from '../components/ImageWithFallback';\nimport { VirtuosoGrid } from 'react-virtuoso';"
  );
}

// Replace the traditional map rendering with VirtuosoGrid
// Look for `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">`
const gridContainerStartRegex = /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">/g;

// We need to replace from the grid container to its end, but it's hard with regex.
// Instead we can write a script to replace the specific block.
