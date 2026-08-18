const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const getMeOld = `// User: Get Profile
app.get('/api/me', authenticateToken, (req: any, res: any) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});`;

const getMeNew = `// User: Get Profile
app.get('/api/me', authenticateToken, (req: any, res: any) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, birthDate: user.birthDate, phoneNumber: user.phoneNumber });
});

app.put('/api/me', authenticateToken, (req: any, res: any) => {
  const { name, birthDate, phoneNumber } = req.body;
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
  
  if (name !== undefined) user.name = name;
  if (birthDate !== undefined) user.birthDate = birthDate;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  
  saveDb(db);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, birthDate: user.birthDate, phoneNumber: user.phoneNumber });
});`;

server = server.replace(getMeOld, getMeNew);
fs.writeFileSync('server.ts', server);
