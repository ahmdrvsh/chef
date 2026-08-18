const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Update GET /api/recipes to handle pagination
// Replace:
/*
  app.get('/api/recipes', (req, res) => {
    res.json(recipesData);
  });
*/

const oldRoute = `app.get('/api/recipes', (req, res) => {
    res.json(recipesData);
  });`;

const newRoute = `app.get('/api/recipes', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Check if client explicitly wants all (for backwards compat, though ideally we paginate everything)
    if (req.query.all === 'true') {
      return res.json({
        data: recipesData,
        total: recipesData.length,
        page: 1,
        limit: recipesData.length,
        hasMore: false
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedRecipes = recipesData.slice(startIndex, endIndex);
    
    res.json({
      data: paginatedRecipes,
      total: recipesData.length,
      page,
      limit,
      hasMore: endIndex < recipesData.length
    });
  });`;

if (server.includes('res.json(recipesData);')) {
  server = server.replace(oldRoute, newRoute);
  
  // Actually, some places might just be returning the array. If the route looks slightly different:
  server = server.replace(/app\.get\('\/api\/recipes', \(req, res\) => \{\s+res\.json\(recipesData\);\s+\}\);/, newRoute);
}

fs.writeFileSync('server.ts', server);
console.log('Server patched for pagination');
