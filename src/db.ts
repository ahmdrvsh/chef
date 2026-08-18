import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { getAuthToken } from './context/AuthContext';
import { getIngredientCaloriesPer100g } from './utils/calorieCalculator';
import {
  Ingredient,
  IngredientConversion,
  Recipe,
  RecipeComment,
  RecipeRating,
  FridgeItem,
  MealPlanDay,
  ShoppingItem,
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_FRIDGE,
  INITIAL_MEAL_PLAN
} from './data/initialData';

// Local storage keys for instant client-side offline / host compatibility
const LS_INGREDIENTS = 'sofreh_ingredients_v2';
const LS_RECIPES = 'sofreh_recipes_v2';
const LS_FRIDGE = 'sofreh_fridge_v2';
const LS_MEAL_PLAN = 'sofreh_meal_plan_v2';
const LS_SHOPPING = 'sofreh_shopping_v2';
const LS_PENDING_SHOPPING_SYNC = 'sofreh_pending_shopping_sync_v1';
const LS_PENDING_FRIDGE_SYNC = 'sofreh_pending_fridge_sync_v1';

export const EMPTY_MEAL_PLAN: MealPlanDay[] = [
  { day: 'شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'یکشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'دوشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'سه‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'چهارشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'پنج‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
  { day: 'جمعه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] }
];

export function getCurrentUserId(): string {
  try {
    const val = localStorage.getItem('sofreh_auth_user_v4');
    if (val) {
      const parsed = JSON.parse(val);
      if (parsed && parsed.id) return parsed.id;
    }
  } catch {
    // fallback
  }
  return 'guest';
}

function getUserLS<T>(baseKey: string, fallback: T): T {
  const userId = getCurrentUserId();
  const userKey = `${baseKey}_${userId}`;
  try {
    const val = localStorage.getItem(userKey);
    if (!val || val === 'null' || val === 'undefined') {
      if (userId === 'u_admin' || userId === 'u_user1') {
        return fallback;
      }
      if (baseKey === LS_MEAL_PLAN) {
        return EMPTY_MEAL_PLAN as unknown as T;
      }
      if (baseKey === LS_FRIDGE) {
        return fallback;
      }
      return (Array.isArray(fallback) ? [] : fallback) as T;
    }
    const parsed = JSON.parse(val);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    return (userId === 'u_admin' || userId === 'u_user1') ? fallback : ((Array.isArray(fallback) ? [] : fallback) as T);
  }
}

function setUserLS<T>(baseKey: string, value: T): void {
  const userId = getCurrentUserId();
  const userKey = `${baseKey}_${userId}`;
  try {
    localStorage.setItem(userKey, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Helper to get local state with fallback
function getLS<T>(key: string, fallback: T): T {
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
  } catch {
    return fallback;
  }
}

function setLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
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


// ================= INGREDIENTS =================
export async function fetchIngredients(): Promise<Ingredient[]> {
  let list: Ingredient[] = [];
  try {
    const res = await fetch('/api/ingredients');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        list = data;
      }
    }
  } catch (e) {
    console.log('API offline, using local ingredients store');
  }

  if (list.length === 0) {
    list = await getIDB<Ingredient[]>(LS_INGREDIENTS, INITIAL_INGREDIENTS);
  }

  // Deduplicate by name and ensure unique IDs and merge initial definitions
  const initialMap = new Map<string, Ingredient>();
  INITIAL_INGREDIENTS.forEach(ing => {
    if (ing && ing.name) initialMap.set(ing.name.trim(), ing);
  });

  const nameMap = new Map<string, Ingredient>();
  list.forEach(ing => {
    if (ing && ing.name) {
      const initIng = initialMap.get(ing.name.trim());
      const allowedUnits = (ing.allowedUnits && ing.allowedUnits.length > 0) ? ing.allowedUnits : initIng?.allowedUnits;
      const conversions = (ing.conversions && ing.conversions.length > 0) ? ing.conversions : initIng?.conversions;
      nameMap.set(ing.name.trim(), {
        ...initIng,
        ...ing,
        allowedUnits,
        conversions
      });
    }
  });
  initialMap.forEach((ing, name) => {
    if (!nameMap.has(name)) {
      nameMap.set(name, ing);
    }
  });

  const uniqueList: Ingredient[] = [];
  const usedIds = new Set<string>();
  let counter = 1000;

  Array.from(nameMap.values()).forEach(ing => {
    let finalId = ing.id;
    if (!finalId || usedIds.has(finalId)) {
      finalId = `ing_${counter++}`;
    }
    usedIds.add(finalId);
    const cal = (typeof ing.caloriesPer100g === 'number' && ing.caloriesPer100g > 0 && ing.caloriesPer100g !== 150)
      ? ing.caloriesPer100g
      : getIngredientCaloriesPer100g(ing.name, ing.category, ing);
    uniqueList.push({ ...ing, id: finalId, caloriesPer100g: cal });
  });

  await setIDB(LS_INGREDIENTS, uniqueList);
  return uniqueList;
}

export async function addIngredient(name: string, category: string, defaultUnit: string, conversions?: IngredientConversion[], caloriesPer100g: number = 150): Promise<Ingredient> {
  const newIng: Ingredient = {
    id: 'ing_' + Date.now(),
    name: name.trim(),
    category: category || 'سایـر',
    defaultUnit: defaultUnit || 'عدد',
    conversions: conversions || [],
    caloriesPer100g: caloriesPer100g || 150
  };

  try {
    const res = await fetch('/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIng)
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    console.log('API save failed, saving locally');
  }

  const current = await getIDB<Ingredient[]>(LS_INGREDIENTS, INITIAL_INGREDIENTS);
  if (!current.some(i => i.name === newIng.name)) {
    current.push(newIng);
    await setIDB(LS_INGREDIENTS, current);
  }
  return newIng;
}

// ================= RECIPES =================
export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const res = await fetch('/api/recipes?all=true');
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json; // Handle both old and new formats
      if (Array.isArray(data) && data.length > 0) {
        await setIDB(LS_RECIPES, data);
        return data;
      }
    }
  } catch (e) {
    console.log('API offline, using local recipes store');
  }
  const local = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const localIds = new Set(local.map(r => r.id));
  let updated = [...local];
  let changed = false;
  INITIAL_RECIPES.forEach(r => {
    if (!localIds.has(r.id)) {
      updated.push(r);
      changed = true;
    }
  });
  if (changed) await setIDB(LS_RECIPES, updated);
  return updated;
}

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const newR: Recipe = {
    ...recipe,
    id: 'r_' + Date.now(),
    status: recipe.status || 'published',
    submittedAt: recipe.submittedAt || new Date().toISOString().split('T')[0]
  };

  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newR)
    });
    if (res.ok) {
      const saved = await res.json();
      const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
      current.unshift(saved);
      await setIDB(LS_RECIPES, current);
      window.dispatchEvent(new Event('sofreh_recipes_updated'));
      return saved;
    }
  } catch (e) {
    console.log('API save failed, saving recipe locally');
  }

  const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  current.unshift(newR);
  await setIDB(LS_RECIPES, current);
  window.dispatchEvent(new Event('sofreh_recipes_updated'));
  return newR;
}

