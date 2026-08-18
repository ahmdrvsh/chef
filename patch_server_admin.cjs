const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
// Admin: Get Users
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  // Don't send password hashes
  const users = db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
  res.json(users);
});

// Admin: Get Comments
app.get('/api/admin/comments', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const comments = db.comments.map(c => {
    const user = db.users.find(u => u.id === c.userId);
    const recipe = db.recipes.find(r => r.id === c.recipeId);
    return {
      ...c,
      userName: user ? user.name : 'کاربر ناشناس',
      recipeTitle: recipe ? recipe.title : 'غذای حذف شده'
    };
  }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(comments);
});

// Admin: Delete Comment
app.delete('/api/admin/comments/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.comments = db.comments.filter(c => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Admin: Reply Comment
app.post('/api/admin/comments/:id/reply', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const comment = db.comments.find(c => c.id === req.params.id);
  if (comment) {
    comment.adminReply = req.body.reply;
    saveDb(db);
    res.json({ success: true, comment });
  } else {
    res.status(404).json({ error: 'Comment not found' });
  }
});

// --- Vite Middleware ---`;

content = content.replace('// --- Vite Middleware ---', newEndpoints);

fs.writeFileSync('server.ts', content);
console.log('Patched server.ts');
