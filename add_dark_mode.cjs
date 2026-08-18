const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && file !== 'App.tsx' && file !== 'Profile.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const replacements = {
        'bg-white': 'bg-white dark:bg-stone-800',
        'bg-stone-50': 'bg-stone-50 dark:bg-stone-900',
        'bg-stone-100': 'bg-stone-100 dark:bg-stone-800',
        'text-stone-800': 'text-stone-800 dark:text-stone-100',
        'text-stone-700': 'text-stone-700 dark:text-stone-200',
        'text-stone-600': 'text-stone-600 dark:text-stone-300',
        'text-stone-500': 'text-stone-500 dark:text-stone-400',
        'border-stone-100': 'border-stone-100 dark:border-stone-700',
        'border-stone-200': 'border-stone-200 dark:border-stone-600',
        'border-gray-100': 'border-gray-100 dark:border-stone-700',
        'border-gray-200': 'border-gray-200 dark:border-stone-600',
        'bg-gray-50': 'bg-gray-50 dark:bg-stone-900',
        'bg-gray-100': 'bg-gray-100 dark:bg-stone-800',
        'text-gray-800': 'text-gray-800 dark:text-stone-100',
        'text-gray-700': 'text-gray-700 dark:text-stone-200',
        'text-gray-600': 'text-gray-600 dark:text-stone-300',
        'text-gray-500': 'text-gray-500 dark:text-stone-400',
        'text-gray-400': 'text-gray-400 dark:text-stone-500',
      };
      
      // Need to use word boundaries or careful replacements to avoid double replacing if script is run twice
      for (const [find, replace] of Object.entries(replacements)) {
        const regex = new RegExp(`(?<!dark:)${find}(?!\\s*dark:)`, 'g');
        content = content.replace(regex, replace);
      }
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src/pages');