export async function deleteRecipe(id: string): Promise<Recipe[]> {
  const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const updated = current.filter(r => r.id !== id);
  await setIDB(LS_RECIPES, updated);
  try {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
  } catch (e) {
    // local deleted
  }
  window.dispatchEvent(new Event('sofreh_recipes_updated'));
  return updated;
}

export async function updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<Recipe[]> {
  const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const updated = current.map(r => r.id === id ? { ...r, ...recipeData } : r);
  await setIDB(LS_RECIPES, updated);
  try {
    await fetch(`/api/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeData)
    });
  } catch (e) {
    // local updated
  }
  window.dispatchEvent(new Event('sofreh_recipes_updated'));
  return updated;
}

export function getRecipeEffectiveRating(recipe: Recipe): number {
  if (recipe.useAdminRating && typeof recipe.customAdminRating === 'number') {
    return Math.round(recipe.customAdminRating * 10) / 10;
  }
  if (recipe.ratings && recipe.ratings.length > 0) {
    const sum = recipe.ratings.reduce((acc, r) => acc + r.score, 0);
    const avg = sum / recipe.ratings.length;
    return Math.round(avg * 10) / 10;
  }
  return recipe.rating || 5.0;
}

export async function addRecipeComment(
  recipeId: string,
  text: string,
  user: { id: string; name: string }
): Promise<{ success: boolean; message?: string; recipes?: Recipe[] }> {
  const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const recipe = current.find(r => r.id === recipeId);
  if (!recipe) return { success: false, message: 'دستور پخت یافت نشد' };

  const comments = recipe.comments || [];
  
  // Check max 5 comments rule per user
  const userCommentCount = comments.filter(c => c.userId === user.id).length;
  if (userCommentCount >= 5) {
    return {
      success: false,
      message: 'شما حداکثر (۵ نظر) برای این دستور پخت ثبت کرده‌اید.'
    };
  }

  const newComment: RecipeComment = {
    id: 'c_' + Date.now(),
    userId: user.id,
    userName: user.name || 'کاربر مهمان',
    text: text.trim(),
    createdAt: new Date().toLocaleDateString('fa-IR')
  };

  const updatedComments = [...comments, newComment];
  const updated = await updateRecipe(recipeId, { comments: updatedComments });
  return { success: true, recipes: updated };
}

export async function rateRecipe(
  recipeId: string,
  score: number,
  user: { id: string; name?: string }
): Promise<{ success: boolean; recipes?: Recipe[] }> {
  const current = await getIDB<Recipe[]>(LS_RECIPES, INITIAL_RECIPES);
  const recipe = current.find(r => r.id === recipeId);
  if (!recipe) return { success: false };

  const ratings = recipe.ratings || [];
  
  // Update existing rating if user already rated, or append new rating
  const existingIndex = ratings.findIndex(r => r.userId === user.id);
  let updatedRatings: RecipeRating[];

  if (existingIndex > -1) {
    updatedRatings = [...ratings];
    updatedRatings[existingIndex] = {
      userId: user.id,
      userName: user.name || 'کاربر',
      score
    };
  } else {
    updatedRatings = [
      ...ratings,
      { userId: user.id, userName: user.name || 'کاربر', score }
    ];
  }

  const updated = await updateRecipe(recipeId, { ratings: updatedRatings });
  return { success: true, recipes: updated };
}

export async function updateIngredient(id: string, ingredientData: Partial<Ingredient>): Promise<Ingredient[]> {
  const current = await getIDB<Ingredient[]>(LS_INGREDIENTS, INITIAL_INGREDIENTS);
  const updated = current.map(i => i.id === id ? { ...i, ...ingredientData } : i);
  await setIDB(LS_INGREDIENTS, updated);
  try {
    await fetch(`/api/ingredients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredientData)
    });
  } catch (e) {
    // local updated
  }
  return updated;
}

