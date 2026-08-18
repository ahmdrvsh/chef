const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Modify jwt.sign in register and login to include name
server = server.replace(
  /jwt\.sign\(\{ id: newUser\.id, role: newUser\.role \}, JWT_SECRET\)/g,
  "jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET)"
);
server = server.replace(
  /jwt\.sign\(\{ id: user\.id, role: user\.role \}, JWT_SECRET\)/g,
  "jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET)"
);

// Modify POST comment
const postCommentOld = `    const newComment: Comment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    content,
    rating,
    createdAt: new Date().toISOString()
  };`;
const postCommentNew = `    const userObj = db.users.find(u => u.id === req.user.id);
    const newComment = {
    id: Date.now().toString(),
    recipeId: req.params.id,
    userId: req.user.id,
    userName: userObj ? userObj.name : (req.user.name || 'کاربر ناشناس'),
    content,
    rating,
    createdAt: new Date().toISOString()
  };`;
server = server.replace(postCommentOld, postCommentNew);

// Modify GET comment to just use c.userName if it exists
const getCommentsOld = `  // Attach user names
  const commentsWithUsers = comments.map(c => {
    const u = db.users.find(u => u.id === c.userId);
    return { ...c, userName: u ? u.name : 'کاربر ناشناس' };
  });
  
  res.json(commentsWithUsers);`;
const getCommentsNew = `  // Attach user names
  const commentsWithUsers = comments.map(c => {
    const u = db.users.find(u => u.id === c.userId);
    return { ...c, userName: c.userName || (u ? u.name : 'کاربر ناشناس') };
  });
  
  res.json(commentsWithUsers);`;
server = server.replace(getCommentsOld, getCommentsNew);

// Fix Admin GET Comments too
const adminGetOld = `    return {
      ...c,
      userName: user ? user.name : 'کاربر ناشناس',
      recipeTitle: recipe ? recipe.title : 'غذای حذف شده'
    };`;
const adminGetNew = `    return {
      ...c,
      userName: c.userName || (user ? user.name : 'کاربر ناشناس'),
      recipeTitle: recipe ? recipe.title : 'غذای حذف شده'
    };`;
server = server.replace(adminGetOld, adminGetNew);

fs.writeFileSync('server.ts', server);

// Update db.ts interface Comment
let dbts = fs.readFileSync('src/db.ts', 'utf8');
dbts = dbts.replace(
  `  adminReply?: string;\n}`,
  `  adminReply?: string;\n  userName?: string;\n}`
);
fs.writeFileSync('src/db.ts', dbts);
