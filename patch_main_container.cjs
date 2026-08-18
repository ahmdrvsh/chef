const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldMain = `<main className={isFullScreenRoute ? "flex-1 flex overflow-hidden" : "max-w-7xl mx-auto px-6 lg:px-8 py-12"}>`;
const newMain = `<main className={isFullScreenRoute ? "flex-1 flex overflow-hidden" : (location.pathname === '/' ? "w-full" : "max-w-7xl mx-auto px-6 lg:px-8 py-12")}>`;

code = code.replace(oldMain, newMain);
fs.writeFileSync('src/App.tsx', code);
