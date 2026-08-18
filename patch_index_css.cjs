const fs = require('fs');
let content = `@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
`;
fs.writeFileSync('src/index.css', content);
