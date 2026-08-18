const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const adminCommentsOld = `app.get('/api/admin/comments', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const comments = db.comments.map(c => {`;
  
const adminCommentsNew = `app.get('/api/admin/comments', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const comments = db.comments.filter(c => c.content && c.content.trim() !== '').map(c => {`;
server = server.replace(adminCommentsOld, adminCommentsNew);

fs.writeFileSync('server.ts', server);