export async function deleteIngredient(id: string): Promise<Ingredient[]> {
  const current = await getIDB<Ingredient[]>(LS_INGREDIENTS, INITIAL_INGREDIENTS);
  const updated = current.filter(i => i.id !== id);
  await setIDB(LS_INGREDIENTS, updated);
  try {
    await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
  } catch (e) {
    // local deleted
  }
  return updated;
}

// ================= FRIDGE =================
export async function fetchFridge(): Promise<FridgeItem[]> {
  try {
    const res = await fetch('/api/fridge', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserLS(LS_FRIDGE, data);
        return data;
      }
    }
  } catch (e) {
    console.log('API offline, using local fridge store');
  }
  return getUserLS<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE);
}

export async function addToFridge(item: Omit<FridgeItem, 'id'>): Promise<FridgeItem[]> {
  const current = getUserLS<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE);
  const existingIdx = current.findIndex(i => i.name.trim() === item.name.trim());
  let updated: FridgeItem[];

  if (existingIdx > -1) {
    const updatedItem = {
      ...current[existingIdx],
      quantity: Number(current[existingIdx].quantity) + Number(item.quantity),
      unit: item.unit || current[existingIdx].unit,
      category: item.category || current[existingIdx].category,
      location: item.location || current[existingIdx].location,
      expiryDate: item.expiryDate || current[existingIdx].expiryDate
    };
    const rest = current.filter((_, idx) => idx !== existingIdx);
    updated = [updatedItem, ...rest];
  } else {
    updated = [{ ...item, id: 'f_' + Date.now() }, ...current];
  }

  setUserLS(LS_FRIDGE, updated);

  try {
    await fetch('/api/fridge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(item)
    });
  } catch (e) {
    // local saved
  }

  return updated;
}

export async function deleteFromFridge(id: string): Promise<FridgeItem[]> {
  const current = getUserLS<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE);
  const updated = current.filter(i => i.id !== id);
  setUserLS(LS_FRIDGE, updated);

  try {
    await fetch(`/api/fridge/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
  } catch (e) {
    // local deleted
  }

  return updated;
}

export async function updateFridge(items: FridgeItem[]): Promise<FridgeItem[]> {
  setUserLS(LS_FRIDGE, items);
  try {
    const res = await fetch('/api/fridge/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getCurrentUserId(),
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ items })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (e) {
    // local saved
  }
  return items;
}

export async function updateFridgeItem(id: string, patch: Partial<FridgeItem>): Promise<FridgeItem[]> {
  const current = getUserLS<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE);
  const updated = current.map(item => (item && item.id === id ? { ...item, ...patch } : item));
  setUserLS(LS_FRIDGE, updated);

  try {
    await fetch(`/api/fridge/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getCurrentUserId(),
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(patch)
    });
  } catch (e) {
    // local updated
  }

  return updated;
}

