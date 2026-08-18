const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `const [adminSettings, setAdminSettings] = React.useState({ heroImageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800' });`;
const newState = `const [adminSettings, setAdminSettings] = React.useState<{heroImageUrl: string, heroSubtitle?: string}>({ heroImageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800' });`;
code = code.replace(oldState, newState);

const oldText = `<h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-white mb-3">من محیاس هستم و سعی دارم به شما در آشپزی با لذت بیشتر کمک کنم</h2>`;
const newText = `<h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-white mb-3">{adminSettings.heroSubtitle || 'من محیاس هستم و سعی دارم به شما در آشپزی با لذت بیشتر کمک کنم'}</h2>`;
code = code.replace(oldText, newText);

fs.writeFileSync('src/App.tsx', code);
