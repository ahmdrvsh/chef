import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_FRIDGE,
  INITIAL_MEAL_PLAN,
  Ingredient,
  Recipe,
  FridgeItem,
  MealPlanDay
} from './src/data/initialData';

const JWT_SECRET = process.env.JWT_SECRET;

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : (import.meta?.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

async function startServer() {
  if (!JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET environment variable is missing. Server refuses to start.');
    process.exit(1);
  }

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  let reqSeq = 0;
  app.use((req, res, next) => {
    reqSeq++;
    const reqId = reqSeq;
    const startTime = Date.now();
    console.log(`[HTTP] pid=${process.pid} id=${reqId} method=${req.method} path=${req.path} usersCount=${usersData.length}`);
    res.on('finish', () => {
      if (req.path.startsWith('/api/users') || req.path.startsWith('/api/auth')) {
        console.log(`[HTTP-AUTH] pid=${process.pid} id=${reqId} method=${req.method} path=${req.path} status=${res.statusCode} usersCount=${usersData.length} durationMs=${Date.now() - startTime}`);
      }
    });
    next();
  });

  // In-Memory DB initialized with comprehensive defaults
  let ingredientsData: Ingredient[] = [...INITIAL_INGREDIENTS];
  let recipesData: Recipe[] = [...INITIAL_RECIPES];

  const EMPTY_SERVER_MEAL_PLAN: MealPlanDay[] = [
    { day: 'شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'یکشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'دوشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'سه‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'چهارشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'پنج‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
    { day: 'جمعه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] }
  ];

  let userFridgeMap: Record<string, FridgeItem[]> = {
    u_admin: [...INITIAL_FRIDGE],
    u_user1: [...INITIAL_FRIDGE]
  };
  let userMealPlanMap: Record<string, MealPlanDay[]> = {
    u_admin: [...INITIAL_MEAL_PLAN],
    u_user1: [...INITIAL_MEAL_PLAN]
  };
  let userShoppingListMap: Record<string, any[]> = {
    u_admin: [],
    u_user1: []
  };

  // Initial users matching AuthContext INITIAL_USERS
  let usersData: any[] = [
    {
      id: 'u_admin',
      name: 'مدیر ارشد سفره',
      email: 'admin@sofreh.ir',
      phone: '09121111111',
      registeredPhone: '09121111111',
      registeredEmail: 'admin@sofreh.ir',
      password: 'admin',
      isAdmin: true,
      createdAt: '2026-01-01'
    },
    {
      id: 'u_user1',
      name: 'مریم احمدی',
      email: 'maryam@sofreh.ir',
      phone: '09123456789',
      registeredPhone: '09123456789',
      registeredEmail: 'maryam@sofreh.ir',
      password: '123456',
      isAdmin: false,
      createdAt: '2026-01-01'
    }
  ];

  // Hash plain text passwords if any exist on startup
  usersData.forEach(u => {
    if (u.password && !u.password.startsWith('$2')) {
      u.password = bcrypt.hashSync(u.password, 10);
    }
  });

  // Authentication Middleware (JWT verification)
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'توکن احراز هویت یافت نشد' });
    }
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'توکن احراز هویت نامعتبر یا منقضی شده است' });
      }
      req.user = decoded;
      next();
    });
  }

  // Authorization Middleware (RBAC: Admin check)
  function requireAdmin(req: any, res: any, next: any) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز. فقط مدیران سیستم مجاز به انجام این عملیات هستند.' });
    }
    next();
  }

  function getReqUserId(req: any): string {
    return req.user?.id || '';
  }

  function getUserFridge(userId: string): FridgeItem[] {
    if (!userFridgeMap[userId]) {
      userFridgeMap[userId] = (userId === 'u_admin' || userId === 'u_user1')
        ? [...INITIAL_FRIDGE]
        : [];
    }
    return userFridgeMap[userId];
  }

  function getUserMealPlan(userId: string): MealPlanDay[] {
    if (!userMealPlanMap[userId]) {
      userMealPlanMap[userId] = (userId === 'u_admin' || userId === 'u_user1')
        ? [...INITIAL_MEAL_PLAN]
        : JSON.parse(JSON.stringify(EMPTY_SERVER_MEAL_PLAN));
    }
    return userMealPlanMap[userId];
  }

  function getUserShopping(userId: string): any[] {
    if (!userShoppingListMap[userId]) {
      userShoppingListMap[userId] = [];
    }
    return userShoppingListMap[userId];
  }

  let chefSettingsData: any = {
    name: 'سفره',
    title: 'دستیار هوشمند آشپزی',
    message: 'دستیار هوشمند آشپزی سفره آماده همراهی و راهنمایی شما در انتخاب و پخت غذا است.',
    image: '/logo.png',
    instagram: 'sofreh.app',
    bio: 'سفره بر اساس موادی که در یخچال خانه دارید، بهترین دستورات پخت اصیل و خوش‌طعم را پیشنهاد می‌دهد.'
  };

  let shoppingAnalyticsHistory: any[] = [];
  let mealPlanAnalyticsHistory: any[] = [];

  function getUsersFingerprint(): string {
    const sorted = [...usersData].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    const idsAndEmails = sorted.map(u => `${u.id}:${u.email || u.phone || u.name}`);
    return `${usersData.length}_[${idsAndEmails.join(',')}]`;
  }

  // Try loading persisted data if available
  const DATA_FILE = path.join(process.cwd(), 'data_store.json');

  function syncUsersFromDisk(): any[] {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          usersData = parsed.users;
          let changed = false;
          usersData.forEach(u => {
            if (u.password && !u.password.startsWith('$2')) {
              u.password = bcrypt.hashSync(u.password, 10);
              changed = true;
            }
          });
          if (changed) {
            saveData();
          }
          console.log(`[DATA-LOAD] pid=${process.pid} path=${DATA_FILE} usersCount=${usersData.length}`);
        }
      }
    } catch (e: any) {
      console.error(`[DATA-LOAD] pid=${process.pid} path=${DATA_FILE} error=${e?.message}`);
    }
    return usersData;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.ingredients && parsed.ingredients.length > 0) ingredientsData = parsed.ingredients;
      if (parsed.recipes && parsed.recipes.length > 0) recipesData = parsed.recipes;
      if (parsed.userFridgeMap) userFridgeMap = parsed.userFridgeMap;
      if (parsed.userMealPlanMap) userMealPlanMap = parsed.userMealPlanMap;
      if (parsed.userShoppingListMap) userShoppingListMap = parsed.userShoppingListMap;
      if (parsed.chefSettings) chefSettingsData = parsed.chefSettings;
      if (parsed.users && parsed.users.length > 0) usersData = parsed.users;
      if (Array.isArray(parsed.shoppingAnalyticsHistory)) shoppingAnalyticsHistory = parsed.shoppingAnalyticsHistory;
      if (Array.isArray(parsed.mealPlanAnalyticsHistory)) mealPlanAnalyticsHistory = parsed.mealPlanAnalyticsHistory;
      console.log(`[DATA-LOAD] pid=${process.pid} path=${DATA_FILE} usersCount=${usersData.length}`);
    } else {
      console.log(`[DATA-LOAD] pid=${process.pid} path=${DATA_FILE} does not exist yet. Using initial default users (${usersData.length})`);
    }
  } catch (e: any) {
    console.log(`[DATA-LOAD] pid=${process.pid} error loading ${DATA_FILE}: ${e?.message}`);
  }
  console.log(`[FORENSIC-USERS-STATE] context=startup, count=${usersData.length}, fingerprint=${getUsersFingerprint()}`);

  // Deduplicate ingredientsData by name and guarantee unique IDs
  const nameMap = new Map<string, Ingredient>();
  ingredientsData.forEach(ing => {
    if (ing && ing.name) nameMap.set(ing.name.trim(), ing);
  });
  INITIAL_INGREDIENTS.forEach(ing => {
    if (!nameMap.has(ing.name.trim())) {
      nameMap.set(ing.name.trim(), ing);
    }
  });

  const uniqueIngredients: Ingredient[] = [];
  const usedIds = new Set<string>();
  let nextIdCounter = 1000;

  Array.from(nameMap.values()).forEach(ing => {
    let finalId = ing.id;
    if (!finalId || usedIds.has(finalId)) {
      finalId = `ing_${nextIdCounter++}`;
    }
    usedIds.add(finalId);
    uniqueIngredients.push({ ...ing, id: finalId });
  });

  ingredientsData = uniqueIngredients;

  // Deduplicate and ensure all INITIAL_RECIPES are in recipesData
  const recipeMap = new Map<string, Recipe>();
  recipesData.forEach(r => { if (r && r.id) recipeMap.set(r.id, r); });
  INITIAL_RECIPES.forEach(r => {
    if (!recipeMap.has(r.id)) {
      recipeMap.set(r.id, r);
    }
  });
  recipesData = Array.from(recipeMap.values());

  function saveData() {
    try {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({
          ingredients: ingredientsData,
          recipes: recipesData,
          userFridgeMap,
          userMealPlanMap,
          userShoppingListMap,
          chefSettings: chefSettingsData,
          users: usersData,
          shoppingAnalyticsHistory,
          mealPlanAnalyticsHistory
        })
      );
      console.log(`[DATA-SAVE] pid=${process.pid} path=${DATA_FILE} usersCount=${usersData.length} status=SUCCESS`);
    } catch (e: any) {
      console.error(`[DATA-SAVE] pid=${process.pid} path=${DATA_FILE} usersCount=${usersData.length} status=FAILURE error=${e?.message}`);
    }
  }

  // ================= API ENDPOINTS =================

  // 1. Ingredients
  app.get('/api/ingredients', (req, res) => {
    if (!ingredientsData || ingredientsData.length === 0) {
      ingredientsData = [...INITIAL_INGREDIENTS];
    }
    res.json(ingredientsData);
  });

  app.post('/api/ingredients', (req, res) => {
    const { name, category, defaultUnit } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'نام ماده اولیه الزامی است' });
    }
    const exists = ingredientsData.find(i => i.name.trim() === name.trim());
    if (exists) {
      return res.json(exists);
    }
    const newItem: Ingredient = {
      id: 'ing_' + Date.now(),
      name: name.trim(),
      category: category || 'سایـر',
      defaultUnit: defaultUnit || 'عدد'
    };
    ingredientsData.push(newItem);
    saveData();
    res.status(201).json(newItem);
  });

  app.put('/api/ingredients/:id', (req, res) => {
    const idx = ingredientsData.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      ingredientsData[idx] = { ...ingredientsData[idx], ...req.body };
      saveData();
      return res.json(ingredientsData[idx]);
    }
    res.status(404).json({ error: 'ماده اولیه یافت نشد' });
  });

  app.delete('/api/ingredients/:id', (req, res) => {
    ingredientsData = ingredientsData.filter(i => i.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // 2. Recipes
  app.get('/api/recipes', (req, res) => {
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
  });

  app.get('/api/recipes/:id', (req, res) => {
    const recipe = recipesData.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ error: 'دستور پخت یافت نشد' });
    res.json(recipe);
  });

  app.post('/api/recipes', (req, res) => {
    const newRecipe: Recipe = {
      ...req.body,
      id: 'r_' + Date.now(),
      rating: req.body.rating || 5.0,
      likes: req.body.likes || 0
    };
    recipesData.unshift(newRecipe);
    saveData();
    res.status(201).json(newRecipe);
  });

  app.put('/api/recipes/:id', (req, res) => {
    const idx = recipesData.findIndex(r => r.id === req.params.id);
    if (idx !== -1) {
      recipesData[idx] = { ...recipesData[idx], ...req.body };
      saveData();
      return res.json(recipesData[idx]);
    }
    res.status(404).json({ error: 'دستور پخت یافت نشد' });
  });

  app.delete('/api/recipes/:id', (req, res) => {
    recipesData = recipesData.filter(r => r.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // 3. Fridge
  app.get('/api/fridge', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    res.json(getUserFridge(userId));
  });

  app.post('/api/fridge', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    const fridge = getUserFridge(userId);
    const { name, quantity, unit, category, expiryDate, location } = req.body;
    const existingIndex = fridge.findIndex(item => item && item.name && item.name.trim() === name.trim());
    if (existingIndex > -1) {
      const updatedItem = {
        ...fridge[existingIndex],
        quantity: (Number(fridge[existingIndex].quantity) || 0) + (Number(quantity) || 1),
        unit: unit || fridge[existingIndex].unit,
        category: category || fridge[existingIndex].category,
        location: location || fridge[existingIndex].location || 'یخچال'
      };
      if (expiryDate) updatedItem.expiryDate = expiryDate;
      fridge.splice(existingIndex, 1);
      fridge.unshift(updatedItem);
    } else {
      fridge.unshift({
        id: 'f_' + Date.now(),
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit || 'عدد',
        category: category || 'سایـر',
        expiryDate,
        location: location || 'یخچال'
      });
    }
    userFridgeMap[userId] = fridge;
    saveData();
    res.json(fridge);
  });

  app.put('/api/fridge/:id', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    const fridge = getUserFridge(userId);
    const idx = fridge.findIndex(item => item && item.id === req.params.id);
    if (idx > -1) {
      fridge[idx] = {
        ...fridge[idx],
        ...req.body
      };
      userFridgeMap[userId] = fridge;
      saveData();
      return res.json(fridge);
    }
    res.status(404).json({ error: 'ماده اولیه در یخچال یافت نشد' });
  });

  app.delete('/api/fridge/:id', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    const fridge = getUserFridge(userId).filter(item => item.id !== req.params.id);
    userFridgeMap[userId] = fridge;
    saveData();
    res.json(fridge);
  });

  app.post('/api/fridge/sync', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    const newItems = Array.isArray(req.body)
      ? req.body
      : (Array.isArray(req.body?.items) ? req.body.items : []);
    userFridgeMap[userId] = newItems;
    saveData();
    res.json(userFridgeMap[userId]);
  });

  // 4. Meal Plan
  app.get('/api/mealplan', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    res.json(getUserMealPlan(userId));
  });

  app.post('/api/mealplan', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    userMealPlanMap[userId] = req.body;
    saveData();
    res.json(userMealPlanMap[userId]);
  });

  // 5. Shopping List
  app.get('/api/shopping', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    res.json(getUserShopping(userId));
  });

  app.post('/api/shopping', authenticateToken, (req: any, res) => {
    const userId = getReqUserId(req);
    userShoppingListMap[userId] = req.body;
    saveData();
    res.json(userShoppingListMap[userId]);
  });

  // 6. Chef Settings
  app.get('/api/chef-settings', (req, res) => {
    res.json(chefSettingsData);
  });

  app.post('/api/chef-settings', (req, res) => {
    chefSettingsData = { ...chefSettingsData, ...req.body };
    saveData();
    res.json(chefSettingsData);
  });

  function normalizePersianDigits(str: string): string {
    if (!str) return '';
    return str
      .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1776 + 48))
      .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
  }

  function formatIranianMobile(phone: string): string {
    let cleaned = normalizePersianDigits(phone).replace(/\D/g, '');
    if (cleaned.startsWith('98')) cleaned = cleaned.substring(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length === 10 && cleaned.startsWith('9')) return '0' + cleaned;
    return cleaned;
  }

  // 7. Auth & Users Management (Centralized Persistence with Bcrypt & JWT & RBAC)
  app.post('/api/auth/register', (req, res) => {
    syncUsersFromDisk();

    const { name, phone, password, email, isAdmin } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'لطفاً نام و نام خانوادگی خود را وارد کنید.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'لطفاً شماره همراه خود را وارد کنید.' });
    }

    const cleanPhone = formatIranianMobile(phone);
    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'شماره همراه وارد شده معتبر نیست. (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const existing = usersData.find(u => {
      const uPhone = formatIranianMobile(u.phone || '');
      if (uPhone && uPhone === cleanPhone) return true;
      if (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) return true;
      return false;
    });

    if (existing) {
      return res.status(400).json({
        error: 'کاربری با این شماره همراه یا ایمیل قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.'
      });
    }

    const rawPassword = (password || '123456').trim();
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    const newUser = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail || undefined,
      registeredPhone: cleanPhone,
      registeredEmail: cleanEmail || undefined,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const countBefore = usersData.length;

    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users)) {
          usersData = parsed.users;
        }
      }
      const alreadyOnDisk = usersData.some(u => u.id === newUser.id || (u.phone && cleanPhone && formatIranianMobile(u.phone) === cleanPhone) || (u.email && cleanEmail && u.email.toLowerCase() === cleanEmail));
      if (!alreadyOnDisk) {
        usersData.unshift(newUser);
      }
    } catch {
      usersData.unshift(newUser);
    }

    saveData();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, phone: newUser.phone, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const activeUser = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      registeredPhone: newUser.registeredPhone,
      registeredEmail: newUser.registeredEmail,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ success: true, token, user: activeUser });
  });

  app.post('/api/auth/login', (req, res) => {
    syncUsersFromDisk();

    const { identifier, password } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'لطفاً شماره همراه، ایمیل یا نام کاربری خود را وارد کنید.' });
    }

    const cleanInput = normalizePersianDigits(identifier).trim().toLowerCase();
    const formattedInputPhone = formatIranianMobile(cleanInput);

    const found = usersData.find(u => {
      const uPhoneFormatted = formatIranianMobile(u.phone || '');
      if (uPhoneFormatted && uPhoneFormatted === formattedInputPhone) return true;
      if (u.email && u.email.toLowerCase() === cleanInput) return true;
      if (u.name && u.name.trim().toLowerCase() === cleanInput) return true;
      return false;
    });

    if (!found) {
      return res.status(404).json({
        error: 'کاربری با این مشخصات یافت نشد. لطفاً ابتدا ثبت‌نام کنید.'
      });
    }

    if (password) {
      const cleanPassword = password.trim();
      let isMatch = false;
      const storedPass = found.password || '';
      if (storedPass.startsWith('$2')) {
        isMatch = bcrypt.compareSync(cleanPassword, storedPass);
      } else {
        // Fallback for unhashed legacy data
        isMatch = (storedPass === cleanPassword);
        if (isMatch) {
          found.password = bcrypt.hashSync(cleanPassword, 10);
          saveData();
        }
      }
      if (!isMatch) {
        return res.status(401).json({
          error: 'کلمه عبور وارد شده اشتباه است.'
        });
      }
    }

    const token = jwt.sign(
      { id: found.id, email: found.email, phone: found.phone, isAdmin: found.isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const activeUser = {
      id: found.id,
      name: found.name,
      phone: found.phone,
      email: found.email,
      birthDate: found.birthDate,
      city: found.city,
      registeredPhone: found.registeredPhone || found.phone,
      registeredEmail: found.registeredEmail || found.email,
      isAdmin: found.isAdmin,
      createdAt: found.createdAt
    };

    res.json({ success: true, token, user: activeUser });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    syncUsersFromDisk();
    const userId = req.user?.id || getReqUserId(req);
    const found = usersData.find(u => u.id === userId);
    if (!found) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    res.json({
      id: found.id,
      name: found.name,
      phone: found.phone,
      email: found.email,
      birthDate: found.birthDate,
      city: found.city,
      registeredPhone: found.registeredPhone || found.phone,
      registeredEmail: found.registeredEmail || found.email,
      isAdmin: found.isAdmin,
      createdAt: found.createdAt
    });
  });

  app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    syncUsersFromDisk();
    const safeUsers = usersData.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  });

  app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
    if (Array.isArray(req.body)) {
      return res.status(400).json({ error: 'ارسال لیست کامل کاربران غیرمجاز است' });
    }
    const newUser = req.body;
    if (!newUser || !newUser.name) {
      return res.status(400).json({ error: 'اطلاعات کاربر ناقص است' });
    }
    syncUsersFromDisk();
    const finalId = newUser.id || ('u_' + Date.now());
    if (newUser.password && !newUser.password.startsWith('$2')) {
      newUser.password = bcrypt.hashSync(newUser.password, 10);
    }
    const idx = usersData.findIndex(u => u.id === finalId || (u.phone && newUser.phone && u.phone === newUser.phone));
    if (idx !== -1) {
      usersData[idx] = { ...usersData[idx], ...newUser, id: usersData[idx].id };
    } else {
      usersData.unshift({ ...newUser, id: finalId });
    }
    saveData();
    const targetUser = idx !== -1 ? usersData[idx] : usersData.find(u => u.id === finalId);
    const { password: _, ...safeRes } = targetUser || newUser;
    res.status(201).json(safeRes);
  });

  app.put('/api/users/:id', authenticateToken, (req: any, res) => {
    syncUsersFromDisk();
    const targetId = req.params.id;
    // Users can update their own profile, or admins can update any profile
    if (!req.user?.isAdmin && req.user?.id !== targetId) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    const idx = usersData.findIndex(u => u.id === targetId);
    if (idx !== -1) {
      const { id, password, ...updates } = req.body;
      let hashed = usersData[idx].password;
      if (password && password.trim().length > 0) {
        hashed = bcrypt.hashSync(password.trim(), 10);
      }
      usersData[idx] = { ...usersData[idx], ...updates, password: hashed, id: targetId };
      saveData();
      const { password: _, ...safeRes } = usersData[idx];
      return res.json(safeRes);
    }
    res.status(404).json({ error: 'کاربر یافت نشد' });
  });

  app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    syncUsersFromDisk();
    usersData = usersData.filter(u => u.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  app.get('/api/debug/users-state', (req, res) => {
    syncUsersFromDisk();
    res.json({
      count: usersData.length,
      userIds: usersData.map(u => u.id),
      dataFilePath: DATA_FILE,
      processPid: process.pid,
      processUptime: process.uptime(),
      fingerprint: getUsersFingerprint()
    });
  });

  // 8. User Behavior Analytics & Marketing History
  app.get('/api/analytics/shopping-history', authenticateToken, (req: any, res) => {
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    const requestedUserId = req.query.userId as string;

    if (isAdmin && requestedUserId) {
      return res.json(shoppingAnalyticsHistory.filter(h => h.userId === requestedUserId));
    }
    if (isAdmin) {
      return res.json(shoppingAnalyticsHistory);
    }
    return res.json(shoppingAnalyticsHistory.filter(h => h.userId === currentUserId));
  });

  app.post('/api/analytics/shopping-history', authenticateToken, (req: any, res) => {
    const userId = req.user?.id || 'guest';
    const userObj = usersData.find(u => u.id === userId);
    const entry = {
      id: 'sh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      userName: req.body.userName || userObj?.name || 'کاربر',
      userEmail: req.body.userEmail || userObj?.email || userObj?.phone || 'مهمان',
      itemName: req.body.itemName || 'نامشخص',
      category: req.body.category || 'سایر',
      quantity: req.body.quantity || '1',
      unit: req.body.unit || 'عدد',
      action: req.body.action || 'added', // 'added' | 'purchased' | 'cleared'
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('fa-IR')
    };

    shoppingAnalyticsHistory.unshift(entry);
    // Keep last 2000 logs max to maintain optimal storage
    if (shoppingAnalyticsHistory.length > 2000) {
      shoppingAnalyticsHistory = shoppingAnalyticsHistory.slice(0, 2000);
    }
    saveData();
    res.status(201).json(entry);
  });

  app.get('/api/analytics/meal-history', authenticateToken, (req: any, res) => {
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    const requestedUserId = req.query.userId as string;

    if (isAdmin && requestedUserId) {
      return res.json(mealPlanAnalyticsHistory.filter(h => h.userId === requestedUserId));
    }
    if (isAdmin) {
      return res.json(mealPlanAnalyticsHistory);
    }
    return res.json(mealPlanAnalyticsHistory.filter(h => h.userId === currentUserId));
  });

  app.post('/api/analytics/meal-history', authenticateToken, (req: any, res) => {
    const userId = req.user?.id || 'guest';
    const userObj = usersData.find(u => u.id === userId);
    const entry = {
      id: 'mh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      userName: req.body.userName || userObj?.name || 'کاربر',
      userEmail: req.body.userEmail || userObj?.email || userObj?.phone || 'مهمان',
      dayName: req.body.dayName || 'شنبه',
      mealType: req.body.mealType || 'ناهار',
      recipeId: req.body.recipeId || '',
      recipeTitle: req.body.recipeTitle || 'غذا',
      category: req.body.category || '',
      action: req.body.action || 'selected', // 'selected' | 'removed' | 'auto_generated' | 'plan_cleared'
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('fa-IR')
    };

    mealPlanAnalyticsHistory.unshift(entry);
    if (mealPlanAnalyticsHistory.length > 2000) {
      mealPlanAnalyticsHistory = mealPlanAnalyticsHistory.slice(0, 2000);
    }
    saveData();
    res.status(201).json(entry);
  });

  // ==========================================
  // GapGPT AI Voice Assistant Endpoint
  // ==========================================
  app.post('/api/ai/voice-assistant', async (req, res) => {
    try {
      const {
        message = '',
        fridgeItems = [],
        preferences = {},
        currentMealType = ''
      } = req.body || {};

      const promptText = (typeof message === 'string' ? message : '').trim();
      if (!promptText) {
        return res.status(400).json({ error: 'پیام صوتی یا متنی کاربر خالی است.' });
      }

      // Collect context
      const fridgeListStr = Array.isArray(fridgeItems) && fridgeItems.length > 0
        ? fridgeItems.map((item: any) => `${item.name} (${item.quantity || 1} ${item.unit || 'عدد'})`).join('، ')
        : 'یخچال کاربر خالی است یا ثبت نشده';

      const dietStr = preferences?.diet || 'معمولی';
      const allergiesList = Array.isArray(preferences?.allergies) ? preferences.allergies.join('، ') : 'بدون حساسیت خاص';
      const dislikedList = Array.isArray(preferences?.dislikedIngredients) ? preferences.dislikedIngredients.join('، ') : 'ندارد';
      const servingCount = preferences?.servingDefault || 4;

      const gapGptKey = process.env.GAPGPT_API_KEY || process.env.OPENAI_API_KEY;
      const gapGptBaseUrl = process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.app/v1';
      const gapGptModel = process.env.GAPGPT_MODEL || 'gpt-4o-mini';

      let aiResult: any = null;

      // Try GapGPT if API key is provided
      if (gapGptKey) {
        try {
          const systemPrompt = `شما «سرآشپز هوشمند و دستیار صوتی اپلیکیشن سفره» هستید. 
وظیفه شما این است که به درخواست صوتی یا متنی کاربر با زبان فارسی روان، صمیمی، محترمانه و تخصصی پاسخ دهید.
اطلاعات موجودی و ترجیحات کاربر:
- موجودی فعلی یخچال کاربر: ${fridgeListStr}
- نوع رژیم غذایی: ${dietStr}
- حساسیت‌های غذایی (اکیداً از این موارد پرهیز شود): ${allergiesList}
- مواد غذایی نامحبوب: ${dislikedList}
- تعداد نفرات پیش‌فرض: ${servingCount} نفر
- وعده غذایی مورد نظر: ${currentMealType || 'تعیین‌نشده'}

شما باید دقیقاً ۳ پیشنهاد غذایی متنوع، متناسب با موجودی یخچال و مناسب ذائقه ایرانی ارائه دهید.
پاسخ شما باید صرفاً یک آبجکت JSON معتبر بدون متن اضافی باشد به این فرمت:
{
  "replyMessage": "پاسخ صوتی و متنی دوستانه و دلگرم‌کننده سرآشپز (۲ تا ۳ جمله که برای خوانده شدن با صدای هوش مصنوعی Text-to-Speech مناسب باشد)",
  "suggestions": [
    {
      "title": "نام فارسی غذا (مثلاً زرشک‌پلو با مرغ)",
      "description": "توضیح کوتاه و جذاب در مورد غذا و هماهنگی آن با مواد یخچال",
      "category": "دسته‌بندی غذا (پلو و چلو، خورشت، سوپ و آش، کوکو و کتلت، فست‌فود و...)",
      "prepTime": 15,
      "cookTime": 45,
      "difficulty": "آسان",
      "matchPercentage": 85,
      "neededFromFridge": ["مرغ", "برنج", "پیاز"],
      "missingIngredients": ["زرشک", "زعفران"],
      "instructionsSummary": "خلاصه مراحل تهیه در ۲ الی ۳ مرحله کوتاه و شفاف",
      "caloriesPerServing": 420
    }
  ]
}`;

          const response = await fetch(`${gapGptBaseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${gapGptKey}`
            },
            body: JSON.stringify({
              model: gapGptModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: promptText }
              ],
              temperature: 0.7
            })
          });

          if (response.ok) {
            const data: any = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJson);
              if (parsed && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
                aiResult = {
                  source: 'gapgpt',
                  model: gapGptModel,
                  replyMessage: parsed.replyMessage || 'سلام! با توجه به مواد موجود در یخچالتان، این ۳ پیشنهاد خوشمزه را برای شما آماده کردم:',
                  suggestions: parsed.suggestions.slice(0, 3)
                };
              }
            }
          } else {
            console.warn('[GapGPT] API response status:', response.status, await response.text());
          }
        } catch (gptErr) {
          console.warn('[GapGPT] Error calling service:', gptErr);
        }
      }

      // Intelligent Culinary Engine Fallback (if GapGPT key is missing or request failed)
      if (!aiResult) {
        aiResult = generateSmartCulinaryResponse(promptText, fridgeItems, preferences, recipesData);
      }

      res.json(aiResult);
    } catch (err: any) {
      console.error('[VoiceAssistant] Fatal handler error:', err);
      res.status(500).json({
        error: 'خطا در پردازش درخواست دستیار صوتی',
        details: err?.message
      });
    }
  });

  app.get('/api/ai/status', (req, res) => {
    const hasKey = Boolean(process.env.GAPGPT_API_KEY || process.env.OPENAI_API_KEY);
    res.json({
      enabled: hasKey,
      provider: hasKey ? 'GapGPT (فعال)' : 'موتور هوشمند محلی سفره (آماده اتصال به GapGPT)',
      model: process.env.GAPGPT_MODEL || 'gpt-4o-mini'
    });
  });

  // Helper function for smart local culinary scoring & speech formulation
  function generateSmartCulinaryResponse(
    prompt: string,
    fridgeItems: any[],
    preferences: any,
    catalog: Recipe[]
  ) {
    const promptLower = prompt.toLowerCase();
    const fridgeNames = fridgeItems.map(i => (i.name || '').toLowerCase());
    
    // Extract keywords from prompt
    const mentionedIngredients = fridgeNames.filter(name => name && promptLower.includes(name));
    
    // Score all catalog recipes
    const scored = catalog.map(recipe => {
      let score = 0;
      const neededFromFridge: string[] = [];
      const missingIngredients: string[] = [];

      recipe.ingredients.forEach(ing => {
        const ingName = (ing.name || '').toLowerCase();
        const isInFridge = fridgeNames.some(fn => fn.includes(ingName) || ingName.includes(fn));
        if (isInFridge) {
          score += 15;
          neededFromFridge.push(ing.name);
        } else {
          missingIngredients.push(ing.name);
        }
      });

      // Bonus if prompt mentions recipe title or ingredients
      if (promptLower.includes((recipe.title || '').toLowerCase())) {
        score += 40;
      }
      if (promptLower.includes((recipe.category || '').toLowerCase())) {
        score += 20;
      }

      // Preference matching
      if (preferences?.diet && preferences.diet !== 'همه' && preferences.diet !== 'معمولی') {
        const diet = (recipe.diet || '').toLowerCase();
        if (diet.includes(preferences.diet.toLowerCase())) {
          score += 15;
        }
      }

      // Check allergies penalty
      if (Array.isArray(preferences?.allergies) && preferences.allergies.length > 0) {
        const hasAllergy = recipe.ingredients.some(ing => 
          preferences.allergies.some((a: string) => (ing.name || '').includes(a))
        );
        if (hasAllergy) {
          score -= 100;
        }
      }

      const matchPct = recipe.ingredients.length > 0
        ? Math.min(100, Math.round((neededFromFridge.length / recipe.ingredients.length) * 100))
        : 50;

      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description || `یک غذای خوش‌طعم و اصیل با ${neededFromFridge.slice(0, 2).join(' و ')}`,
        category: recipe.category || 'غذای اصلی',
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 35,
        difficulty: recipe.difficulty || 'متوسط',
        matchPercentage: matchPct,
        neededFromFridge: neededFromFridge.length > 0 ? neededFromFridge : (recipe.ingredients.slice(0, 3).map(i => i.name)),
        missingIngredients: missingIngredients.slice(0, 4),
        instructionsSummary: Array.isArray(recipe.instructions)
          ? recipe.instructions.slice(0, 3).join(' ')
          : 'مواد را تفت داده و پس از پخت با چاشنی دلخواه سرو نمایید.',
        caloriesPerServing: recipe.calories || 380,
        score
      };
    });

    // Sort by score and pick top 3
    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    // Formulate pleasant conversational Persian response for Text-To-Speech (TTS)
    let replyMessage = '';
    if (top3.length > 0) {
      const topTitle = top3[0].title;
      const topPct = top3[0].matchPercentage;
      replyMessage = `سلام! بر اساس درخواست شما و موجودی یخچالتان، پیشنهاد اول من «${topTitle}» با تطابق ${topPct} درصدی است. همچنین «${top3[1]?.title || 'یک گزینه عالی دیگر'}» و «${top3[2]?.title || 'یک پیشنهاد جذاب'}» هم برای پخت آماده هستند. نوش جان!`;
    } else {
      replyMessage = 'سلام! بر اساس صحبت‌های شما و مواد موجود در یخچال، این ۳ پیشنهاد را برای شما انتخاب کردم:';
    }

    return {
      source: 'culinary_engine',
      replyMessage,
      suggestions: top3
    };
  }

  app.get('/api/analytics/summary', (req, res) => {
    // Top Shopping Items Calculation
    const shopItemCounts: Record<string, number> = {};
    shoppingAnalyticsHistory.forEach(item => {
      if (item.itemName && item.action !== 'cleared') {
        const key = item.itemName.trim();
        shopItemCounts[key] = (shopItemCounts[key] || 0) + 1;
      }
    });

    const topShoppingItems = Object.entries(shopItemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Top Meal Recipes Calculation
    const recipeCounts: Record<string, number> = {};
    mealPlanAnalyticsHistory.forEach(item => {
      if (item.recipeTitle && item.action === 'selected') {
        const key = item.recipeTitle.trim();
        recipeCounts[key] = (recipeCounts[key] || 0) + 1;
      }
    });

    const topRecipes = Object.entries(recipeCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Unique Active Users in History
    const activeUserIds = new Set([
      ...shoppingAnalyticsHistory.map(s => s.userId),
      ...mealPlanAnalyticsHistory.map(m => m.userId)
    ]);

    res.json({
      totalShoppingLogs: shoppingAnalyticsHistory.length,
      totalMealLogs: mealPlanAnalyticsHistory.length,
      activeUsersCount: activeUserIds.size,
      topShoppingItems,
      topRecipes,
      shoppingHistory: shoppingAnalyticsHistory.slice(0, 300),
      mealHistory: mealPlanAnalyticsHistory.slice(0, 300)
    });
  });

  // Dedicated file download endpoints
  app.get('/api/download/ingredients-csv', (req, res) => {
    const csvPath = path.join(process.cwd(), 'public', 'sofreh_ingredients_database.csv');
    if (fs.existsSync(csvPath)) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="sofreh_ingredients_database.csv"');
      res.sendFile(csvPath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  app.get('/api/download/ingredients-json', (req, res) => {
    const jsonPath = path.join(process.cwd(), 'public', 'sofreh_ingredients_database.json');
    if (fs.existsSync(jsonPath)) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="sofreh_ingredients_database.json"');
      res.sendFile(jsonPath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  app.get('/api/download/ingredients-html', (req, res) => {
    const htmlPath = path.join(process.cwd(), 'public', 'sofreh_ingredients_database.html');
    if (fs.existsSync(htmlPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(htmlPath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite module not found, falling back to static file server');
      serveStaticFiles();
    }
  } else {
    serveStaticFiles();
  }

  function serveStaticFiles() {
    const distPath = fs.existsSync(path.join(_dirname, 'index.html'))
      ? _dirname
      : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = fs.existsSync(path.join(distPath, 'index.html'))
        ? path.join(distPath, 'index.html')
        : path.join(process.cwd(), 'dist', 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sofreh server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