// ================= MEAL PLAN =================
export async function fetchMealPlan(): Promise<MealPlanDay[]> {
  try {
    const res = await fetch('/api/mealplan', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUserLS(LS_MEAL_PLAN, data);
        return data;
      }
    }
  } catch (e) {
    console.log('API offline, using local meal plan store');
  }
  return getUserLS<MealPlanDay[]>(LS_MEAL_PLAN, INITIAL_MEAL_PLAN);
}

export async function saveMealPlan(plan: MealPlanDay[]): Promise<void> {
  setUserLS(LS_MEAL_PLAN, plan);
  try {
    await fetch('/api/mealplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(plan)
    });
  } catch (e) {
    // local saved
  }
}

// ================= SHOPPING LIST =================
export async function fetchShoppingList(): Promise<ShoppingItem[]> {
  try {
    const res = await fetch('/api/shopping', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setUserLS(LS_SHOPPING, data);
      return data;
    }
  } catch (e) {
    console.log('API offline, using local shopping store');
  }
  return getUserLS<ShoppingItem[]>(LS_SHOPPING, []);
}

export async function saveShoppingList(items: ShoppingItem[]): Promise<void> {
  setUserLS(LS_SHOPPING, items);
  try {
    const res = await fetch('/api/shopping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(items)
    });
    if (res.ok) {
      setUserLS(LS_PENDING_SHOPPING_SYNC, false);
    } else {
      setUserLS(LS_PENDING_SHOPPING_SYNC, true);
    }
  } catch (e) {
    // Save failed due to offline state, set pending sync flag
    setUserLS(LS_PENDING_SHOPPING_SYNC, true);
  }
}

export async function syncPendingData(): Promise<void> {
  const pendingShopping = getUserLS<boolean>(LS_PENDING_SHOPPING_SYNC, false);
  if (pendingShopping) {
    const currentShopping = getUserLS<ShoppingItem[]>(LS_SHOPPING, []);
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getCurrentUserId()
        },
        body: JSON.stringify(currentShopping)
      });
      if (res.ok) {
        setUserLS(LS_PENDING_SHOPPING_SYNC, false);
        console.log('Successfully synced offline shopping list changes.');
      }
    } catch (e) {
      console.warn('Sync pending shopping list failed:', e);
    }
  }

  const pendingFridge = await getIDB<boolean>(LS_PENDING_FRIDGE_SYNC, false);
  if (pendingFridge) {
    const currentFridge = await getIDB<FridgeItem[]>(LS_FRIDGE, INITIAL_FRIDGE);
    try {
      // Re-save entire fridge array
      await setIDB(LS_PENDING_FRIDGE_SYNC, false);
    } catch (e) {
      console.warn('Sync pending fridge failed:', e);
    }
  }
}

export interface ChefSettings {
  name: string;
  title: string;
  message: string;
  image: string;
  instagram: string;
  bio?: string;
}

export const DEFAULT_CHEF_SETTINGS: ChefSettings = {
  name: 'محیا',
  title: 'سرآشپز سفره',
  message: 'من محیا هستم و میخوام تو آشپزی بهتون کمک کنم.',
  image: '/mahya.jpg',
  instagram: 'maahyas.homechef',
  bio: 'سفره بر اساس موادی که در یخچال خانه دارید، بهترین دستورات پخت اصیل و خوش‌طعم را پیشنهاد می‌دهد.'
};

const LS_CHEF_SETTINGS = 'sofreh_chef_settings_v1';

export function getChefSettings(): ChefSettings {
  return getLS<ChefSettings>(LS_CHEF_SETTINGS, DEFAULT_CHEF_SETTINGS);
}

export async function fetchChefSettings(): Promise<ChefSettings> {
  try {
    const res = await fetch('/api/chef-settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        setLS(LS_CHEF_SETTINGS, data);
        return data;
      }
    }
  } catch (e) {
    console.log('API offline, using local chef settings store');
  }
  return getLS<ChefSettings>(LS_CHEF_SETTINGS, DEFAULT_CHEF_SETTINGS);
}

