const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `const isFridgeRoute = location.pathname === '/fridge';`,
  `const isFullScreenRoute = ['/fridge', '/shopping-list', '/recipes'].includes(location.pathname);`
);

code = code.replace(/isFridgeRoute \?/g, `isFullScreenRoute ?`);
code = code.replace(/!isFridgeRoute/g, `!isFullScreenRoute`);

fs.writeFileSync('src/App.tsx', code);
