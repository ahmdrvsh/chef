const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldBackend = `  const { content, rating } = req.body;
  const db = getDb();
  
  const userObj = db.users.find(u => u.id === req.user.id);
  const newComment: Comment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    userName: userObj ? userObj.name : (req.user.name || 'کاربر ناشناس'),`;

const newBackend = `  const { content, rating, userName } = req.body;
  const db = getDb();
  
  const userObj = db.users.find(u => u.id === req.user.id);
  const newComment: Comment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    userName: userObj ? userObj.name : (req.user.name || userName || 'کاربر ناشناس'),`;

code = code.replace(oldBackend, newBackend);
fs.writeFileSync('server.ts', code);