export async function saveChefSettings(settings: ChefSettings): Promise<ChefSettings> {
  setLS(LS_CHEF_SETTINGS, settings);
  try {
    const res = await fetch('/api/chef-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) {
      const saved = await res.json();
      setLS(LS_CHEF_SETTINGS, saved);
      return saved;
    }
  } catch (e) {
    console.warn('API save chef settings failed:', e);
  }
  return settings;
}

// ================= ANALYTICS & USER HISTORY =================
export interface ShoppingHistoryLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  itemName: string;
  category?: string;
  quantity?: string;
  unit?: string;
  action: 'added' | 'purchased' | 'cleared' | 'synced';
  timestamp: string;
  dateStr: string;
}

export interface MealPlanHistoryLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  dayName: string;
  mealType: string;
  recipeId: string;
  recipeTitle: string;
  category?: string;
  action: 'selected' | 'removed' | 'auto_generated' | 'plan_cleared';
  timestamp: string;
  dateStr: string;
}

const LS_SHOPPING_HISTORY = 'sofreh_shopping_history_logs_v1';
const LS_MEAL_HISTORY = 'sofreh_meal_history_logs_v1';

export async function logShoppingHistory(data: {
  itemName: string;
  category?: string;
  quantity?: string;
  unit?: string;
  action: 'added' | 'purchased' | 'cleared' | 'synced';
}): Promise<void> {
  const userId = getCurrentUserId();
  const localLogs = getUserLS<ShoppingHistoryLog[]>(LS_SHOPPING_HISTORY, []);
  const newEntry: ShoppingHistoryLog = {
    id: 'sh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    itemName: data.itemName,
    category: data.category || 'سایر',
    quantity: data.quantity || '1',
    unit: data.unit || 'عدد',
    action: data.action,
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('fa-IR')
  };

  localLogs.unshift(newEntry);
  setUserLS(LS_SHOPPING_HISTORY, localLogs.slice(0, 500));

  try {
    await fetch('/api/analytics/shopping-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    // local logged
  }
}

export async function logMealHistory(data: {
  dayName: string;
  mealType: string;
  recipeId: string;
  recipeTitle: string;
  category?: string;
  action: 'selected' | 'removed' | 'auto_generated' | 'plan_cleared';
}): Promise<void> {
  const userId = getCurrentUserId();
  const localLogs = getUserLS<MealPlanHistoryLog[]>(LS_MEAL_HISTORY, []);
  const newEntry: MealPlanHistoryLog = {
    id: 'mh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    dayName: data.dayName,
    mealType: data.mealType,
    recipeId: data.recipeId,
    recipeTitle: data.recipeTitle,
    category: data.category || '',
    action: data.action,
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('fa-IR')
  };

  localLogs.unshift(newEntry);
  setUserLS(LS_MEAL_HISTORY, localLogs.slice(0, 500));

  try {
    await fetch('/api/analytics/meal-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    // local logged
  }
}

export async function fetchUserShoppingHistory(userId?: string): Promise<ShoppingHistoryLog[]> {
  const targetUserId = userId || getCurrentUserId();
  try {
    const url = targetUserId && targetUserId !== 'guest' ? `/api/analytics/shopping-history?userId=${encodeURIComponent(targetUserId)}` : '/api/analytics/shopping-history';
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (res.ok) {
      const logs = await res.json();
      if (Array.isArray(logs)) {
        setUserLS(LS_SHOPPING_HISTORY, logs);
        return logs;
      }
    }
  } catch (e) {
    // offline
  }
  return getUserLS<ShoppingHistoryLog[]>(LS_SHOPPING_HISTORY, []);
}

export async function fetchUserMealHistory(userId?: string): Promise<MealPlanHistoryLog[]> {
  const targetUserId = userId || getCurrentUserId();
  try {
    const url = targetUserId && targetUserId !== 'guest' ? `/api/analytics/meal-history?userId=${encodeURIComponent(targetUserId)}` : '/api/analytics/meal-history';
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (res.ok) {
      const logs = await res.json();
      if (Array.isArray(logs)) {
        setUserLS(LS_MEAL_HISTORY, logs);
        return logs;
      }
    }
  } catch (e) {
    // offline
  }
  return getUserLS<MealPlanHistoryLog[]>(LS_MEAL_HISTORY, []);
}

export async function fetchAnalyticsSummary(): Promise<any> {
  try {
    const res = await fetch('/api/analytics/summary');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // offline
  }
  return null;
}



export interface PaginatedRecipes {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchRecipesPaginated(page: number = 1, limit: number = 20): Promise<PaginatedRecipes> {
  try {
    const res = await fetch(`/api/recipes?page=${page}&limit=${limit}`);
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
