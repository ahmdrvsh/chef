const fs = require('fs');

// db.ts
let dbts = fs.readFileSync('src/db.ts', 'utf8');
dbts = dbts.replace(
  `  fridgeItems: FridgeItem[];\n}`,
  `  fridgeItems: FridgeItem[];\n  adminSettings: { heroImageUrl: string; };\n}`
);
dbts = dbts.replace(
  `  fridgeItems: []\n};`,
  `  fridgeItems: [],\n  adminSettings: { heroImageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800' }\n};`
);
dbts = dbts.replace(
  `    db.fridgeItems = db.fridgeItems || [];`,
  `    db.fridgeItems = db.fridgeItems || [];\n    db.adminSettings = db.adminSettings || { heroImageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800' };`
);
fs.writeFileSync('src/db.ts', dbts);

// server.ts
let server = fs.readFileSync('server.ts', 'utf8');

const settingsAPI = `
// Admin Settings
app.get('/api/settings', (req: any, res: any) => {
  const db = getDb();
  res.json(db.adminSettings);
});

app.put('/api/settings', authenticateToken, requireAdmin, (req: any, res: any) => {
  const db = getDb();
  db.adminSettings = { ...db.adminSettings, ...req.body };
  saveDb(db);
  res.json(db.adminSettings);
});

// Favorites
`;
server = server.replace(`// Favorites`, settingsAPI);
fs.writeFileSync('server.ts', server);

