const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const rateEndpoint = `
// Recipes: Rate
app.post('/api/recipes/:id/rate', authenticateToken, (req: any, res: any) => {
  const { rating } = req.body;
  const db = getDb();
  
  // check if this user already rated, we update their rating
  let existing = db.comments.find(c => c.recipeId === req.params.id && c.userId === req.user.id && (!c.content || c.content === ''));
  if (existing) {
     existing.rating = rating;
  } else {
     const userObj = db.users.find(u => u.id === req.user.id);
     db.comments.push({
       id: Date.now().toString(),
       recipeId: req.params.id,
       userId: req.user.id,
       userName: userObj ? userObj.name : (req.user.name || 'کاربر ناشناس'),
       content: '',
       rating,
       createdAt: new Date().toISOString()
     });
  }
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/recipes/:id/comments'`;
server = server.replace(`app.post('/api/recipes/:id/comments'`, rateEndpoint);

const getCommentsOld = `app.get('/api/recipes/:id/comments', (req, res) => {
  const db = getDb();
  const comments = db.comments.filter(c => c.recipeId === req.params.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());`;

const getCommentsNew = `app.get('/api/recipes/:id/comments', (req, res) => {
  const db = getDb();
  const comments = db.comments
    .filter(c => c.recipeId === req.params.id && c.content && c.content.trim() !== '') // only show actual comments
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());`;
server = server.replace(getCommentsOld, getCommentsNew);

// Also fix the userName in GET comments
const attachUsersOld = `  const commentsWithUsers = comments.map(c => {
    const u = db.users.find(u => u.id === c.userId);
    return { ...c, userName: c.userName || (u ? u.name : 'کاربر ناشناس') };
  });`;

const attachUsersNew = `  const commentsWithUsers = comments.map(c => {
    const u = db.users.find(u => u.id === c.userId);
    // Prefer user db name, fallback to c.userName, then 'کاربر ناشناس'
    const finalName = u ? u.name : (c.userName || 'کاربر ناشناس');
    return { ...c, userName: finalName };
  });`;
server = server.replace(attachUsersOld, attachUsersNew);

fs.writeFileSync('server.ts', server);
