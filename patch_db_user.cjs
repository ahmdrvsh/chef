const fs = require('fs');
let dbts = fs.readFileSync('src/db.ts', 'utf8');
dbts = dbts.replace(
  `  role: 'user' | 'admin';\n  createdAt: string;\n}`,
  `  role: 'user' | 'admin';\n  createdAt: string;\n  birthDate?: string;\n  phoneNumber?: string;\n}`
);
fs.writeFileSync('src/db.ts', dbts);
