const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Look for <img > or <ImageWithFallback > that don't have loading="lazy"
      content = content.replace(/<img(?![^>]*loading="lazy")/g, '<img loading="lazy" decoding="async" fetchPriority="low"');
      content = content.replace(/<ImageWithFallback(?![^>]*loading="lazy")/g, '<ImageWithFallback loading="lazy" decoding="async" fetchPriority="low"');
      
      // Specifically for hero images or things that might be above the fold, we could use fetchPriority="high", but for now standard lazy loading is fine.
      // Actually we probably don't want lazy loading on the MAIN hero image of a recipe, but standard is fine. Let's just do loading="lazy" for ImageWithFallback and img
      fs.writeFileSync(full, content);
    }
  }
}

processDir('src/components');
processDir('src/pages');
console.log('Images optimized');
