const fs = require('fs');
let db = fs.readFileSync('src/db.ts', 'utf8');

// Update fetchRecipes to use ?all=true
db = db.replace(/fetch\('\/api\/recipes'\)/, "fetch('/api/recipes?all=true')");

// We need to unwrap the response if data has .data (as per our server changes)
const oldResOk = `    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        await setIDB(LS_RECIPES, data);
        return data;
      }
    }`;

const newResOk = `    if (res.ok) {
      const json = await res.json();
      const data = json.data || json; // Handle both old and new formats
      if (Array.isArray(data) && data.length > 0) {
        await setIDB(LS_RECIPES, data);
        return data;
      }
    }`;

db = db.replace(oldResOk, newResOk);

// Add fetchRecipesPaginated function
const newFunc = `
export interface PaginatedRecipes {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchRecipesPaginated(page: number = 1, limit: number = 20): Promise<PaginatedRecipes> {
  try {
    const res = await fetch(\`/api/recipes?page=\${page}&limit=\${limit}\`);
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (e) {
    console.log('API offline for pagination');
  }
  // Fallback to local
  const local = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    data: local.slice(startIndex, endIndex),
    total: local.length,
    page,
    limit,
    hasMore: endIndex < local.length
  };
}
`;

db += newFunc;

fs.writeFileSync('src/db.ts', db);
console.log('db.ts patched with fetchRecipesPaginated');
