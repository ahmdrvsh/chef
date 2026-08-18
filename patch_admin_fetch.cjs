const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldFetch = `    // Fetch comments
    fetch('/api/admin/comments', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllComments(data));
  };`;

const newFetch = `    // Fetch comments
    fetch('/api/admin/comments', { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json()).then(data => setAllComments(data));
      
    // Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAdminSettings(data);
        }
      });
  };`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/Admin.tsx', code);
