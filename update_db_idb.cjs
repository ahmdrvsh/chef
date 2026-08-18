const fs = require('fs');

let db = fs.readFileSync('src/db.ts', 'utf8');

// Add import
if (!db.includes('idb-keyval')) {
  db = "import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';\n" + db;
}

// Replace getLS for large data with async version
db = db.replace(
`function getLS<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val || val === 'null' || val === 'undefined') return fallback;
    const parsed = JSON.parse(val);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      if (parsed.length === 0 && fallback.length > 0) return fallback;
    }
    return parsed as T;
  } catch (e) {
    return fallback;
  }
}`,
`function getLS<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val || val === 'null' || val === 'undefined') return fallback;
    const parsed = JSON.parse(val);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      if (parsed.length === 0 && fallback.length > 0) return fallback;
    }
    return parsed as T;
  } catch (e) {
    return fallback;
  }
}

async function getIDB<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await idbGet(key);
    if (val === undefined) return fallback;
    if (Array.isArray(fallback) && Array.isArray(val) && val.length === 0 && fallback.length > 0) {
      return fallback;
    }
    return val as T;
  } catch (e) {
    return fallback;
  }
}

async function setIDB<T>(key: string, value: T): Promise<void> {
  try {
    await idbSet(key, value);
  } catch (e) {}
}
`
);

// Now change usages in fetchIngredients, etc.

db = db.replace(/getLS<Ingredient\[\]>\(LS_INGREDIENTS, INITIAL_INGREDIENTS\)/g, 'await getIDB<Ingredient[]>(LS_INGREDIENTS, INITIAL_INGREDIENTS)');
db = db.replace(/setLS\(LS_INGREDIENTS, ([^)]+)\)/g, 'await setIDB(LS_INGREDIENTS, $1)');

db = db.replace(/getLS<Recipe\[\]>\(LS_RECIPES, INITIAL_RECIPES\)/g, 'await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES)');
db = db.replace(/setLS\(LS_RECIPES, ([^)]+)\)/g, 'await setIDB(LS_RECIPES, $1)');

db = db.replace(/getLS<FridgeItem\[\]>\(LS_FRIDGE, INITIAL_FRIDGE\)/g, 'await getIDB<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE)');
db = db.replace(/setLS\(LS_FRIDGE, ([^)]+)\)/g, 'await setIDB(LS_FRIDGE, $1)');

db = db.replace(/getLS<boolean>\(LS_PENDING_FRIDGE_SYNC, false\)/g, 'await getIDB<boolean>(LS_PENDING_FRIDGE_SYNC, false)');
db = db.replace(/setLS\(LS_PENDING_FRIDGE_SYNC, ([^)]+)\)/g, 'await setIDB(LS_PENDING_FRIDGE_SYNC, $1)');

// The sync user functions stay using localStorage
// getChefSettings stays using localStorage

fs.writeFileSync('src/db.ts', db);
console.log('db.ts updated for IndexedDB!');
