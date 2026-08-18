const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(
  "setImageUrl('');\n    setEditingId(null);",
  "setImageUrl('');\n    setImageUrls(['', '', '']);\n    setVideoUrl('');\n    setEditingId(null);"
);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Patched resetForm');
